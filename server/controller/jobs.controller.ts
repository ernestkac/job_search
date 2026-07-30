import { Request, Response } from "express";
import { getJobs, saveJob, updateJob } from "../models/jobs";
import { storedApplications } from "./application.controller";
import {
  analyzeJobMatchWithGemini,
  generateCoverLetterWithGemini,
} from "../services/gemini";

import { JobListing } from "../../src/types";

import { fetchJobSearchMalawiJobs, scrapeSingleJobUrl } from "../utils/scraper";
import { storedCandidateProfile } from "./candidate.controller";
import {
  trackNewApplication,
  updateTrackedApplication,
} from "../models/applications";

let storedJobListings: JobListing[] = await getJobs();
console.log(storedJobListings);

export const listJobs = async (req: Request, res: Response) => {
  try {
    const refresh = req.query.refresh === "true";
    if (refresh) {
      const fetchedJobs = await fetchJobSearchMalawiJobs(refresh);
      await Promise.all(fetchedJobs.map((job) => saveJob(job)));
    }
    storedJobListings = await getJobs();

    res.json({
      success: true,
      jobs: storedJobListings,
      count: storedJobListings.length,
    });
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch jobs.",
    });
  }
};

export const scrapeJobUrl = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res
        .status(400)
        .json({ success: false, error: "URL parameter is required." });
    }

    const scrapedJob = await scrapeSingleJobUrl(url);
    if (!scrapedJob) {
      return res.status(404).json({
        success: false,
        error: "Could not extract vacancy details from URL.",
      });
    }

    // De-duplicate against stored jobs
    const existsIndex = storedJobListings.findIndex(
      (j) => j.fingerprint === scrapedJob.fingerprint || j.url === url,
    );
    if (existsIndex >= 0) {
      storedJobListings[existsIndex] = scrapedJob;
      await updateJob(scrapedJob.id, scrapedJob);
    } else {
      await saveJob(scrapedJob);
      storedJobListings.push(scrapedJob);
    }

    res.json({
      success: true,
      job: scrapedJob,
      message: "Successfully ingested job vacancy.",
    });
  } catch (error: any) {
    console.error("Error scraping job URL:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to parse URL.",
    });
  }
};

export const matchJobs = async (req: Request, res: Response) => {
  try {
    const { jobId, customJob } = req.body;
    const targetJob: JobListing | undefined =
      customJob || storedJobListings.find((j) => j.id === jobId);

    if (!targetJob) {
      return res
        .status(404)
        .json({ success: false, error: "Job listing not found." });
    }

    const matchAnalysis = await analyzeJobMatchWithGemini(
      storedCandidateProfile,
      targetJob,
    );
    res.json({ success: true, match: matchAnalysis });
  } catch (error: any) {
    console.error("Job Matching Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to run job match analysis.",
    });
  }
};

export const generateCoverLetter = async (req: Request, res: Response) => {
  try {
    const { jobId, customNote, customJob } = req.body;
    const targetJob: JobListing | undefined =
      customJob || storedJobListings.find((j) => j.id === jobId);

    if (!targetJob) {
      return res
        .status(404)
        .json({ success: false, error: "Job listing not found." });
    }

    const generatedLetter = await generateCoverLetterWithGemini(
      storedCandidateProfile,
      targetJob,
      customNote,
    );

    // Automatically record/update tracked application state
    let appRecord = storedApplications.find((a) => a.jobId === targetJob.id);
    if (appRecord) {
      appRecord.generatedLetter = generatedLetter;
      appRecord.status =
        appRecord.status === "New" || appRecord.status === "Interested"
          ? "Letter Generated"
          : appRecord.status;
      appRecord.updatedAt = new Date().toISOString();

      await updateTrackedApplication(appRecord.id, {
        generatedLetter: generatedLetter,
        status: appRecord.status,
      }).catch((err) => {
        console.error("Error updating tracked application:", err);
      });
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
        updatedAt: new Date().toISOString(),
      };
      storedApplications.push(appRecord);
      await trackNewApplication(appRecord).catch((err) => {
        console.error("Error saving tracked application to database:", err);
      });
    }

    res.json({
      success: true,
      letter: generatedLetter,
      applicationRecord: appRecord,
      message: "Application letter generated successfully.",
    });
  } catch (error: any) {
    console.error("Letter Generation Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate application letter.",
    });
  }
};
