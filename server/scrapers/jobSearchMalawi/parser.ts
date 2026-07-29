import * as cheerio from "cheerio";
import crypto from "crypto";
import { JobListing } from "../../../src/types";
import { classifyIctCategory } from "../ictCategory";

let logged = false;
const responsibilityHeadings = [
  "responsibilities",
  "key responsibilities",
  "duties",
  "key duties",
  "role and responsibilities",
  "major responsibilities",
  "tasks",
];
const qualificationHeadings = [
  "qualifications",
  "minimum qualifications",
  "required qualifications",
  "academic qualifications",
  "education",
  "educational requirements",
  "requirements",
  "minimum requirements",
  "person specifications",
  "person specification",
  "candidate profile",
  "ideal candidate",
  "who we are looking for",
  "who you are",
  "experience and qualifications",
  "knowledge and experience",
  "skills and qualifications",
  "eligibility",
  "essential requirements",
  "desired qualifications",
  "qualifications and experience",
  "experience",
  "competencies",
];
const technicalSkillHeadings = [
  "technical skills",
  "required skills",
  "skills",
  "key skills",
  "professional skills",
  "core competencies",
  "competencies",
  "technical competencies",
  "knowledge and skills",
  "required competencies",
  "essential skills",
  "desired skills",
  "technical requirements",
  "technical expertise",
  "experience with",
  "technologies",
  "tools",
  "software proficiency",
  "computer skills",
  "ict skills",
  "it skills",
];

/**
 * Parses raw HTML string from jobsearchmalawi.com into structured JobListing objects
 */
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

      fingerprint: crypto.createHash("sha256").update(url).digest("hex"),
    });
  }
  //console.log(jobs);
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

    //const closingDate = $("text=Closing Date").parent().text().trim() || "";
    const closingDate = extractClosingDate(rawDescription);

    const applicationMethod =
      $(".application_details").text().trim() ||
      "Apply via jobsearchmalawi.com link";

    const responsibilities: string[] = extractSection(
      $,
      responsibilityHeadings,
    );

    if (responsibilities.length === 0) {
      responsibilities.push(...extractLooseSection($, responsibilityHeadings));
    }

    const requiredQualifications: string[] = extractSection(
      $,
      qualificationHeadings,
    );
    if (requiredQualifications.length === 0) {
      requiredQualifications.push(
        ...extractLooseSection($, qualificationHeadings),
      );
    }
    const requiredTechnicalSkills: string[] = extractSection(
      $,
      technicalSkillHeadings,
    );
    if (requiredTechnicalSkills.length === 0) {
      requiredTechnicalSkills.push(
        ...extractLooseSection($, technicalSkillHeadings),
      );
    }

    const isExpired = $.text()
      .toLowerCase()
      .includes("applications have closed");

    return {
      closingDate,
      applicationMethod,
      rawDescription,
      requiredQualifications,
      requiredTechnicalSkills,
      responsibilities,
      isExpired,
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

function extractClosingDate(description: string): string {
  const keywordRegex =
    /(closing\s+date|deadline|due\s+date|no\s+later\s+than|applications?\s+should\s+reach)[\s\S]{0,50}?(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+\d{4})/i;

  const match = description.match(keywordRegex);

  if (match) {
    return match[2];
  }

  const fallback = description.match(
    /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+\d{4}\b/i,
  );

  return fallback ? fallback[0] : "";
}

function extractLooseSection($: cheerio.CheerioAPI, headings: string[]) {
  let results: string[] = [];

  $("h1,h2,h3,h4,h5,h6,p,span,strong").each((_, el) => {
    const text = $(el).text().trim().toLowerCase();

    const isHeading = headings.some((h) => text.includes(h));

    if (isHeading) {
      let current = $(el).next();

      while (current.length) {
        // stop when another heading starts
        const currentText = current.text().trim().toLowerCase();

        if (headings.some((h) => currentText.includes(h))) {
          break;
        }

        current.find("li").each((_, li) => {
          const item = $(li).text().trim();

          if (item) results.push(item);
        });

        current = current.next();
      }
    }
  });

  return results;
}

function extractSection($: cheerio.CheerioAPI, headings: string[]): string[] {
  const results: string[] = [];

  // Only treat actual headings as section headers
  $("h1,h2,h3,h4,h5,h6").each((_, heading) => {
    const headingText = $(heading).text().trim().toLowerCase();

    if (!headings.some((h) => headingText.includes(h))) {
      return;
    }

    // Walk through siblings until another heading
    let current = $(heading).next();

    while (current.length) {
      if (current.is("h1,h2,h3,h4,h5,h6")) {
        break;
      }

      if (current.is("ul")) {
        current.children("li").each((_, li) => {
          const text = $(li).text().trim();

          if (text) {
            results.push(text);
          }
        });
      }

      current = current.next();
    }
  });

  return results;
}
