// models/job.ts

import db from "../db";
import { JobListing } from "../../src/types";

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
