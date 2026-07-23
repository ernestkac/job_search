import { GoogleGenAI, Type } from "@google/genai";
import { CandidateProfile, JobListing, JobMatchAnalysis } from "../src/types";

// Initialize Gemini Client with User-Agent header for AI Studio
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * Retry wrapper with exponential backoff for Gemini API calls (e.g., 429 quota rate limits)
 */
async function callGeminiWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      const isRateLimit =
        error?.status === 'RESOURCE_EXHAUSTED' ||
        error?.code === 429 ||
        (typeof error?.message === 'string' &&
          (error.message.includes('429') ||
           error.message.includes('RESOURCE_EXHAUSTED') ||
           error.message.includes('quota')));

      if (isRateLimit && attempt <= maxRetries) {
        let delayMs = 2500 * Math.pow(2, attempt); // 5s, 10s
        if (error?.details && Array.isArray(error.details)) {
          const retryInfo = error.details.find((d: any) => d['@type']?.includes('RetryInfo'));
          if (retryInfo?.retryDelay) {
            const seconds = parseInt(retryInfo.retryDelay, 10);
            if (!isNaN(seconds) && seconds > 0) {
              delayMs = Math.min((seconds + 1) * 1000, 8000);
            }
          }
        }
        console.warn(`Gemini API 429 rate limit hit. Retrying attempt ${attempt}/${maxRetries} after ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
}

/**
 * Local heuristic matcher fallback when Gemini quota/rate limits occur
 */
export function calculateHeuristicJobMatch(
  profile: CandidateProfile,
  job: JobListing
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
    matchReasoning: `Candidate profile demonstrates background overlap with ${job.title} specifications (${matching.slice(0, 3).join(', ') || 'Core ICT skills'}). Analyzed against profile skills and job details.`,
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

/**
 * Local cover letter generator fallback when Gemini quota/rate limits occur
 */
export function generateHeuristicCoverLetter(
  profile: CandidateProfile,
  job: JobListing,
  customNote?: string
): string {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const keySkills = [
    ...(profile.technicalSkills?.systemsAndOS || []),
    ...(profile.technicalSkills?.networking || []),
    ...(profile.technicalSkills?.softwareDevelopment || []),
  ].slice(0, 5).join(', ');

  return `${profile.fullName || 'Candidate'}
${profile.email ? `Email: ${profile.email}` : ''} ${profile.phone ? `| Phone: ${profile.phone}` : ''}
${profile.location || 'Malawi'}

${dateStr}

The Hiring Manager / HR Department
${job.employer}
${job.location}

RE: APPLICATION FOR THE POSITION OF ${job.title.toUpperCase()}

Dear Hiring Manager,

I am writing to formally apply for the ${job.title} vacancy at ${job.employer}, as advertised. With my professional background as a ${profile.professionalTitle || 'Technology Specialist'} and demonstrated hands-on technical experience, I am confident in my ability to make a significant contribution to your organization.

My qualifications align well with your requirements. In my career to date, I have gained practical expertise in ${keySkills || 'systems administration, networking, database management, and technical support'}. ${profile.summary ? profile.summary : ''}

${customNote ? `Additional notes regarding this application: ${customNote}\n\n` : ''}I am eager to bring my problem-solving skills and technical background to ${job.employer}. Thank you for reviewing my application. I look forward to the opportunity of discussing my qualifications in an interview.

Yours faithfully,

${profile.fullName || 'Applicant'}`;
}

/**
 * Parses raw CV text or uploaded document content into a structured CandidateProfile
 */
export async function parseCvWithGemini(
  rawText?: string,
  fileBase64?: string,
  mimeType?: string
): Promise<Partial<CandidateProfile>> {
  const ai = getGeminiClient();

  const promptText = `
You are an expert AI HR Specialist and Resume Parser.
Analyze the provided Curriculum Vitae (CV) / resume and extract a comprehensive, accurately structured Candidate Profile.

Extract details strictly present in the document. Do not invent achievements, degrees, or false companies.
Return a structured JSON object.
  `;

  const contents: any[] = [];

  if (fileBase64 && mimeType) {
    contents.push({
      inlineData: {
        mimeType: mimeType,
        data: fileBase64,
      },
    });
  }

  contents.push({
    text: `${promptText}\n\nCandidate Raw CV / Details Provided:\n${rawText || "See attached file above."}`
  });

  try {
    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              professionalTitle: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              location: { type: Type.STRING },
              linkedIn: { type: Type.STRING },
              github: { type: Type.STRING },
              summary: { type: Type.STRING },
              technicalSkills: {
                type: Type.OBJECT,
                properties: {
                  systemsAndOS: { type: Type.ARRAY, items: { type: Type.STRING } },
                  networking: { type: Type.ARRAY, items: { type: Type.STRING } },
                  softwareDevelopment: { type: Type.ARRAY, items: { type: Type.STRING } },
                  databasesAndSQL: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cybersecurity: { type: Type.ARRAY, items: { type: Type.STRING } },
                  itSupportAndHardware: { type: Type.ARRAY, items: { type: Type.STRING } },
                  toolsAndFrameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["systemsAndOS", "networking", "softwareDevelopment", "databasesAndSQL", "cybersecurity", "itSupportAndHardware", "toolsAndFrameworks"],
              },
              workExperience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    jobTitle: { type: Type.STRING },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    isCurrent: { type: Type.BOOLEAN },
                    responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["jobTitle", "company", "startDate", "endDate", "responsibilities"],
                },
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    fieldOfStudy: { type: Type.STRING },
                    graduationYear: { type: Type.STRING },
                  },
                  required: ["degree", "institution", "fieldOfStudy", "graduationYear"],
                },
              },
              certifications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    issuingOrganization: { type: Type.STRING },
                    issueYear: { type: Type.STRING },
                  },
                  required: ["name", "issuingOrganization", "issueYear"],
                },
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    technologiesUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                    link: { type: Type.STRING },
                  },
                  required: ["title", "description", "technologiesUsed"],
                },
              },
              achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              "fullName",
              "professionalTitle",
              "email",
              "summary",
              "technicalSkills",
              "workExperience",
              "education",
              "certifications",
            ],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || "{}");
    return parsed;
  } catch (err: any) {
    console.warn("CV AI Parsing fallback triggered:", err.message);
    const text = rawText || "";
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+?\d{1,4}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/);

    return {
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
      summary: text ? text.slice(0, 350) : "Candidate CV details extracted.",
    };
  }
}

/**
 * Analyzes compatibility between Candidate Profile and Job Listing
 */
export async function analyzeJobMatchWithGemini(
  profile: CandidateProfile,
  job: JobListing
): Promise<JobMatchAnalysis> {
  const ai = getGeminiClient();

  const prompt = `
You are an expert Technical Recruiter & ICT Career Specialist evaluating a job candidate for a technology role in Malawi.

CANDIDATE PROFILE:
- Name: ${profile.fullName}
- Title: ${profile.professionalTitle}
- Summary: ${profile.summary}
- Technical Skills:
  - Systems/OS: ${profile.technicalSkills?.systemsAndOS?.join(", ") || "None"}
  - Networking: ${profile.technicalSkills?.networking?.join(", ") || "None"}
  - Software Dev: ${profile.technicalSkills?.softwareDevelopment?.join(", ") || "None"}
  - Databases/SQL: ${profile.technicalSkills?.databasesAndSQL?.join(", ") || "None"}
  - Cybersecurity: ${profile.technicalSkills?.cybersecurity?.join(", ") || "None"}
  - Support/Hardware: ${profile.technicalSkills?.itSupportAndHardware?.join(", ") || "None"}
  - Tools: ${profile.technicalSkills?.toolsAndFrameworks?.join(", ") || "None"}
- Work Experience: ${JSON.stringify(profile.workExperience || [])}
- Education: ${JSON.stringify(profile.education || [])}
- Certifications: ${JSON.stringify(profile.certifications || [])}

JOB VACANCY DETAILS:
- Job Title: ${job.title}
- Employer: ${job.employer}
- Location: ${job.location}
- Category: ${job.category}
- Raw Description: ${job.rawDescription}
- Qualifications Required: ${job.requiredQualifications.join("; ")}
- Technical Skills Required: ${job.requiredTechnicalSkills.join("; ")}

TASK:
1. Compare the candidate's genuine background against this job's responsibilities, required qualifications, and required technical skills.
2. Calculate a realistic Compatibility Score from 0 to 100 based on true match strength.
   - Note: Identify relevant job titles and background even if "ICT" is not explicitly in the job title (e.g., Digital Transformation, MIS Manager, Systems Analyst).
3. Identify "matchingSkills" (skills and experience the candidate explicitly possesses that match).
4. Identify "missingOrWeakRequirements" (skills/certifications/experience requested by the job that the candidate lacks or has minimal proof of).
5. Highlight "candidateStrengths" and provide a "gapSummary".
6. Write a clear "matchReasoning" explaining why this job is or is not a good fit.
  `;

  try {
    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              compatibilityScore: {
                type: Type.INTEGER,
                description: "Compatibility score from 0 to 100",
              },
              matchReasoning: { type: Type.STRING },
              matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingOrWeakRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              candidateStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              gapSummary: { type: Type.STRING },
            },
            required: [
              "compatibilityScore",
              "matchReasoning",
              "matchingSkills",
              "missingOrWeakRequirements",
              "candidateStrengths",
              "gapSummary",
            ],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || "{}");

    return {
      jobId: job.id,
      compatibilityScore: Math.min(100, Math.max(0, parsed.compatibilityScore || 50)),
      matchReasoning: parsed.matchReasoning || "Analyzed compatibility against ICT candidate profile.",
      matchingSkills: parsed.matchingSkills || [],
      missingOrWeakRequirements: parsed.missingOrWeakRequirements || [],
      candidateStrengths: parsed.candidateStrengths || [],
      gapSummary: parsed.gapSummary || "",
      analyzedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    console.warn(`Job Match AI evaluation fallback used for ${job.id}:`, err.message);
    return calculateHeuristicJobMatch(profile, job);
  }
}

/**
 * Generates a customized, professional application letter strictly grounded in CV truth
 */
export async function generateCoverLetterWithGemini(
  profile: CandidateProfile,
  job: JobListing,
  customNote?: string
): Promise<string> {
  const ai = getGeminiClient();

  const prompt = `
You are an expert Executive Career Coach and Technical Application Strategist.
Write a highly professional, tailored Cover / Application Letter for a candidate applying for a position in Malawi.

CRITICAL MANDATORY RULES (STRICT CV GROUNDING):
1. NEVER INVENT or hallucinate any degree, job experience, company name, project, certification, or skill that is NOT explicitly stated in the Candidate Profile below.
2. Emphasize genuine qualifications and real achievements that directly correspond to the employer's stated priorities and key requirements.
3. Naturally incorporate technical terminology and priorities from the job advertisement without sounding artificial or generic.
4. Avoid repetitive, cliché AI phrases like "I am thrilled to express my enthusiastic interest in supercharging your team". Keep the tone poised, formal, crisp, and professional.
5. Format the letter cleanly as a standard formal job application letter (including address headers, date, subject line, formal greeting, 3-4 structured body paragraphs, and respectful sign-off).
6. Target length: Approx 350-500 words (fitting cleanly on one printed page).

CANDIDATE PROFILE:
- Full Name: ${profile.fullName}
- Professional Title: ${profile.professionalTitle}
- Email: ${profile.email} | Phone: ${profile.phone} | Address: ${profile.location}
- Summary: ${profile.summary}
- Skills: ${JSON.stringify(profile.technicalSkills)}
- Work Experience: ${JSON.stringify(profile.workExperience)}
- Education: ${JSON.stringify(profile.education)}
- Certifications: ${JSON.stringify(profile.certifications)}
- Notable Projects: ${JSON.stringify(profile.projects)}

JOB ADVERTISEMENT DETAILS:
- Position Title: ${job.title}
- Hiring Employer: ${job.employer}
- Job Location: ${job.location}
- Application Contact / Method: ${job.applicationMethod}
- Closing Date: ${job.closingDate}
- Advertised Description & Requirements: ${job.rawDescription}
- Technical Requirements: ${job.requiredTechnicalSkills.join(", ")}

USER CUSTOM INSTRUCTIONS (IF ANY):
${customNote || "Focus on strong alignment with systems administration, database management, and web software capabilities."}

Generate the full formal application letter text now in Markdown format.
  `;

  try {
    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.3, // Lower temperature to ensure strict grounding
        },
      })
    );

    return response.text || generateHeuristicCoverLetter(profile, job, customNote);
  } catch (err: any) {
    console.warn(`Cover Letter AI generation fallback used for ${job.id}:`, err.message);
    return generateHeuristicCoverLetter(profile, job, customNote);
  }
}

