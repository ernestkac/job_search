import { Request, Response } from "express";
import {
  getCandidateProfile,
  updateCandidateProfile,
} from "../models/candidateProfile";

import { CandidateProfile } from "../../src/types";
import { parseCvWithGemini } from "../services/gemini";

export let candidateProfile: CandidateProfile;

export const getProfile = async (req: Request, res: Response) => {
  const googleId = (req as any).user!.googleId;
  res.json({
    success: true,
    profile: await getCandidateProfile(googleId),
  });
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const updatedProfile = req.body;
    const googleId = (req as any).user!.googleId;
    if (!updatedProfile || !updatedProfile.fullName) {
      return res.status(400).json({
        success: false,
        error: "Valid candidate profile object is required.",
      });
    }
    let candidateProfile = {
      ...(await getCandidateProfile(googleId)),
      ...updatedProfile,
      lastUpdated: new Date().toISOString(),
    };
    updateCandidateProfile(googleId, candidateProfile).catch((err) => {
      console.error("Error updating candidate profile in database:", err);
    });
    res.json({
      success: true,
      profile: candidateProfile,
      message: "Profile saved successfully.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const parseCandidateCv = async (req: Request, res: Response) => {
  try {
    const { rawText, fileBase64, mimeType } = req.body;
    const googleId = (req as any).user!.googleId;
    if (!rawText && !fileBase64) {
      return res.status(400).json({
        success: false,
        error: "Either CV text content or uploaded file base64 is required.",
      });
    }

    const parsedData: Partial<CandidateProfile> = await parseCvWithGemini(
      rawText,
      fileBase64,
      mimeType,
    );

    let candidateProfile = {
      ...(await getCandidateProfile(googleId)),
      ...parsedData,
      lastUpdated: new Date().toISOString(),
    };

    await updateCandidateProfile(googleId, candidateProfile);

    res.json({
      success: true,
      profile: await getCandidateProfile(googleId),
      parsedData,
      message: "CV successfully analyzed and candidate profile created.",
    });
  } catch (error: any) {
    console.error("CV Parsing Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze CV with AI.",
    });
  }
};
