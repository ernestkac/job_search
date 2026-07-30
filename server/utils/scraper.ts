import { JobListing } from "../../src/types";
import { classifyIctCategory } from "./scrapers/ictCategory";
import { generateFingerprint } from "./scrapers/fingerPrintGenerator";

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

export * from "./scrapers/jobSearchMalawi/index";
