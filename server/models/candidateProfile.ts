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
      profile_data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  console.log("Table candidate_profile is ready.");
}

export async function getCandidateProfile(id: number): Promise<object | null> {
  const [rows] = await db.query<CandidateProfileRow[]>(
    "SELECT * FROM candidate_profile WHERE id = ?",
    [id],
  );

  if (rows.length === 0) {
    return null;
  }

  const profileData = rows[0].profile_data;

  return typeof profileData === "string"
    ? JSON.parse(profileData)
    : profileData;
}

export async function saveCandidateProfile(profileData: object) {
  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO candidate_profile (profile_data) VALUES (?)",
    [JSON.stringify(profileData)],
  );

  return result.insertId;
}

export async function updateCandidateProfile(id: number, profileData: object) {
  await db.query("UPDATE candidate_profile SET profile_data = ? WHERE id = ?", [
    JSON.stringify(profileData),
    id,
  ]);
}

export async function deleteCandidateProfile(id: number) {
  await db.query("DELETE FROM candidate_profile WHERE id = ?", [id]);
}
