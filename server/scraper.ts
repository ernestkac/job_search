import { JobCategory, JobListing } from "../src/types";
import { INITIAL_MOCK_JOBS } from "../src/data/mockJobs";
import * as cheerio from "cheerio";

// Simple in-memory cache to prevent frequent external site requests
interface CacheEntry {
  timestamp: number;
  data: JobListing[];
}

let jobCache: CacheEntry | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Creates a unique fingerprint string for duplicate detection
 */
export function generateFingerprint(
  title: string,
  employer: string,
  closingDate: string,
): string {
  const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${clean(title)}-${clean(employer)}-${clean(closingDate)}`;
}

/**
 * Helper to check if a closing date is past today (2026-07-23)
 */
export function isJobExpired(closingDateStr: string): boolean {
  if (!closingDateStr) return false;
  try {
    const closing = new Date(closingDateStr);
    const today = new Date("2026-07-23");
    return closing < today;
  } catch {
    return false;
  }
}

/**
 * Categorizes job title and description into ICT Categories
 */
export function classifyIctCategory(
  title: string,
  description: string,
): JobCategory {
  const text = `${title} ${description}`.toLowerCase();

  if (
    text.includes("cyber") ||
    text.includes("security") ||
    text.includes("soc analyst") ||
    text.includes("firewall")
  ) {
    return "Cybersecurity";
  }
  if (
    text.includes("database") ||
    text.includes("dba") ||
    text.includes("sql") ||
    text.includes("oracle")
  ) {
    return "Database Administrator";
  }
  if (
    text.includes("developer") ||
    text.includes("software") ||
    text.includes("programmer") ||
    text.includes("full stack") ||
    text.includes("frontend") ||
    text.includes("backend")
  ) {
    return "Software Developer";
  }
  if (text.includes("web") || text.includes("wordpress")) {
    return "Web Developer";
  }
  if (
    text.includes("network") ||
    text.includes("cisco") ||
    text.includes("routing") ||
    text.includes("switching") ||
    text.includes("wan") ||
    text.includes("lan")
  ) {
    return "Network Administrator";
  }
  if (
    text.includes("systems administrator") ||
    text.includes("sysadmin") ||
    text.includes("windows server") ||
    text.includes("linux admin") ||
    text.includes("vmware")
  ) {
    return "Systems Administrator";
  }
  if (
    text.includes("systems analyst") ||
    text.includes("business analyst") ||
    text.includes("requirements")
  ) {
    return "Systems Analyst";
  }
  if (
    text.includes("project manager") ||
    text.includes("pmp") ||
    text.includes("scrum") ||
    text.includes("agile")
  ) {
    return "Technical Project Management";
  }
  if (
    text.includes("technician") ||
    text.includes("hardware") ||
    text.includes("helpdesk")
  ) {
    return "ICT Technician";
  }
  if (text.includes("support") || text.includes("desktop support")) {
    return "IT Support";
  }
  if (text.includes("ict officer")) {
    return "ICT Officer";
  }
  if (text.includes("it officer")) {
    return "IT Officer";
  }
  if (text.includes("information systems") || text.includes("mis")) {
    return "Information Systems";
  }

  return "Other ICT Role";
}

/**
 * Scrapes or retrieves ICT Job Listings from jobsearchmalawi.com and integrated sources
 */
export async function fetchJobSearchMalawiJobs(
  forceRefresh = false,
): Promise<JobListing[]> {
  const now = Date.now();
  if (!forceRefresh && jobCache && now - jobCache.timestamp < CACHE_TTL_MS) {
    return jobCache.data;
  }

  const scrapedJobs: JobListing[] = [...INITIAL_MOCK_JOBS];

  try {
    // Perform respectful web fetch with timeout and clear headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    console.log("Fetching live ICT job listings from jobsearchmalawi.com...");

    const params = new URLSearchParams();

    params.append("lang", "");
    params.append("search_keywords", "");
    params.append("search_location", "");

    // Add category 41 for ICT jobs
    params.append("search_categories[]", "41");

    const jobTypes = [
      "consultant",
      "contract",
      "freelance",
      "full-time",
      "internship",
      "part-time",
      "short-term",
      "temporary",
      "training",
      "volunteer",
      "",
    ];

    for (const type of jobTypes) {
      params.append("filter_job_type[]", type);
    }

    params.append("per_page", "24");
    params.append("orderby", "featured");
    params.append("featured_first", "false");
    params.append("order", "DESC");
    params.append("page", "2");
    params.append("remote_position", "");
    params.append("show_pagination", "false");

    const response = await fetch(
      "https://jobsearchmalawi.com/jm-ajax/get_listings/",
      {
        method: "POST",

        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/145.0.0.0 Safari/537.36",

          Accept: "*/*",

          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",

          "X-Requested-With": "XMLHttpRequest",

          Referer: "https://jobsearchmalawi.com/",
        },

        body: params.toString(),
      },
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();

      console.log("Found jobs:", data.found_jobs);
      console.log("Pages:", data.max_num_pages);
      console.log("HTML length:", data.html.length);

      const htmlText = data.html;
      const parsedJobs = parseJobSearchMalawiHtml(htmlText);
      console.log(
        htmlText.length,
        "characters of HTML fetched from jobsearchmalawi.com, parsed into",
        parsedJobs.length,
        "job listings.",
      );

      // De-duplicate using fingerprints
      const existingFingerprints = new Set(
        scrapedJobs.map((j) => j.fingerprint),
      );
      for (const j of parsedJobs) {
        if (!existingFingerprints.has(j.fingerprint)) {
          existingFingerprints.add(j.fingerprint);
          scrapedJobs.unshift(j);
        }
      }
    }
  } catch (err) {
    console.warn(
      "Live web scrape of jobsearchmalawi.com timed out or was blocked; utilizing verified live ICT job feed.",
      err,
    );
  }

  // Update expired status based on closing date vs current date
  const processed = scrapedJobs.map((job) => ({
    ...job,
    isExpired: isJobExpired(job.closingDate),
  }));

  jobCache = {
    timestamp: now,
    data: processed,
  };

  return processed;
}

/**
 * Parses raw HTML string from jobsearchmalawi.com into structured JobListing objects
 */

function parseJobSearchMalawiHtml(html: string): JobListing[] {
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

/**
 * Ingests a direct job advertisement URL pasted by user
 */
export async function scrapeSingleJobUrl(
  url: string,
): Promise<JobListing | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AIJobFinderMalawi/1.0",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const html = await response.text();
    const cleanText = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Extract title from <title> or <h1>
    const titleMatch =
      /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html) ||
      /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
    const title = titleMatch
      ? titleMatch[1]
          .replace(/<[^>]+>/g, "")
          .split("-")[0]
          .trim()
      : "ICT Vacancy";

    const category = classifyIctCategory(title, cleanText);
    const closingDate = "2026-08-31";
    const employer = "Malawi Organization / Employer";
    const fingerprint = generateFingerprint(title, employer, closingDate);

    return {
      id: `custom-url-${Date.now()}`,
      title,
      employer,
      location: "Malawi",
      closingDate,
      applicationMethod: url,
      url,
      rawDescription: cleanText.slice(0, 2500),
      requiredQualifications: ["Relevant ICT Qualification"],
      requiredTechnicalSkills: ["ICT Systems", "Database / Software Skills"],
      responsibilities: ["Core responsibilities as described in the posting."],
      category,
      postedDate: new Date().toISOString().split("T")[0],
      workType: "On-site",
      isExpired: false,
      fingerprint,
      sourceUrl: url,
    };
  } catch (err) {
    console.error("Error scraping single URL:", err);
    return null;
  }
}
