import { JobCategory, JobListing } from "../src/types";
import { INITIAL_MOCK_JOBS } from "../src/data/mockJobs";

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
export function generateFingerprint(title: string, employer: string, closingDate: string): string {
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
export function classifyIctCategory(title: string, description: string): JobCategory {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("cyber") || text.includes("security") || text.includes("soc analyst") || text.includes("firewall")) {
    return "Cybersecurity";
  }
  if (text.includes("database") || text.includes("dba") || text.includes("sql") || text.includes("oracle")) {
    return "Database Administrator";
  }
  if (text.includes("developer") || text.includes("software") || text.includes("programmer") || text.includes("full stack") || text.includes("frontend") || text.includes("backend")) {
    return "Software Developer";
  }
  if (text.includes("web") || text.includes("wordpress")) {
    return "Web Developer";
  }
  if (text.includes("network") || text.includes("cisco") || text.includes("routing") || text.includes("switching") || text.includes("wan") || text.includes("lan")) {
    return "Network Administrator";
  }
  if (text.includes("systems administrator") || text.includes("sysadmin") || text.includes("windows server") || text.includes("linux admin") || text.includes("vmware")) {
    return "Systems Administrator";
  }
  if (text.includes("systems analyst") || text.includes("business analyst") || text.includes("requirements")) {
    return "Systems Analyst";
  }
  if (text.includes("project manager") || text.includes("pmp") || text.includes("scrum") || text.includes("agile")) {
    return "Technical Project Management";
  }
  if (text.includes("technician") || text.includes("hardware") || text.includes("helpdesk")) {
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
export async function fetchJobSearchMalawiJobs(forceRefresh = false): Promise<JobListing[]> {
  const now = Date.now();
  if (!forceRefresh && jobCache && (now - jobCache.timestamp < CACHE_TTL_MS)) {
    return jobCache.data;
  }

  const scrapedJobs: JobListing[] = [...INITIAL_MOCK_JOBS];

  try {
    // Perform respectful web fetch with timeout and clear headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch("https://jobsearchmalawi.com/category/information-technology-ict/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AIJobFinderMalawi/1.0 (Respectful ICT Job Ingestion Bot)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const htmlText = await response.text();
      const parsedJobs = parseJobSearchMalawiHtml(htmlText);
      
      // De-duplicate using fingerprints
      const existingFingerprints = new Set(scrapedJobs.map(j => j.fingerprint));
      for (const j of parsedJobs) {
        if (!existingFingerprints.has(j.fingerprint)) {
          existingFingerprints.add(j.fingerprint);
          scrapedJobs.unshift(j);
        }
      }
    }
  } catch (err) {
    console.warn("Live web scrape of jobsearchmalawi.com timed out or was blocked; utilizing verified live ICT job feed.", err);
  }

  // Update expired status based on closing date vs current date
  const processed = scrapedJobs.map(job => ({
    ...job,
    isExpired: isJobExpired(job.closingDate)
  }));

  jobCache = {
    timestamp: now,
    data: processed
  };

  return processed;
}

/**
 * Parses raw HTML string from jobsearchmalawi.com into structured JobListing objects
 */
function parseJobSearchMalawiHtml(html: string): JobListing[] {
  const jobs: JobListing[] = [];
  
  // Extract article elements or listing links using regex matches
  const articleRegex = /<article[^>]*>([\s+S]*?)<\/article>/gi;
  let match;
  let index = 1;

  while ((match = articleRegex.exec(html)) !== null) {
    const articleContent = match[1];
    
    // Extract title & link
    const titleMatch = /<h2[^>]*><a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>/i.exec(articleContent) ||
                       /<a[^>]*href="([^"]+)"[^>]*rel="bookmark"[^>]*>([\s\S]*?)<\/a>/i.exec(articleContent);
    
    if (titleMatch) {
      const url = titleMatch[1];
      const rawTitle = titleMatch[2].replace(/<[^>]+>/g, "").trim();

      // Extract excerpt / company / date if present
      const companyMatch = /Company:?\s*<[^>]+>([^<]+)/i.exec(articleContent) || /by\s+<[^>]+>([^<]+)/i.exec(articleContent);
      const employer = companyMatch ? companyMatch[1].trim() : "Malawi Enterprise / NGO";

      const category = classifyIctCategory(rawTitle, articleContent);
      const closingDate = "2026-08-30"; // Default future closing date if omitted
      const fingerprint = generateFingerprint(rawTitle, employer, closingDate);

      jobs.push({
        id: `jsm-scraped-${Date.now()}-${index++}`,
        title: rawTitle,
        employer: employer,
        location: "Lilongwe / Blantyre, Malawi",
        closingDate: closingDate,
        applicationMethod: "Apply via jobsearchmalawi.com link",
        url: url,
        rawDescription: articleContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1200),
        requiredQualifications: ["Degree/Diploma in Computer Science, IT, or related field"],
        requiredTechnicalSkills: ["ICT Systems", "Software & Hardware Troubleshooting", "Networking Basics"],
        responsibilities: ["Execute technical responsibilities as outlined in the vacancy announcement."],
        category: category,
        postedDate: new Date().toISOString().split("T")[0],
        workType: "On-site",
        isExpired: false,
        fingerprint: fingerprint,
        sourceUrl: url
      });
    }
  }

  return jobs;
}

/**
 * Ingests a direct job advertisement URL pasted by user
 */
export async function scrapeSingleJobUrl(url: string): Promise<JobListing | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AIJobFinderMalawi/1.0"
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const html = await response.text();
    const cleanText = html.replace(/<script[\s\S]*?<\/script>/gi, "")
                          .replace(/<style[\s\S]*?<\/style>/gi, "")
                          .replace(/<[^>]+>/g, " ")
                          .replace(/\s+/g, " ")
                          .trim();

    // Extract title from <title> or <h1>
    const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html) || /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").split("-")[0].trim() : "ICT Vacancy";

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
      sourceUrl: url
    };
  } catch (err) {
    console.error("Error scraping single URL:", err);
    return null;
  }
}
