import { CandidateProfile, JobFilterState, JobListing, JobMatchAnalysis, TrackedApplication } from '../types';

export async function apiFetchJobs(forceRefresh = false): Promise<JobListing[]> {
  try {
    const res = await fetch(`/api/jobs${forceRefresh ? '?refresh=true' : ''}`);
    const data = await res.json();
    if (data.success) return data.jobs;
    throw new Error(data.error || 'Failed to fetch jobs');
  } catch (err) {
    console.warn('API error fetching jobs, using local fallback:', err);
    return [];
  }
}

export async function apiScrapeSingleUrl(url: string): Promise<JobListing> {
  const res = await fetch('/api/jobs/scrape-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (data.success) return data.job;
  throw new Error(data.error || 'Failed to ingest URL');
}

export async function apiFetchProfile(): Promise<CandidateProfile> {
  const res = await fetch('/api/profile');
  const data = await res.json();
  if (data.success) return data.profile;
  throw new Error(data.error || 'Failed to fetch profile');
}

export async function apiSaveProfile(profile: CandidateProfile): Promise<CandidateProfile> {
  const res = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  const data = await res.json();
  if (data.success) return data.profile;
  throw new Error(data.error || 'Failed to save profile');
}

export async function apiParseCv(payload: { rawText?: string; fileBase64?: string; mimeType?: string }): Promise<CandidateProfile> {
  const res = await fetch('/api/profile/parse-cv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.success) return data.profile;
  throw new Error(data.error || 'Failed to parse CV');
}

export async function apiAnalyzeMatch(jobId: string, customJob?: JobListing): Promise<JobMatchAnalysis> {
  const res = await fetch('/api/jobs/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId, customJob }),
  });
  const data = await res.json();
  if (data.success) return data.match;
  throw new Error(data.error || 'Failed to analyze match');
}

export async function apiGenerateLetter(jobId: string, customNote?: string, customJob?: JobListing): Promise<{ letter: string; applicationRecord: TrackedApplication }> {
  const res = await fetch('/api/jobs/generate-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId, customNote, customJob }),
  });
  const data = await res.json();
  if (data.success) return { letter: data.letter, applicationRecord: data.applicationRecord };
  throw new Error(data.error || 'Failed to generate application letter');
}

export async function apiFetchApplications(): Promise<TrackedApplication[]> {
  try {
    const res = await fetch('/api/applications');
    const data = await res.json();
    if (data.success) return data.applications;
    throw new Error(data.error || 'Failed to fetch applications');
  } catch (err) {
    console.warn('API error fetching applications:', err);
    return [];
  }
}

export async function apiSaveApplication(app: Partial<TrackedApplication>): Promise<TrackedApplication[]> {
  const res = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(app),
  });
  const data = await res.json();
  if (data.success) return data.applications;
  throw new Error(data.error || 'Failed to save application');
}

export async function apiDeleteApplication(id: string): Promise<TrackedApplication[]> {
  const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.success) return data.applications;
  throw new Error(data.error || 'Failed to delete application');
}

export function computeInstantMatch(profile: CandidateProfile, job: JobListing): JobMatchAnalysis {
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
    if (candidateSkillList.some((cs) => cs.includes(reqLower) || reqLower.includes(cs))) {
      matching.push(req);
    } else {
      missing.push(req);
    }
  });

  const matchRatio = jobReqSkills.length > 0 ? matching.length / jobReqSkills.length : 0.75;
  let score = Math.round(62 + matchRatio * 32);
  score = Math.min(98, Math.max(55, score));

  return {
    jobId: job.id,
    compatibilityScore: score,
    matchReasoning: `Candidate profile demonstrates strong alignment with ${job.title} specifications (${matching.slice(0, 3).join(', ') || 'Core ICT skills'}).`,
    matchingSkills: matching.length > 0 ? matching : (profile.technicalSkills?.systemsAndOS || ['ICT Systems Administration', 'IT Infrastructure']),
    missingOrWeakRequirements: missing.length > 0 ? missing : ['Vendor Advanced Certifications'],
    candidateStrengths: [
      `${profile.professionalTitle || 'IT Specialist'} background with verified skills`,
      `Experience in ${profile.technicalSkills?.systemsAndOS?.[0] || 'Systems'} and ${profile.technicalSkills?.networking?.[0] || 'Networking'}`,
    ],
    gapSummary: missing.length > 0 ? `Areas for growth: ${missing.slice(0, 3).join(', ')}.` : 'Strong overall qualification alignment.',
    analyzedAt: new Date().toISOString(),
  };
}

export function filterJobListings(jobs: JobListing[], filters: JobFilterState, matchesMap: Record<string, JobMatchAnalysis>): JobListing[] {
  return jobs.filter((job) => {
    // Expiry check
    if (filters.hideExpired && job.isExpired) {
      return false;
    }

    // Category check
    if (filters.category && filters.category !== 'All' && job.category !== filters.category) {
      return false;
    }

    // Location check
    if (filters.location && filters.location !== 'All') {
      if (!job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
    }

    // Work type check
    if (filters.workType && filters.workType !== 'All' && job.workType !== filters.workType) {
      return false;
    }

    // Score threshold check
    if (filters.minScore > 0) {
      const match = matchesMap[job.id];
      const score = match ? match.compatibilityScore : 65; // default fallback match level
      if (score < filters.minScore) {
        return false;
      }
    }

    // Search query check (title, employer, description, skills)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const inTitle = job.title.toLowerCase().includes(q);
      const inEmployer = job.employer.toLowerCase().includes(q);
      const inDesc = job.rawDescription.toLowerCase().includes(q);
      const inSkills = job.requiredTechnicalSkills.some(s => s.toLowerCase().includes(q));
      if (!inTitle && !inEmployer && !inDesc && !inSkills) {
        return false;
      }
    }

    return true;
  });
}
