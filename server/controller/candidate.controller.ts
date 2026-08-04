import { Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";
import {
  getCandidateProfile,
  updateCandidateProfile,
} from "../models/candidateProfile";

import { CandidateProfile } from "../../src/types";
import { parseCvWithGemini } from "../services/gemini";

export let candidateProfile: CandidateProfile;

const CERTIFICATE_UPLOAD_DIR = path.join(
  process.cwd(),
  "uploads",
  "certificates",
);

async function saveCertificateToFile(googleId: string, certificate: any) {
  if (
    !certificate?.fileDataUrl ||
    typeof certificate.fileDataUrl !== "string"
  ) {
    return certificate;
  }

  if (certificate.filePath) {
    return {
      ...certificate,
      name: certificate.name || certificate.fileName || "Certificate",
      fileName: certificate.fileName || certificate.name || "certificate",
      mimeType: certificate.mimeType || "application/pdf",
      fileSize: certificate.fileSize || 0,
      uploadedAt: certificate.uploadedAt || new Date().toISOString(),
      fileDataUrl: undefined,
    };
  }

  const match = certificate.fileDataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    return certificate;
  }

  const mimeType = match[1] || certificate.mimeType || "application/pdf";
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");

  const safeName = (certificate.fileName || certificate.name || "certificate")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_");
  const extension =
    path.extname(safeName) || (mimeType.includes("pdf") ? ".pdf" : "");
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
  const userDir = path.join(CERTIFICATE_UPLOAD_DIR, googleId);

  await fs.mkdir(userDir, { recursive: true });
  const filePath = path.join(userDir, fileName);
  await fs.writeFile(filePath, buffer);

  return {
    ...certificate,
    name: certificate.name || certificate.fileName || "Certificate",
    fileName: certificate.fileName || safeName || fileName,
    filePath: path.relative(process.cwd(), filePath).split(path.sep).join("/"),
    mimeType,
    fileSize: buffer.byteLength,
    uploadedAt: certificate.uploadedAt || new Date().toISOString(),
    fileDataUrl: undefined,
  };
}

async function normalizeCertificates(
  googleId: string,
  certificates: any[] = [],
) {
  return Promise.all(
    certificates.map((certificate) =>
      saveCertificateToFile(googleId, certificate),
    ),
  );
}

async function normalizeProfileCertificates(
  googleId: string,
  profileData: any,
) {
  if (!profileData || typeof profileData !== "object") {
    return profileData;
  }

  const normalizedProfileData = { ...profileData };
  if (Array.isArray(normalizedProfileData.certificates)) {
    normalizedProfileData.certificates = await normalizeCertificates(
      googleId,
      normalizedProfileData.certificates,
    );
  }

  return normalizedProfileData;
}

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

    const existingProfile = (await getCandidateProfile(googleId)) as any;
    const existingCertificates = Array.isArray(existingProfile?.certificates)
      ? existingProfile.certificates
      : [];
    const incomingCertificates = Array.isArray(updatedProfile.certificates)
      ? updatedProfile.certificates
      : [];

    const removedCertificates = existingCertificates.filter(
      (existingCert: any) =>
        !incomingCertificates.some(
          (incomingCert: any) =>
            incomingCert?.filePath &&
            incomingCert.filePath === existingCert.filePath,
        ),
    );

    await Promise.all(
      removedCertificates.map(async (certificate: any) => {
        if (!certificate?.filePath) return;
        const absolutePath = path.isAbsolute(certificate.filePath)
          ? certificate.filePath
          : path.join(process.cwd(), certificate.filePath);
        await fs.rm(absolutePath, { force: true });
      }),
    );

    const normalizedProfilePayload = await normalizeProfileCertificates(
      googleId,
      updatedProfile,
    );

    const candidateProfile = {
      ...(existingProfile || {}),
      ...normalizedProfilePayload,
      lastUpdated: new Date().toISOString(),
    };

    await updateCandidateProfile(googleId, candidateProfile);

    res.json({
      success: true,
      profile: candidateProfile,
      message: "Profile saved successfully.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const uploadCertificate = async (req: Request, res: Response) => {
  try {
    const googleId = (req as any).user!.googleId;
    const { fileName, mimeType, fileDataUrl } = req.body || {};

    if (!fileDataUrl) {
      return res.status(400).json({
        success: false,
        error: "Certificate file data is required.",
      });
    }

    const certificate = await saveCertificateToFile(googleId, {
      fileName,
      name: fileName,
      mimeType,
      fileDataUrl,
      uploadedAt: new Date().toISOString(),
    });

    const existingProfile = (await getCandidateProfile(googleId)) as any;
    const existingCertificates = Array.isArray(existingProfile?.certificates)
      ? existingProfile.certificates
      : [];

    const updatedProfile = {
      ...(existingProfile || {}),
      certificates: [
        ...existingCertificates.filter(
          (entry: any) => entry?.filePath !== certificate.filePath,
        ),
        certificate,
      ],
      lastUpdated: new Date().toISOString(),
    };

    await updateCandidateProfile(googleId, updatedProfile);

    res.json({
      success: true,
      certificate,
      profile: updatedProfile,
      message: "Certificate uploaded successfully.",
    });
  } catch (error: any) {
    console.error("Certificate upload failed:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to upload certificate.",
    });
  }
};

export const removeCertificate = async (req: Request, res: Response) => {
  try {
    const googleId = (req as any).user!.googleId;
    const { certificateId } = req.params || {};

    if (!certificateId) {
      return res.status(400).json({
        success: false,
        error: "Certificate identifier is required.",
      });
    }

    const existingProfile = (await getCandidateProfile(googleId)) as any;
    const existingCertificates = Array.isArray(existingProfile?.certificates)
      ? existingProfile.certificates
      : [];
    const targetCertificate = existingCertificates.find(
      (certificate: any) => certificate?.id === certificateId,
    );

    if (!targetCertificate) {
      return res.status(404).json({
        success: false,
        error: "Certificate not found.",
      });
    }

    if (targetCertificate.filePath) {
      const absolutePath = path.isAbsolute(targetCertificate.filePath)
        ? targetCertificate.filePath
        : path.join(process.cwd(), targetCertificate.filePath);
      await fs.rm(absolutePath, { force: true });
    }

    const updatedProfile = {
      ...(existingProfile || {}),
      certificates: existingCertificates.filter(
        (certificate: any) => certificate?.id !== certificateId,
      ),
      lastUpdated: new Date().toISOString(),
    };

    await updateCandidateProfile(googleId, updatedProfile);

    res.json({
      success: true,
      profile: updatedProfile,
      message: "Certificate removed successfully.",
    });
  } catch (error: any) {
    console.error("Certificate removal failed:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to remove certificate.",
    });
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

    const normalizedParsedData = await normalizeProfileCertificates(
      googleId,
      parsedData,
    );

    let candidateProfile = {
      ...(await getCandidateProfile(googleId)),
      ...normalizedParsedData,
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
