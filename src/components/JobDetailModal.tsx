import React, { useState } from 'react';
import { JobListing, JobMatchAnalysis } from '../types';
import { X, Calendar, MapPin, Building, Sparkles, CheckCircle, AlertTriangle, FileText, Bookmark, ExternalLink, RefreshCw } from 'lucide-react';

interface JobDetailModalProps {
  job: JobListing | null;
  match: JobMatchAnalysis | null;
  isLoadingMatch: boolean;
  onClose: () => void;
  onGenerateLetter: (job: JobListing) => void;
  onTrackJob: (job: JobListing) => void;
  isTracked: boolean;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  match,
  isLoadingMatch,
  onClose,
  onGenerateLetter,
  onTrackJob,
  isTracked,
}) => {
  if (!job) return null;

  const score = match ? match.compatibilityScore : 70;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D2A]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D4D3C9] flex flex-col my-auto">
        
        {/* Header */}
        <div className="p-6 bg-[#2D2D2A] text-white flex items-start justify-between border-b border-[#5A5A40] sticky top-0 z-10">
          <div className="space-y-1 pr-6">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#5A5A40] text-[#E5E5DF] border border-[#D4D3C9]/40">
                {job.category}
              </span>
              {job.isExpired && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-900/60 text-rose-200 border border-rose-700/50">
                  Expired Vacancy
                </span>
              )}
            </div>
            <h2 className="text-xl font-serif text-white leading-tight mt-1">{job.title}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#D4D3C9] mt-2">
              <span className="flex items-center space-x-1 font-bold text-[#E5E5DF]">
                <Building className="h-3.5 w-3.5 text-[#D4D3C9]" />
                <span>{job.employer}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="h-3.5 w-3.5 text-[#D4D3C9]" />
                <span>{job.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5 text-[#D4D3C9]" />
                <span>Closes: {job.closingDate}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#D4D3C9] hover:text-white hover:bg-[#5A5A40] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 flex-1">

          {/* AI Compatibility Meter Card */}
          <div className="bg-[#2D2D2A] rounded-2xl p-5 text-white border border-[#5A5A40] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center space-x-5">
              {/* Score circle */}
              <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-[#5A5A40] border-2 border-[#D4D3C9] text-white font-serif font-black text-2xl shadow-inner shrink-0">
                <span>{score}%</span>
              </div>
              <div className="space-y-1 max-w-md">
                <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>AI Match Evaluation</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-[#F8F7F4]">
                  {score >= 80 ? 'Highly Compatible ICT Opportunity' : score >= 60 ? 'Good Moderate Match' : 'Limited Skill Overlap'}
                </h3>
                <p className="text-xs text-[#D4D3C9] leading-relaxed">
                  {match ? match.matchReasoning : 'Evaluating candidate background against position requirements...'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={() => onGenerateLetter(job)}
                className="px-4 py-2.5 bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 border border-[#D4D3C9]/30"
              >
                <FileText className="h-4 w-4" />
                <span>Generate Application Letter</span>
              </button>
            </div>
          </div>

          {/* Skill Breakdown Grid */}
          {isLoadingMatch ? (
            <div className="p-8 text-center text-[#2D2D2A]/60 space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#5A5A40]" />
              <p className="text-xs">Analyzing CV against job specifications with AI...</p>
            </div>
          ) : match ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matching Skills */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
                  <CheckCircle className="h-4 w-4 text-emerald-700" />
                  <span>Matching Skills ({match.matchingSkills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {match.matchingSkills.map((sk, i) => (
                    <span key={i} className="text-[11px] bg-white text-emerald-900 font-bold px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing / Weak Requirements */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-700" />
                  <span>Missing / Gap Requirements ({match.missingOrWeakRequirements.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {match.missingOrWeakRequirements.map((sk, i) => (
                    <span key={i} className="text-[11px] bg-white text-amber-900 font-bold px-2.5 py-0.5 rounded-lg border border-amber-200">
                      ⚠ {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Application Details */}
          <div className="space-y-4 pt-2 border-t border-[#D4D3C9]">
            <h3 className="font-serif font-bold text-[#2D2D2A] text-sm">Full Job Description &amp; Specifications</h3>
            
            <div className="bg-[#F8F7F4] rounded-2xl p-4 border border-[#D4D3C9] text-xs text-[#2D2D2A] space-y-3 leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto">
              {job.rawDescription}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D4D3C9] space-y-1">
                <span className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider block">Required Qualifications:</span>
                <ul className="list-disc list-inside space-y-1 text-[#2D2D2A] mt-1">
                  {job.requiredQualifications.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D4D3C9] space-y-1">
                <span className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider block">Application Method / Contact:</span>
                <p className="text-[#5A5A40] font-mono text-xs mt-1 break-all font-bold">
                  {job.applicationMethod}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8F7F4] border-t border-[#D4D3C9] flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10 rounded-b-3xl">
          <button
            onClick={() => onTrackJob(job)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition flex items-center space-x-1.5 ${
              isTracked
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-white hover:bg-[#E5E5DF] text-[#2D2D2A] border-[#D4D3C9]'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>{isTracked ? 'Saved to Tracker' : 'Save / Track Job'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#E5E5DF] hover:bg-[#D4D3C9] text-[#2D2D2A] font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1"
            >
              <span>View Source</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <button
              onClick={() => onGenerateLetter(job)}
              className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <FileText className="h-4 w-4 text-white" />
              <span>Generate Application Letter</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
