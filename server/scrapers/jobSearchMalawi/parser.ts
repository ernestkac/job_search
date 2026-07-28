import * as cheerio from "cheerio";
import { JobListing } from "../../../src/types";
import { classifyIctCategory } from "../ictCategory";
import { generateFingerprint } from "../fingerPrintGenerator";

/**
 * Parses raw HTML string from jobsearchmalawi.com into structured JobListing objects
 */

export function parseJobSearchMalawiHtml(html: string): JobListing[] {
  const $ = cheerio.load(html);
  const jobs: JobListing[] = [];

  $("li.job_listing").each((index, element) => {
    const job = $(element);

    const url = job.find("a").first().attr("href")?.trim() || "";

    const title = job.find(".position h3").text().trim();

    const employer = job.find(".company strong").text().trim();

    const location = job.find(".location").text().trim();

    const workType = job.find(".job-type").text().trim();

    const postedDate =
      job.find("time").attr("datetime") ||
      new Date().toISOString().split("T")[0];

    jobs.push({
      id: `jsm-scraped-${Date.now()}-${index + 1}`,
      title,
      employer,
      location,
      url,
      sourceUrl: url,
      workType,
      postedDate,

      closingDate: "",
      applicationMethod: "Apply via jobsearchmalawi.com link",

      rawDescription: "",

      requiredQualifications: [],
      requiredTechnicalSkills: [],
      responsibilities: [],

      category: classifyIctCategory(title, ""),

      isExpired: false,

      fingerprint: generateFingerprint(title, employer, ""),
    });
  });

  return jobs;
}
