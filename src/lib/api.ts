import {
  CandidateProfile,
  JobFilterState,
  JobListing,
  JobMatchAnalysis,
  TrackedApplication,
} from "../types";

// Explicit structure for the unified backend API response
interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function apiFetchJobs(
  forceRefresh = false,
): Promise<JobListing[]> {
  try {
    const data = await apiFetch(
      `/api/jobs${forceRefresh ? "?refresh=true" : ""}`,
    );
    if (data.success) return data.jobs;
    throw new Error(data.error || "Failed to fetch jobs");
  } catch (err) {
    console.warn("API error fetching jobs, using local fallback:", err);
    return [];
  }
}

export async function apiScrapeSingleUrl(url: string): Promise<JobListing> {
  const data = await apiFetch("/api/jobs/scrape-url", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
  if (data.success) return data.job;
  throw new Error(data.error || "Failed to ingest URL");
}

export async function apiFetchProfile(): Promise<CandidateProfile> {
  const data = await apiFetch("/api/candidates");
  if (data.success) return data.profile;
  throw new Error(data.error || "Failed to fetch profile");
}

export async function apiSaveProfile(
  profile: CandidateProfile,
): Promise<CandidateProfile> {
  const data = await apiFetch("/api/candidates", {
    method: "POST",
    body: JSON.stringify(profile),
  });
  if (data.success) return data.profile;
  throw new Error(data.error || "Failed to save profile");
}

export async function apiParseCv(payload: {
  rawText?: string;
  fileBase64?: string;
  mimeType?: string;
}): Promise<CandidateProfile> {
  const data = await apiFetch("/api/candidates/parse-cv", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (data.success) return data.profile;
  throw new Error(data.error || "Failed to parse CV");
}

export async function apiAnalyzeMatch(
  jobId: string,
  customJob?: JobListing,
): Promise<JobMatchAnalysis> {
  const data = await apiFetch("/api/jobs/match", {
    method: "POST",
    body: JSON.stringify({ jobId, customJob }),
  });
  if (data.success) return data.match;
  throw new Error(data.error || "Failed to analyze match");
}

export async function apiGenerateLetter(
  jobId: string,
  customNote?: string,
  customJob?: JobListing,
): Promise<{ letter: string; applicationRecord: TrackedApplication }> {
  const data = await apiFetch("/api/jobs/generate-letter", {
    method: "POST",
    body: JSON.stringify({ jobId, customNote, customJob }),
  });
  if (data.success) {
    return { letter: data.letter, applicationRecord: data.applicationRecord };
  }
  throw new Error(data.error || "Failed to generate application letter");
}

export async function apiFetchApplications(): Promise<TrackedApplication[]> {
  try {
    const data = await apiFetch("/api/applications");
    if (data.success) return data.applications;
    throw new Error(data.error || "Failed to fetch applications");
  } catch (err) {
    console.warn("API error fetching applications:", err);
    return [];
  }
}

export async function apiSaveApplication(
  app: Partial<TrackedApplication>,
): Promise<TrackedApplication[]> {
  const data = await apiFetch("/api/applications", {
    method: "POST",
    body: JSON.stringify(app),
  });
  if (data.success) return data.applications;
  throw new Error(data.error || "Failed to save application");
}

export async function apiDeleteApplication(
  id: string,
): Promise<TrackedApplication[]> {
  const data = await apiFetch(`/api/applications/${id}`, { method: "DELETE" });
  if (data.success) return data.applications;
  throw new Error(data.error || "Failed to delete application");
}

export function computeInstantMatch(
  profile: CandidateProfile,
  job: JobListing,
): JobMatchAnalysis {
  const candidateSkillList: string[] = [];
  if (profile.technicalSkills) {
    Object.values(profile.technicalSkills).forEach((arr) => {
      if (Array.isArray(arr)) {
        candidateSkillList.push(...arr.map((s) => s.toLowerCase().trim()));
      }
    });
  }

  const jobReqSkills = job.requiredTechnicalSkills || [];
  const matching: string[] = [];
  const missing: string[] = [];

  jobReqSkills.forEach((req) => {
    const reqLower = req.toLowerCase().trim();
    if (
      candidateSkillList.some(
        (cs) => cs.includes(reqLower) || reqLower.includes(cs),
      )
    ) {
      matching.push(req);
    } else {
      missing.push(req);
    }
  });

  const matchRatio =
    jobReqSkills.length > 0 ? matching.length / jobReqSkills.length : 0.75;
  let score = Math.round(62 + matchRatio * 32);
  score = Math.min(98, Math.max(55, score));

  return {
    jobId: job.id,
    compatibilityScore: score,
    matchReasoning: `Candidate profile demonstrates strong alignment with ${job.title} specifications (${matching.slice(0, 3).join(", ") || "Core ICT skills"}).`,
    matchingSkills:
      matching.length > 0
        ? matching
        : profile.technicalSkills?.systemsAndOS || [
            "ICT Systems Administration",
            "IT Infrastructure",
          ],
    missingOrWeakRequirements:
      missing.length > 0 ? missing : ["Vendor Advanced Certifications"],
    candidateStrengths: [
      `${profile.professionalTitle || "IT Specialist"} background with verified skills`,
      `Experience in ${profile.technicalSkills?.systemsAndOS?.[0] || "Systems"} and ${profile.technicalSkills?.networking?.[0] || "Networking"}`,
    ],
    gapSummary:
      missing.length > 0
        ? `Areas for growth: ${missing.slice(0, 3).join(", ")}.`
        : "Strong overall qualification alignment.",
    analyzedAt: new Date().toISOString(),
  };
}

export function filterJobListings(
  jobs: JobListing[],
  filters: JobFilterState,
  matchesMap: Record<string, JobMatchAnalysis>,
): JobListing[] {
  return jobs.filter((job) => {
    if (filters.hideExpired && job.isExpired) {
      return false;
    }

    if (
      filters.category &&
      filters.category !== "All" &&
      job.category !== filters.category
    ) {
      return false;
    }

    if (filters.location && filters.location !== "All") {
      if (
        !job.location.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }
    }

    if (
      filters.workType &&
      filters.workType !== "All" &&
      job.workType !== filters.workType
    ) {
      return false;
    }

    if (filters.minScore > 0) {
      const match = matchesMap[job.id];
      const score = match ? match.compatibilityScore : 65;
      if (score < filters.minScore) {
        return false;
      }
    }

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const inTitle = job.title.toLowerCase().includes(q);
      const inEmployer = job.employer.toLowerCase().includes(q);
      const inDesc = job.rawDescription.toLowerCase().includes(q);

      // Fixed the truncated final search line safely
      const inSkills = (job.requiredTechnicalSkills || []).some((skill) =>
        skill.toLowerCase().includes(q),
      );

      if (!inTitle && !inEmployer && !inDesc && !inSkills) {
        return false;
      }
    }

    return true;
  });
}
