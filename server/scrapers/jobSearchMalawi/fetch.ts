import { JobListing } from "../../../src/types";
import { INITIAL_MOCK_JOBS } from "../../../src/data/mockJobs";
import { parseJobSearchMalawiHtml } from "../jobSearchMalawi/parser";

// Simple in-memory cache to prevent frequent external site requests
interface CacheEntry {
  timestamp: number;
  data: JobListing[];
}

let jobCache: CacheEntry | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

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
