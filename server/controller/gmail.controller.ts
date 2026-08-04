import { Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";
import { google } from "googleapis";
import {
  clearGmailCredentials,
  getGmailCredentials,
  GmailCredentials,
  updateGmailCredentials,
} from "../models/candidateProfile";

interface GmailAttachmentPayload {
  filename: string;
  mimeType?: string;
  dataUrl?: string;
  base64?: string;
}

function base64ToBase64Url(value: string): string {
  return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildMimeMessage(
  recipientEmail: string,
  subject: string,
  bodyText: string,
  attachments: GmailAttachmentPayload[] = [],
): string {
  const boundary = `====_Boundary_${Date.now()}_====`;

  let mime = `To: ${recipientEmail}\r\n`;
  mime += `Subject: ${subject}\r\n`;
  mime += `MIME-Version: 1.0\r\n`;

  if (attachments.length === 0) {
    mime += `Content-Type: text/plain; charset="UTF-8"\r\n\r\n`;
    mime += `${bodyText}\r\n`;
    return mime;
  }

  mime += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
  mime += `--${boundary}\r\n`;
  mime += `Content-Type: text/plain; charset="UTF-8"\r\n`;
  mime += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
  mime += `${bodyText}\r\n\r\n`;

  for (const att of attachments) {
    const rawData = att.base64 || att.dataUrl?.split(",")[1] || "";
    mime += `--${boundary}\r\n`;
    mime += `Content-Type: ${att.mimeType || "application/pdf"}; name="${att.filename}"\r\n`;
    mime += `Content-Disposition: attachment; filename="${att.filename}"\r\n`;
    mime += `Content-Transfer-Encoding: base64\r\n\r\n`;
    mime += `${rawData}\r\n\r\n`;
  }

  mime += `--${boundary}--\r\n`;
  return mime;
}

export async function sendGmail(req: Request, res: Response) {
  const googleId = (req as any).user?.googleId;
  if (!googleId) {
    return res.status(401).json({
      success: false,
      error: "Authentication required.",
    });
  }

  try {
    const {
      recipientEmail,
      subject,
      bodyText,
      attachments = [],
    } = req.body || {};

    const gmailCredentials: GmailCredentials | null =
      await getGmailCredentials(googleId);

    if (!gmailCredentials?.refreshToken) {
      return res.status(200).json({
        success: false,
        requiresGmailAuthorization: true,
        message: "Gmail access is required before emails can be sent.",
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    oauth2Client.setCredentials({
      access_token: gmailCredentials.accessToken,
      refresh_token: gmailCredentials.refreshToken,
      expiry_date: gmailCredentials.expiryDate,
    });

    let { token } = await oauth2Client.getAccessToken();

    if (!token) {
      await clearGmailCredentials(googleId);
      return res.status(200).json({
        success: false,
        requiresGmailAuthorization: true,
        message: "Gmail access is required before emails can be sent.",
      });
    }

    await updateGmailCredentials(googleId, {
      refreshToken: gmailCredentials.refreshToken,
      accessToken:
        oauth2Client.credentials.access_token || gmailCredentials.accessToken,
      expiryDate:
        oauth2Client.credentials.expiry_date || gmailCredentials.expiryDate,
    });

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return res.status(400).json({
        success: false,
        error: "Invalid recipient email address.",
      });
    }

    const resolvedAttachments = await Promise.all(
      (attachments as GmailAttachmentPayload[]).map(async (att) => {
        if (!att.filePath) {
          return att;
        }

        const resolvedPath = path.isAbsolute(att.filePath)
          ? att.filePath
          : path.join(process.cwd(), att.filePath);
        const fileBuffer = await fs.readFile(resolvedPath);
        return {
          ...att,
          base64: fileBuffer.toString("base64"),
        };
      }),
    );

    const mimeString = buildMimeMessage(
      recipientEmail,
      subject || "Application Message",
      bodyText || "",
      resolvedAttachments,
    );

    const rawBase64 = Buffer.from(mimeString, "utf-8").toString("base64");
    const rawBase64Url = base64ToBase64Url(rawBase64);

    const gmailResponse = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: rawBase64Url }),
      },
    );

    const responseData = await gmailResponse.json().catch(() => ({}));

    if (gmailResponse.ok && responseData.id) {
      return res.json({
        success: true,
        messageId: responseData.id,
      });
    }

    const errorMessage =
      responseData.error?.message ||
      responseData.error_description ||
      "Gmail API error";

    console.error("Gmail API error:", errorMessage, responseData);

    if (
      gmailResponse.status === 401 ||
      /invalid grant|invalid_client|token/i.test(errorMessage)
    ) {
      await clearGmailCredentials(googleId);
      return res.status(200).json({
        success: false,
        requiresGmailAuthorization: true,
        message: "Gmail access is required before emails can be sent.",
      });
    }

    return res.status(gmailResponse.status || 500).json({
      success: false,
      error: errorMessage,
    });
  } catch (error: any) {
    const message = error?.message || "";
    const isAuthFailure = /invalid grant|invalid_client|token|auth/i.test(
      message,
    );

    if (isAuthFailure) {
      await clearGmailCredentials(googleId);
      return res.status(200).json({
        success: false,
        requiresGmailAuthorization: true,
        message: "Gmail access is required before emails can be sent.",
      });
    }

    return res.status(500).json({
      success: false,
      error: message || "Failed to send Gmail message.",
    });
  }
}
