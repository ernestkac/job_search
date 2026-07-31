import "dotenv/config";
import {
  getTrackedApplications,
  trackNewApplication,
  updateTrackedApplication,
  deleteTrackedApplication,
} from "../models/applications";
import { TrackedApplication } from "../../src/types";
import { Request, Response } from "express";

export const getApplications = async (req: Request, res: Response) => {
  console.log("Fetching tracked applications...");
  const googleId = (req as any).user!.googleId;
  let storedApplications = await getTrackedApplications(googleId);
  res.json({
    success: true,
    applications: storedApplications,
    count: storedApplications.length,
  });
};

export const trackApplication = async (req: Request, res: Response) => {
  try {
    const appData: TrackedApplication = req.body;
    const googleId = (req as any).user!.googleId;
    let storedApplications = await getTrackedApplications(googleId);
    if (!appData.jobId) {
      return res
        .status(400)
        .json({ success: false, error: "Job ID is required." });
    }
    console.log(`Tracking application for Job ID: ${appData.jobId}`);
    const index = storedApplications.findIndex(
      (a) => a.id === appData.id || a.jobId === appData.jobId,
    );
    if (index >= 0) {
      storedApplications[index] = {
        ...storedApplications[index],
        ...appData,
        updatedAt: new Date().toISOString(),
      };
      console.log(
        `Updating tracked application with ID: ${storedApplications[index].id}`,
      );
      await updateTrackedApplication(googleId, storedApplications[index].id, {
        ...appData,
      }).catch((err) => {
        console.error("Error updating tracked application in database:", err);
      });
    } else {
      storedApplications.push({
        ...appData,
        id: appData.id || `app-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      });
      await trackNewApplication(
        googleId,
        storedApplications[storedApplications.length - 1],
      ).catch((err) => {
        console.error("Error saving tracked application to database:", err);
      });
    }

    res.json({
      success: true,
      applications: storedApplications,
      message: "Application tracked successfully.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`Removing tracked application with ID: ${id}`);
  const googleId = (req as any).user!.googleId;
  let storedApplications = await getTrackedApplications(googleId);
  storedApplications = storedApplications.filter((a) => a.id !== id);
  await deleteTrackedApplication(googleId, id).catch((err) => {
    console.error("Error deleting tracked application from database:", err);
  });
  res.json({
    success: true,
    applications: storedApplications,
    message: "Application removed from tracker.",
  });
};
