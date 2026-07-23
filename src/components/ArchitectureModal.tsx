import React from 'react';
import { X, Server, Database, Code2, Globe, Shield, Cpu, Layers } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D2A]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D4D3C9] flex flex-col my-auto">
        
        {/* Header */}
        <div className="p-6 bg-[#2D2D2A] text-white flex items-start justify-between border-b border-[#5A5A40] sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <Cpu className="h-4 w-4" />
              <span>Full System Proposal &amp; Technical Specifications</span>
            </div>
            <h2 className="text-xl font-serif text-white">
              AI Job Finder &amp; Application Assistant Architecture
            </h2>
            <p className="text-xs text-[#D4D3C9]">
              Modular site retrieval, AI processing, database schema &amp; API design
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#D4D3C9] hover:text-white hover:bg-[#5A5A40] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-[#2D2D2A] leading-relaxed">
          
          {/* Section 1: Website Analysis & Retrieval */}
          <div className="bg-[#F8F7F4] rounded-2xl p-4 border border-[#D4D3C9] space-y-2">
            <h3 className="font-serif font-bold text-[#2D2D2A] text-sm flex items-center space-x-2">
              <Globe className="h-4 w-4 text-[#5A5A40]" />
              <span>1. Website Structure Analysis: jobsearchmalawi.com</span>
            </h3>
            <p className="text-[#2D2D2A]/80">
              `jobsearchmalawi.com` organizes job listings under WordPress taxonomy structures (e.g. `/category/information-technology-ict/`).
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#2D2D2A] pl-2 font-medium">
              <li><strong>Site Ingestion Strategy:</strong> Modular fetcher with HTML parsing &amp; direct URL scraper fallback.</li>
              <li><strong>Duplicate Detection:</strong> Fingerprinting via normalized hash: <code>hash(Title + Employer + ClosingDate)</code>.</li>
              <li><strong>Rate Limiting &amp; Respectful Access:</strong> 15-minute server caching TTL + user-agent headers to avoid site spamming.</li>
              <li><strong>Expiry Detection:</strong> Checks closing date vs. current system date (2026-07-23).</li>
            </ul>
          </div>

          {/* Section 2: System Architecture & Technology Stack */}
          <div className="bg-[#F8F7F4] rounded-2xl p-4 border border-[#D4D3C9] space-y-2">
            <h3 className="font-serif font-bold text-[#2D2D2A] text-sm flex items-center space-x-2">
              <Layers className="h-4 w-4 text-[#5A5A40]" />
              <span>2. Technology Stack &amp; Modular Separation</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-xl border border-[#D4D3C9]">
                <span className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider block">Frontend UI Layer:</span>
                <p className="text-[#2D2D2A] mt-0.5">React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide React icons + Motion animations.</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#D4D3C9]">
                <span className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider block">Server API &amp; Scraper:</span>
                <p className="text-[#2D2D2A] mt-0.5">Express Node.js server (`server.ts`) listening on port 3000, Vite middleware for development, esbuild bundler for production.</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#D4D3C9]">
                <span className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider block">AI Intelligence Engine:</span>
                <p className="text-[#2D2D2A] mt-0.5"><code>@google/genai</code> SDK with <code>gemini-3.6-flash</code> running strictly server-side for CV parsing, job matching, and cover letter generation.</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#D4D3C9]">
                <span className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider block">Security &amp; Privacy:</span>
                <p className="text-[#2D2D2A] mt-0.5">GEMINI_API_KEY remains hidden on the server; zero automatic email submissions without explicit user confirmation.</p>
              </div>
            </div>
          </div>

          {/* Section 3: Database Schema */}
          <div className="bg-[#F8F7F4] rounded-2xl p-4 border border-[#D4D3C9] space-y-2">
            <h3 className="font-serif font-bold text-[#2D2D2A] text-sm flex items-center space-x-2">
              <Database className="h-4 w-4 text-[#5A5A40]" />
              <span>3. Core Data Schemas</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
              <div className="p-3 bg-[#2D2D2A] text-[#F8F7F4] rounded-xl space-y-1">
                <span className="text-emerald-400 font-bold block">CandidateProfile Schema:</span>
                <p>fullName, professionalTitle, email, phone, location, summary</p>
                <p>technicalSkills: &#123; systemsAndOS, networking, softwareDevelopment, databasesAndSQL, cybersecurity, itSupportAndHardware &#125;</p>
                <p>workExperience: array of &#123; jobTitle, company, startDate, endDate, responsibilities &#125;</p>
                <p>education, certifications, projects, achievements</p>
              </div>

              <div className="p-3 bg-[#2D2D2A] text-[#F8F7F4] rounded-xl space-y-1">
                <span className="text-[#E5E5DF] font-bold block">JobListing Schema:</span>
                <p>id, title, employer, location, closingDate, applicationMethod, url, rawDescription</p>
                <p>requiredQualifications, requiredTechnicalSkills, responsibilities, category, isExpired, fingerprint</p>
              </div>
            </div>
          </div>

          {/* Section 4: API Routes Specification */}
          <div className="bg-[#F8F7F4] rounded-2xl p-4 border border-[#D4D3C9] space-y-2">
            <h3 className="font-serif font-bold text-[#2D2D2A] text-sm flex items-center space-x-2">
              <Code2 className="h-4 w-4 text-[#5A5A40]" />
              <span>4. Server REST API Specifications</span>
            </h3>
            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 bg-white rounded-xl border border-[#D4D3C9] font-mono">
                <span className="font-bold text-[#5A5A40]">GET /api/jobs</span> — Fetch active ICT vacancies with optional ?refresh=true
              </div>
              <div className="p-2 bg-white rounded-xl border border-[#D4D3C9] font-mono">
                <span className="font-bold text-[#5A5A40]">POST /api/jobs/scrape-url</span> — Ingest and extract structured details from single vacancy link
              </div>
              <div className="p-2 bg-white rounded-xl border border-[#D4D3C9] font-mono">
                <span className="font-bold text-[#5A5A40]">POST /api/profile/parse-cv</span> — Analyze raw text or PDF/DOCX file base64 into CandidateProfile
              </div>
              <div className="p-2 bg-white rounded-xl border border-[#D4D3C9] font-mono">
                <span className="font-bold text-[#5A5A40]">POST /api/jobs/match</span> — Calculate 0–100% compatibility, match reasoning, and skill gaps
              </div>
              <div className="p-2 bg-white rounded-xl border border-[#D4D3C9] font-mono">
                <span className="font-bold text-[#5A5A40]">POST /api/jobs/generate-letter</span> — Generate tailored cover application letter strictly grounded in CV truth
              </div>
              <div className="p-2 bg-white rounded-xl border border-[#D4D3C9] font-mono">
                <span className="font-bold text-[#5A5A40]">GET / POST / DELETE /api/applications</span> — Application pipeline tracker endpoints
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8F7F4] border-t border-[#D4D3C9] flex justify-end sticky bottom-0 z-10 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#2D2D2A] hover:bg-[#1D1D1A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
          >
            Close Specifications
          </button>
        </div>

      </div>
    </div>
  );
};
