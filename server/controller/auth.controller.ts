import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import {
  saveCandidateProfile,
  getCandidateProfile,
} from "../models/candidateProfile";
import { INITIAL_CANDIDATE_PROFILE } from "@/src/data/mockJobs";
import { CandidateProfile } from "@/src/types";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    console.error("Missing Google ID token in request body");
    return res.status(400).json({
      error: "Missing Google ID token",
    });
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    console.error("Invalid Google ID token");
    return res.status(401).json({
      error: "Invalid Google token",
    });
  }

  const googleId = payload.sub;
  const email = payload.email;
  const fullName = payload.name;
  const picture = payload.picture;
  const emailVerified = payload.email_verified;

  let patialCandidate: Partial<CandidateProfile> = { email, fullName };
  let candidate: CandidateProfile = {
    ...INITIAL_CANDIDATE_PROFILE,
    ...patialCandidate,
  };

  let storedCandidate = await getCandidateProfile(googleId);

  if (!storedCandidate)
    await saveCandidateProfile(googleId, picture ?? "", candidate);

  storedCandidate = await getCandidateProfile(googleId);

  const token = jwt.sign(
    {
      googleId,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    },
  );

  res.json({
    status: "ok",
    token,
    storedCandidate,
  });
};
