export type ApplicationStatus =
  | "New"
  | "Interested"
  | "Letter Generated"
  | "Applied"
  | "Interview"
  | "Rejected"
  | "Successful";

export type JobCategory =
  | "IT Officer"
  | "ICT Officer"
  | "Systems Administrator"
  | "Network Administrator"
  | "Software Developer"
  | "Web Developer"
  | "Database Administrator"
  | "IT Support"
  | "ICT Technician"
  | "Cybersecurity"
  | "Information Systems"
  | "Systems Analyst"
  | "Database and SQL"
  | "Technical Project Management"
  | "Other ICT Role";

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueYear: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologiesUsed: string[];
  link?: string;
}

export interface TechnicalSkills {
  systemsAndOS: string[];
  networking: string[];
  softwareDevelopment: string[];
  databasesAndSQL: string[];
  cybersecurity: string[];
  itSupportAndHardware: string[];
  toolsAndFrameworks: string[];
}

export interface UploadedCertificate {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  fileDataUrl: string;
}

export interface CandidateProfile {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  photoUrl?: string;
  location: string;
  linkedIn?: string;
  github?: string;
  summary: string;
  technicalSkills: TechnicalSkills;
  workExperience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  achievements: string[];
  rawCvText?: string;
  lastUpdated?: string;
  certificates?: UploadedCertificate[];
}

export interface JobListing {
  id: string;
  title: string;
  employer: string;
  location: string;
  closingDate: string; // YYYY-MM-DD
  applicationMethod: string; // email address or application portal link
  url: string;
  rawDescription: string;
  requiredQualifications: string[];
  requiredTechnicalSkills: string[];
  responsibilities: string[];
  category: JobCategory;
  postedDate: string;
  workType?: string; // e.g., Full-time, Part-time, Contract
  isExpired: boolean;
  fingerprint: string;
  sourceUrl?: string;
}

export interface JobMatchAnalysis {
  jobId: string;
  compatibilityScore: number; // 0 to 100
  matchReasoning: string;
  matchingSkills: string[];
  missingOrWeakRequirements: string[];
  candidateStrengths: string[];
  gapSummary: string;
  analyzedAt: string;
}

export interface TrackedApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  employer: string;
  location: string;
  status: ApplicationStatus;
  applicationDate?: string;
  closingDate: string;
  applicationContact: string; // email or URL
  generatedLetter?: string;
  notes?: string;
  followUpReminderDate?: string;
  updatedAt: string;
  sentAt?: string;
  gmailMessageId?: string;
  attachmentMode?: "merged" | "individual";
  recipientEmail?: string;
  attachmentNames?: string[];
}

export interface JobFilterState {
  searchQuery: string;
  category: string;
  minScore: number;
  location: string;
  workType: string;
  hideExpired: boolean;
  statusFilter: string;
}

export interface SystemLogs {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  source: string;
}

export interface ApiEmailAttachment {
  filename: string;
  mimeType?: string;
  dataUrl?: string;
  arrayBuffer?: ArrayBuffer;
  base64?: string;
}

export interface SendGmailRequestPayload {
  recipientEmail: string;
  subject: string;
  bodyText: string;
  attachments?: ApiEmailAttachment[];
}

// Explicit structure for the unified backend API response
export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  [key: string]: any;
}
