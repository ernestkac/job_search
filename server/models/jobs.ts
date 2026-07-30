// models/job.ts

import db from "../db";
import { JobListing } from "../../src/types";

interface UpdateJob {
  title?: string;
  employer?: string;
  location?: string;
  closingDate?: string; // YYYY-MM-DD
  applicationMethod?: string;
  rawDescription?: string;
  requiredQualifications?: string[];
  requiredTechnicalSkills?: string[];
  responsibilities?: string[];
  workType?: string; // e.g., Full-time, Part-time, Contract
  isExpired?: boolean;
}

export async function initializeJobsTable() {
  await db.query(`
        CREATE TABLE IF NOT EXISTS jobs (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            employer VARCHAR(255) NOT NULL,
            location VARCHAR(255),

            closing_date VARCHAR(50),
            application_method TEXT,
            url TEXT,

            raw_description LONGTEXT,

            required_qualifications JSON,
            required_technical_skills JSON,
            responsibilities JSON,

            category VARCHAR(100),
            posted_date DATE,

            work_type VARCHAR(50),
            is_expired BOOLEAN DEFAULT FALSE,

            fingerprint VARCHAR(64) UNIQUE,

            source_url TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
                ON UPDATE CURRENT_TIMESTAMP
        )
    `);

  console.log("Jobs table ready");
}

export async function saveJob(job: JobListing) {
  await db.query(
    `
        INSERT INTO jobs (
            id,
            title,
            employer,
            location,
            closing_date,
            application_method,
            url,
            raw_description,
            required_qualifications,
            required_technical_skills,
            responsibilities,
            category,
            posted_date,
            work_type,
            is_expired,
            fingerprint,
            source_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE

            title = VALUES(title),
            employer = VALUES(employer),
            raw_description = VALUES(raw_description),
            required_qualifications = VALUES(required_qualifications),
            required_technical_skills = VALUES(required_technical_skills),
            responsibilities = VALUES(responsibilities),
            updated_at = CURRENT_TIMESTAMP
        `,
    [
      job.id,
      job.title,
      job.employer,
      job.location,

      job.closingDate,
      job.applicationMethod,
      job.url,

      job.rawDescription,

      JSON.stringify(job.requiredQualifications),
      JSON.stringify(job.requiredTechnicalSkills),
      JSON.stringify(job.responsibilities),

      job.category,
      job.postedDate,

      job.workType ?? null,
      job.isExpired,

      job.fingerprint,
      job.sourceUrl ?? null,
    ],
  );
}

export async function getJobs(): Promise<JobListing[]> {
  const [rows]: any = await db.query(`
        SELECT *
        FROM jobs
        ORDER BY posted_date DESC
    `);

  return rows.map((job: any) => ({
    ...job,
    requiredQualifications: job.required_qualifications,

    requiredTechnicalSkills: job.required_technical_skills,

    responsibilities: job.responsibilities,

    isExpired: Boolean(job.is_expired),
  }));
}
export async function getActiveJobs() {
  const [rows] = await db.query(`
        SELECT *
        FROM jobs
        WHERE is_expired = false
        ORDER BY posted_date DESC
    `);

  return rows;
}
export async function updateJob(
  jobId: string,
  updates: UpdateJob,
): Promise<void> {
  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push("title = ?");
      values.push(updates.title);
    }
    if (updates.employer !== undefined) {
      fields.push("employer = ?");
      values.push(updates.employer);
    }
    if (updates.location !== undefined) {
      fields.push("location = ?");
      values.push(updates.location);
    }
    if (updates.closingDate !== undefined) {
      fields.push("closing_date = ?");
      values.push(updates.closingDate);
    }
    if (updates.applicationMethod !== undefined) {
      fields.push("application_method = ?");
      values.push(updates.applicationMethod);
    }
    if (updates.rawDescription !== undefined) {
      fields.push("raw_description = ?");
      values.push(updates.rawDescription);
    }
    if (updates.requiredQualifications !== undefined) {
      fields.push("required_qualifications = ?");
      values.push(JSON.stringify(updates.requiredQualifications));
    }
    if (updates.requiredTechnicalSkills !== undefined) {
      fields.push("required_technical_skills = ?");
      values.push(JSON.stringify(updates.requiredTechnicalSkills));
    }
    if (updates.responsibilities !== undefined) {
      fields.push("responsibilities = ?");
      values.push(JSON.stringify(updates.responsibilities));
    }
    if (updates.workType !== undefined) {
      fields.push("work_type = ?");
      values.push(updates.workType);
    }
    if (updates.isExpired !== undefined) {
      fields.push("is_expired = ?");
      values.push(updates.isExpired);
    }
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
}
