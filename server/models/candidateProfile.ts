import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "../../server/config/db";

interface CandidateProfileRow extends RowDataPacket {
  id: number;
  profile_data: object;
  gmail_refresh_token?: string | null;
  gmail_access_token?: string | null;
  gmail_token_expiry?: number | null;
  gmail_connected_at?: string | null;
}

export interface GmailCredentials {
  refreshToken: string;
  accessToken?: string;
  expiryDate?: number;
}

export async function initializeCandidateProfileTable() {
  // Create candidate_profile table
  await db.query(`
    CREATE TABLE IF NOT EXISTS candidate_profile (
      id INT AUTO_INCREMENT PRIMARY KEY,
      google_id VARCHAR(64) UNIQUE,
      gmail_credentials JSON,
      gmail_refresh_token TEXT,
      gmail_access_token TEXT,
      gmail_token_expiry BIGINT,
      gmail_connected_at TIMESTAMP NULL,
      profile_data JSON NOT NULL,
      picture_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  console.log("Table candidate_profile is ready.");
}

export async function getCandidateProfile(
  googleId: string,
): Promise<object | null> {
  const [rows] = await db.query<CandidateProfileRow[]>(
    "SELECT * FROM candidate_profile WHERE google_id = ?",
    [googleId],
  );

  if (rows.length === 0) {
    return null;
  }

  const profileData = rows[0].profile_data;
  const parsedProfileData =
    typeof profileData === "string" ? JSON.parse(profileData) : profileData;

  return {
    ...(parsedProfileData as Record<string, unknown>),
    photoUrl:
      rows[0].picture_url || (parsedProfileData as any)?.photoUrl || null,
  };
}

export async function saveCandidateProfile(
  googleId: string,
  gmailCredentials: GmailCredentials | null | undefined,
  pictureUrl: string,
  profileData: object,
) {
  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO candidate_profile (google_id, gmail_credentials, gmail_refresh_token, gmail_access_token, gmail_token_expiry, gmail_connected_at, profile_data, picture_url) VALUES (?,?,?,?,?,?,?,?)",
    [
      googleId,
      gmailCredentials ? JSON.stringify(gmailCredentials) : null,
      gmailCredentials?.refreshToken || null,
      gmailCredentials?.accessToken || null,
      gmailCredentials?.expiryDate ?? null,
      gmailCredentials?.refreshToken ? new Date() : null,
      JSON.stringify(profileData),
      pictureUrl,
    ],
  );

  return result.insertId;
}

export async function updateCandidateProfile(
  googleId: string,
  profileData: object,
) {
  await db.query(
    "UPDATE candidate_profile SET profile_data = ? WHERE google_id = ?",
    [JSON.stringify(profileData), googleId],
  );
}

export async function deleteCandidateProfile(googleId: string) {
  await db.query("DELETE FROM candidate_profile WHERE id = ?", [googleId]);
}

export async function getGmailCredentials(
  googleId: string,
): Promise<GmailCredentials | null> {
  const [rows] = await db.query<CandidateProfileRow[]>(
    "SELECT gmail_refresh_token, gmail_access_token, gmail_token_expiry FROM candidate_profile WHERE google_id = ?",
    [googleId],
  );

  if (rows.length === 0) {
    return null;
  }

  const refreshToken = rows[0].gmail_refresh_token;
  if (!refreshToken) {
    return null;
  }

  return {
    refreshToken,
    accessToken: rows[0].gmail_access_token || undefined,
    expiryDate: rows[0].gmail_token_expiry || undefined,
  };
}

export async function updateGmailCredentials(
  googleId: string,
  credentials: GmailCredentials,
) {
  return await db.query(
    "UPDATE candidate_profile SET gmail_credentials = ?, gmail_refresh_token = ?, gmail_access_token = ?, gmail_token_expiry = ?, gmail_connected_at = ? WHERE google_id = ?",
    [
      JSON.stringify(credentials),
      credentials.refreshToken || null,
      credentials.accessToken || null,
      credentials.expiryDate ?? null,
      credentials.refreshToken ? new Date() : null,
      googleId,
    ],
  );
}

export async function clearGmailCredentials(googleId: string) {
  return await db.query(
    "UPDATE candidate_profile SET gmail_credentials = NULL, gmail_refresh_token = NULL, gmail_access_token = NULL, gmail_token_expiry = NULL, gmail_connected_at = NULL WHERE google_id = ?",
    [googleId],
  );
}
