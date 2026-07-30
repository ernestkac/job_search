import { Router } from "express";
import {
  listJobs,
  scrapeJobUrl,
  matchJobs,
  generateCoverLetter,
} from "../controller/jobs.controller";

const router = Router();

// GET /api/jobs - List active ICT job opportunities
router.get("/", listJobs);

// POST /api/jobs/scrape-url - Ingest specific vacancy URL from jobsearchmalawi.com
router.post("/scrape-url", scrapeJobUrl);

// POST /api/jobs/match - Match candidate profile with job listings
router.post("/match", matchJobs);

// POST /api/jobs/generate-letter - Generate cover letter for a job application
router.post("/generate-letter", generateCoverLetter);

export default router;
