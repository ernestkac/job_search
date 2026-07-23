import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { INITIAL_CANDIDATE_PROFILE, INITIAL_MOCK_JOBS } from "./src/data/mockJobs";
import { CandidateProfile, JobListing, TrackedApplication } from "./src/types";
import { analyzeJobMatchWithGemini, generateCoverLetterWithGemini, parseCvWithGemini } from "./server/gemini";
import { fetchJobSearchMalawiJobs, scrapeSingleJobUrl } from "./server/scraper";

// In-memory data persistence store
let storedCandidateProfile: CandidateProfile = { ...INITIAL_CANDIDATE_PROFILE };
let storedJobListings: JobListing[] = [...INITIAL_MOCK_JOBS];
let storedApplications: TrackedApplication[] = [
  {
    id: "app-init-001",
    jobId: "job-mw-001",
    jobTitle: "Senior ICT Infrastructure & Systems Administrator",
    employer: "National Bank of Malawi Plc",
    location: "Blantyre, Malawi",
    status: "Interested",
    applicationDate: "2026-07-22",
    closingDate: "2026-08-15",
    applicationContact: "vacancies@natbank.mw",
    notes: "Requires MCSA or RHCSA certification. Verified background alignment.",
    updatedAt: new Date().toISOString()
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with 10mb payload limit for base64 CV files
  app.use(express.json({ limit: "10mb" }));

  // ==========================================
  // API ROUTES (MUST COME FIRST)
  // ==========================================

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), service: "AI Job Finder & Application Assistant" });
  });

  // GET /api/jobs - List active ICT job opportunities
  app.get("/api/jobs", async (req, res) => {
    try {
      const refresh = req.query.refresh === "true";
      const fetchedJobs = await fetchJobSearchMalawiJobs(refresh);
      storedJobListings = fetchedJobs;
      res.json({ success: true, jobs: storedJobListings, count: storedJobListings.length });
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to fetch jobs." });
    }
  });

  // POST /api/jobs/scrape-url - Ingest specific vacancy URL from jobsearchmalawi.com
  app.post("/api/jobs/scrape-url", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ success: false, error: "URL parameter is required." });
      }

      const scrapedJob = await scrapeSingleJobUrl(url);
      if (!scrapedJob) {
        return res.status(404).json({ success: false, error: "Could not extract vacancy details from URL." });
      }

      // De-duplicate against stored jobs
      const existsIndex = storedJobListings.findIndex(j => j.fingerprint === scrapedJob.fingerprint || j.url === url);
      if (existsIndex >= 0) {
        storedJobListings[existsIndex] = scrapedJob;
      } else {
        storedJobListings.unshift(scrapedJob);
      }

      res.json({ success: true, job: scrapedJob, message: "Successfully ingested job vacancy." });
    } catch (error: any) {
      console.error("Error scraping job URL:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to parse URL." });
    }
  });

  // GET /api/profile - Fetch candidate profile
  app.get("/api/profile", (_req, res) => {
    res.json({ success: true, profile: storedCandidateProfile });
  });

  // POST /api/profile - Save/update candidate profile
  app.post("/api/profile", (req, res) => {
    try {
      const updatedProfile = req.body;
      if (!updatedProfile || !updatedProfile.fullName) {
        return res.status(400).json({ success: false, error: "Valid candidate profile object is required." });
      }
      storedCandidateProfile = {
        ...updatedProfile,
        lastUpdated: new Date().toISOString()
      };
      res.json({ success: true, profile: storedCandidateProfile, message: "Profile saved successfully." });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/profile/parse-cv - Parse uploaded CV (PDF/DOCX/Text) with Gemini AI
  app.post("/api/profile/parse-cv", async (req, res) => {
    try {
      const { rawText, fileBase64, mimeType } = req.body;
      if (!rawText && !fileBase64) {
        return res.status(400).json({ success: false, error: "Either CV text content or uploaded file base64 is required." });
      }

      const parsedData = await parseCvWithGemini(rawText, fileBase64, mimeType);

      // Merge parsed data into candidate profile
      storedCandidateProfile = {
        ...storedCandidateProfile,
        ...parsedData,
        lastUpdated: new Date().toISOString()
      } as CandidateProfile;

      res.json({
        success: true,
        profile: storedCandidateProfile,
        parsedData,
        message: "CV successfully analyzed and candidate profile created."
      });
    } catch (error: any) {
      console.error("CV Parsing Error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to analyze CV with AI." });
    }
  });

  // POST /api/jobs/match - Analyze compatibility between profile and job
  app.post("/api/jobs/match", async (req, res) => {
    try {
      const { jobId, customJob } = req.body;
      const targetJob: JobListing | undefined = customJob || storedJobListings.find(j => j.id === jobId);

      if (!targetJob) {
        return res.status(404).json({ success: false, error: "Job listing not found." });
      }

      const matchAnalysis = await analyzeJobMatchWithGemini(storedCandidateProfile, targetJob);
      res.json({ success: true, match: matchAnalysis });
    } catch (error: any) {
      console.error("Job Matching Error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to run job match analysis." });
    }
  });

  // POST /api/jobs/generate-letter - Generate tailored cover application letter
  app.post("/api/jobs/generate-letter", async (req, res) => {
    try {
      const { jobId, customNote, customJob } = req.body;
      const targetJob: JobListing | undefined = customJob || storedJobListings.find(j => j.id === jobId);

      if (!targetJob) {
        return res.status(404).json({ success: false, error: "Job listing not found." });
      }

      const generatedLetter = await generateCoverLetterWithGemini(storedCandidateProfile, targetJob, customNote);

      // Automatically record/update tracked application state
      let appRecord = storedApplications.find(a => a.jobId === targetJob.id);
      if (appRecord) {
        appRecord.generatedLetter = generatedLetter;
        appRecord.status = appRecord.status === "New" || appRecord.status === "Interested" ? "Letter Generated" : appRecord.status;
        appRecord.updatedAt = new Date().toISOString();
      } else {
        appRecord = {
          id: `app-${Date.now()}`,
          jobId: targetJob.id,
          jobTitle: targetJob.title,
          employer: targetJob.employer,
          location: targetJob.location,
          status: "Letter Generated",
          applicationDate: new Date().toISOString().split("T")[0],
          closingDate: targetJob.closingDate,
          applicationContact: targetJob.applicationMethod,
          generatedLetter: generatedLetter,
          updatedAt: new Date().toISOString()
        };
        storedApplications.push(appRecord);
      }

      res.json({
        success: true,
        letter: generatedLetter,
        applicationRecord: appRecord,
        message: "Application letter generated successfully."
      });
    } catch (error: any) {
      console.error("Letter Generation Error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to generate application letter." });
    }
  });

  // GET /api/applications - List tracked job applications
  app.get("/api/applications", (_req, res) => {
    res.json({ success: true, applications: storedApplications, count: storedApplications.length });
  });

  // POST /api/applications - Create or update tracked application
  app.post("/api/applications", (req, res) => {
    try {
      const appData: TrackedApplication = req.body;
      if (!appData.jobId) {
        return res.status(400).json({ success: false, error: "Job ID is required." });
      }

      const index = storedApplications.findIndex(a => a.id === appData.id || a.jobId === appData.jobId);
      if (index >= 0) {
        storedApplications[index] = {
          ...storedApplications[index],
          ...appData,
          updatedAt: new Date().toISOString()
        };
      } else {
        storedApplications.push({
          ...appData,
          id: appData.id || `app-${Date.now()}`,
          updatedAt: new Date().toISOString()
        });
      }

      res.json({ success: true, applications: storedApplications, message: "Application tracked successfully." });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE /api/applications/:id - Remove tracked application
  app.delete("/api/applications/:id", (req, res) => {
    const { id } = req.params;
    storedApplications = storedApplications.filter(a => a.id !== id);
    res.json({ success: true, applications: storedApplications, message: "Application removed from tracker." });
  });

  // ==========================================
  // VITE & STATIC FILES MIDDLEWARE
  // ==========================================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
