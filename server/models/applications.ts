import db from "../config/db";
import { TrackedApplication } from "../../src/types";

interface UpdateTrackedApplication {
  status?: string;
  generatedLetter?: string;
  notes?: string;
  followUpReminderDate?: string | null;
}

export async function initializeTrackedApplicationsTable() {
  await db.query(`
        CREATE TABLE IF NOT EXISTS tracked_applications (
          id VARCHAR(36) PRIMARY KEY,
          job_id VARCHAR(36) NOT NULL,
          status VARCHAR(50) NOT NULL,
          application_date DATE NULL,
          generated_letter LONGTEXT NULL,
          notes TEXT NULL,
          follow_up_reminder_date DATE NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

  console.log("Tracked applications table ready");
}

export async function trackNewApplication(
  application: TrackedApplication,
): Promise<void> {
  try {
    await db.query(
      `
      INSERT INTO tracked_applications (
        id,
        job_id,
        status,
        application_date,
        generated_letter,
        notes,
        follow_up_reminder_date,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        application.id,
        application.jobId,
        application.status,
        application.applicationDate ?? null,
        application.generatedLetter ?? null,
        application.notes ?? null,
        application.followUpReminderDate ?? null,
        application.updatedAt,
      ],
    );
  } catch (error) {
    console.error("Error creating tracked application:", error);
    throw error;
  }
}

export async function getTrackedApplications(): Promise<TrackedApplication[]> {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.id,
        t.job_id AS jobId,
        j.title AS jobTitle,
        j.employer,
        j.location,
        t.status,
        t.application_date AS applicationDate,
        j.closing_date AS closingDate,
        j.application_method AS applicationContact,
        t.generated_letter AS generatedLetter,
        t.notes,
        t.follow_up_reminder_date AS followUpReminderDate,
        t.updated_at AS updatedAt
      FROM tracked_applications t
      inner join jobs j ON t.job_id = j.id
      ORDER BY t.updated_at DESC
    `);

    return rows as TrackedApplication[];
  } catch (error) {
    console.error("Error retrieving tracked applications:", error);
    throw error;
  }
}

export async function updateTrackedApplication(
  id: string,
  updates: UpdateTrackedApplication,
): Promise<void> {
  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      fields.push("status = ?");
      values.push(updates.status);
    }

    if (updates.generatedLetter !== undefined) {
      fields.push("generated_letter = ?");
      values.push(updates.generatedLetter);
    }

    if (updates.notes !== undefined) {
      fields.push("notes = ?");
      values.push(updates.notes);
    }

    if (updates.followUpReminderDate !== undefined) {
      fields.push("follow_up_reminder_date = ?");
      values.push(updates.followUpReminderDate);
    }

    // Always update timestamp when something changes
    fields.push("updated_at = CURRENT_TIMESTAMP");

    values.push(id);

    const sql = `
      UPDATE tracked_applications
      SET ${fields.join(", ")}
      WHERE id = ?
    `;

    await db.query(sql, values);
  } catch (error) {
    console.error("Error updating tracked application:", error);
    throw error;
  }
}

export async function deleteTrackedApplication(id: string): Promise<void> {
  try {
    await db.query("DELETE FROM tracked_applications WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error deleting tracked application:", error);
    throw error;
  }
}
