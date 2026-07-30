import { Request, Response } from "express";
import {
  getCandidateProfile,
  saveCandidateProfile,
  updateCandidateProfile,
} from "../models/candidateProfile";

import { INITIAL_CANDIDATE_PROFILE } from "../../src/data/mockJobs";
import { CandidateProfile } from "../../src/types";
import { parseCvWithGemini } from "../services/gemini";

let profileId = 1;
export let storedCandidateProfile: CandidateProfile;

try {
  const existingProfile = (await getCandidateProfile(
    profileId,
  )) as CandidateProfile | null;

  if (existingProfile && Object.keys(existingProfile).length > 0) {
    storedCandidateProfile = existingProfile;
  } else {
    storedCandidateProfile = {
      ...INITIAL_CANDIDATE_PROFILE,
    };

    await saveCandidateProfile(storedCandidateProfile);
  }
} catch (err) {
  console.error("Error retrieving candidate profile:", err);

  storedCandidateProfile = {
    ...INITIAL_CANDIDATE_PROFILE,
  };

  await saveCandidateProfile(storedCandidateProfile);
}

export const getProfile = async (req: Request, res: Response) => {
  res.json({ success: true, profile: storedCandidateProfile });
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const updatedProfile = req.body;
    if (!updatedProfile || !updatedProfile.fullName) {
      return res.status(400).json({
        success: false,
        error: "Valid candidate profile object is required.",
      });
    }
    storedCandidateProfile = {
      ...updatedProfile,
      lastUpdated: new Date().toISOString(),
    };
    updateCandidateProfile(profileId, storedCandidateProfile).catch((err) => {
      console.error("Error updating candidate profile in database:", err);
    });
    res.json({
      success: true,
      profile: storedCandidateProfile,
      message: "Profile saved successfully.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const parseCandidateCv = async (req: Request, res: Response) => {
  try {
    const { rawText, fileBase64, mimeType } = req.body;
    if (!rawText && !fileBase64) {
      return res.status(400).json({
        success: false,
        error: "Either CV text content or uploaded file base64 is required.",
      });
    }

    const parsedData = await parseCvWithGemini(rawText, fileBase64, mimeType);

    // Merge parsed data into candidate profile
    storedCandidateProfile = {
      ...storedCandidateProfile,
      ...parsedData,
      lastUpdated: new Date().toISOString(),
    } as CandidateProfile;

    res.json({
      success: true,
      profile: storedCandidateProfile,
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
