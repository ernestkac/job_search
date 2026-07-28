import * as cheerio from "cheerio";
import { JobListing } from "../../../src/types";
import { classifyIctCategory } from "../ictCategory";
import { generateFingerprint } from "../fingerPrintGenerator";

/**
 * Parses raw HTML string from jobsearchmalawi.com into structured JobListing objects
 */
let logged = false;

export async function parseJobSearchMalawiHtml(
  html: string,
): Promise<JobListing[]> {
  const $ = cheerio.load(html);
  const jobs: JobListing[] = [];

  const listings = $("li.job_listing").toArray();

  for (const [index, element] of listings.entries()) {
    const job = $(element);

    const url = job.find("a").first().attr("href")?.trim() || "";

    const title = job.find(".position h3").text().trim();

    const employer = job.find(".company strong").text().trim();

    const location = job.find(".location").text().trim();

    const workType = job.find(".job-type").text().trim();

    const postedDate =
      job.find("time").attr("datetime") ||
      new Date().toISOString().split("T")[0];

    const details = await scrapeJobDetails(url);

    jobs.push({
      id: `jsm-scraped-${Date.now()}-${index + 1}`,

      title,
      employer,
      location,
      url,
      sourceUrl: url,

      workType,
      postedDate,

      ...details,

      category: classifyIctCategory(title, details.rawDescription),

      fingerprint: generateFingerprint(title, employer, details.rawDescription),
    });
  }
  console.log(jobs.at(0));
  return jobs;
}

async function scrapeJobDetails(url: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed fetching ${url}`);
    }

    const html = await response.text();

    const $ = cheerio.load(html);

    const rawDescription = $(".job_description").text().trim();

    const closingDate = $("text=Closing Date").parent().text().trim() || "";

    const applicationMethod =
      $(".application_details").text().trim() ||
      "Apply via jobsearchmalawi.com link";

    const responsibilities: string[] = [];

    $("h3, h2").each((_, el) => {
      const heading = $(el).text().toLowerCase();

      if (heading.includes("responsibil")) {
        $(el)
          .next("ul")
          .find("li")
          .each((_, li) => {
            responsibilities.push($(li).text().trim());
          });
      }
    });

    return {
      closingDate,
      applicationMethod,
      rawDescription,
      requiredQualifications: [],
      requiredTechnicalSkills: [],
      responsibilities,
      isExpired: false,
    };
  } catch (error) {
    console.error("Failed scraping details:", url, error);

    return {
      closingDate: "",
      applicationMethod: "Apply via jobsearchmalawi.com link",
      rawDescription: "",
      requiredQualifications: [],
      requiredTechnicalSkills: [],
      responsibilities: [],
      isExpired: false,
    };
  }
}
