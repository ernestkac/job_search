import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import {
  saveCandidateProfile,
  getCandidateProfile,
  updateCandidateProfile,
  getGmailCredentials,
  updateGmailCredentials,
} from "../models/candidateProfile";
import { INITIAL_CANDIDATE_PROFILE } from "@/src/data/mockJobs";
import { CandidateProfile } from "@/src/types";

const clientId =
  process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
const clientSecret =
  process.env.GOOGLE_CLIENT_SECRET || process.env.VITE_GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI || "postmessage";

export const verifyGoogleToken = async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    console.error("Missing Google authorization code in request body");
    return res.status(400).json({
      error: "Missing Google authorization code",
    });
  }

  if (!clientId || !clientSecret) {
    console.error(
      "Google OAuth client credentials are not configured on the server",
    );
    return res.status(500).json({
      error: "Google OAuth is not configured on the server",
    });
  }

  const googleClient = new OAuth2Client(clientId, clientSecret, redirectUri);

  try {
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: redirectUri,
    });
    const idToken = tokens.id_token;

    if (!idToken) {
      console.error("Google authorization code did not return an ID token");
      return res.status(401).json({
        error: "Google authorization did not return an ID token",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      console.error("Invalid Google token payload");
      return res.status(401).json({
        error: "Invalid Google token",
      });
    }

    const googleId = payload.sub;
    const email = payload.email;
    const fullName = payload.name;
    const picture = payload.picture;
    const partialCandidate: Partial<CandidateProfile> = {
      email,
      fullName,
      photoUrl: picture ?? "",
    };
    const candidate: CandidateProfile = {
      ...INITIAL_CANDIDATE_PROFILE,
      ...partialCandidate,
    };

    let storedCandidate = await getCandidateProfile(googleId);

    if (!storedCandidate) {
      await saveCandidateProfile(googleId, undefined, picture ?? "", candidate);
    } else {
      await updateCandidateProfile(googleId, candidate);
    }

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

    return res.json({
      status: "ok",
      token,
      candidate: storedCandidate,
      storedCandidate,
    });
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.error_description ||
      error?.message ||
      "Unable to complete Google authorization";

    console.error("Google authorization error", errorMessage);
    return res.status(401).json({
      error: errorMessage,
    });
  }
};

export const verifyGmailAuthorization = async (req: Request, res: Response) => {
  const googleId = (req as any).user?.googleId;
  const { code } = req.body;

  if (!googleId) {
    return res.status(401).json({
      success: false,
      error: "Authentication required.",
    });
  }

  if (!code) {
    return res.status(400).json({
      success: false,
      error: "Missing Google authorization code.",
    });
  }

  if (!clientId || !clientSecret) {
    return res.status(500).json({
      success: false,
      error: "Google OAuth is not configured on the server",
    });
  }

  const googleClient = new OAuth2Client(clientId, clientSecret, redirectUri);

  try {
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: redirectUri,
    });

    const existingCredentials = await getGmailCredentials(googleId);
    const refreshToken =
      tokens.refresh_token || existingCredentials?.refreshToken || "";

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: "Google did not return a Gmail refresh token.",
      });
    }

    await updateGmailCredentials(googleId, {
      refreshToken,
      accessToken: tokens.access_token || existingCredentials?.accessToken,
      expiryDate: tokens.expiry_date || existingCredentials?.expiryDate,
    });

    return res.json({
      success: true,
      message: "Gmail authorization completed.",
    });
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.error_description ||
      error?.message ||
      "Unable to complete Gmail authorization";

    console.error("Gmail authorization error", errorMessage);
    return res.status(401).json({
      success: false,
      error: errorMessage,
    });
  }
};
