import { Router } from "express";
import applicationRoutes from "./application.routes";
import candidateRoutes from "./candidate.routes";
import jobsRoutes from "./jobs.routes";

const router = Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "AI Job Finder & Application Assistant",
  });
});

// Mount the application routes under /api/applications
router.use("/applications", applicationRoutes);

// Mount the candidate routes under /api/candidates
router.use("/candidates", candidateRoutes);

// Mount the jobs routes under /api/jobs
router.use("/jobs", jobsRoutes);

export default router;
