import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "../../server/config/db";

interface CandidateProfileRow extends RowDataPacket {
  id: number;
  profile_data: object;
}

export async function initializeCandidateProfileTable() {
  // Create candidate_profile table
  await db.query(`
    CREATE TABLE IF NOT EXISTS candidate_profile (
      id INT AUTO_INCREMENT PRIMARY KEY,
      google_id VARCHAR(64) UNIQUE,
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

  return typeof profileData === "string"
    ? JSON.parse(profileData)
    : profileData;
}

export async function saveCandidateProfile(
  googleId: string,
  pictureUrl: string,
  profileData: object,
) {
  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO candidate_profile (google_id, profile_data, picture_url) VALUES (?,?,?)",
    [googleId, [JSON.stringify(profileData)], pictureUrl],
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
