import React, { useState } from 'react';
import { CandidateProfile, JobListing, JobMatchAnalysis, TrackedApplication } from '../types';
import { Sparkles, Briefcase, CheckCircle2, Calendar, FileText, ArrowRight, TrendingUp, AlertTriangle, Search, PlusCircle } from 'lucide-react';

interface DashboardViewProps {
  profile: CandidateProfile;
  jobs: JobListing[];
  matchesMap: Record<string, JobMatchAnalysis>;
  applications: TrackedApplication[];
  onSelectJob: (job: JobListing) => void;
  onNavigateTab: (tab: 'dashboard' | 'jobs' | 'profile' | 'applications') => void;
  onIngestUrl: (url: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  jobs,
  matchesMap,
  applications,
  onSelectJob,
  onNavigateTab,
  onIngestUrl,
}) => {
  const [pastedUrl, setPastedUrl] = useState('');

  // Calculate metrics
  const activeJobs = jobs.filter(j => !j.isExpired);
  
  // Calculate high compatibility count (>75%)
  const highMatchJobs = jobs.filter(j => {
    const m = matchesMap[j.id];
    return m && m.compatibilityScore >= 75;
  });

  // Calculate upcoming deadlines (within 14 days)
  const urgentDeadlines = activeJobs.filter(j => {
    if (!j.closingDate) return false;
    const diffDays = Math.ceil((new Date(j.closingDate).getTime() - new Date('2026-07-23').getTime()) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 14;
  });

  // Top recommended sorted by compatibility
  const topRecommendations = [...jobs].sort((a, b) => {
    const scoreA = matchesMap[a.id]?.compatibilityScore || 0;
    const scoreB = matchesMap[b.id]?.compatibilityScore || 0;
    return scoreB - scoreA;
  }).slice(0, 4);

  const handleIngestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pastedUrl.trim()) {
      onIngestUrl(pastedUrl.trim());
      setPastedUrl('');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D4D3C9] shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#5A5A40]">
              <Sparkles className="h-4 w-4" />
              <span>AI Job Finder &amp; Candidate Match Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#2D2D2A] leading-tight">
              Welcome back, <span className="italic text-[#5A5A40] font-normal">{profile.fullName || 'ICT Professional'}</span>
            </h1>
            <p className="text-[#2D2D2A]/70 text-sm leading-relaxed font-sans">
              Targeted for ICT, Computer Science, Systems Administration, Software Engineering, Cybersecurity &amp; Database roles across Malawi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onNavigateTab('jobs')}
              className="px-5 py-3 rounded-2xl bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold text-xs uppercase tracking-widest shadow-xs transition flex items-center justify-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Explore All {jobs.length} Vacancies</span>
            </button>
            <button
              onClick={() => onNavigateTab('profile')}
              className="px-4 py-3 rounded-2xl bg-[#E5E5DF] hover:bg-[#D4D3C9] text-[#5A5A40] border border-[#D4D3C9] font-bold text-xs uppercase tracking-widest transition flex items-center justify-center space-x-2"
            >
              <span>Edit Candidate CV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#D4D3C9] shadow-sm hover:border-[#5A5A40]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-[#5A5A40] tracking-widest">ICT Opportunities</span>
            <div className="p-2.5 bg-[#F8F7F4] text-[#5A5A40] rounded-xl border border-[#D4D3C9]">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-serif font-bold text-[#2D2D2A]">{activeJobs.length}</span>
            <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live &amp; Active
            </span>
          </div>
          <p className="text-xs text-[#2D2D2A]/60 mt-1">jobsearchmalawi.com listings</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D4D3C9] shadow-sm hover:border-[#5A5A40]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-[#5A5A40] tracking-widest">Top Matches (&gt;75%)</span>
            <div className="p-2.5 bg-[#F8F7F4] text-[#5A5A40] rounded-xl border border-[#D4D3C9]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-serif font-bold text-[#2D2D2A]">{highMatchJobs.length}</span>
            <span className="text-[10px] font-bold uppercase text-[#5A5A40] bg-[#E5E5DF] px-2.5 py-1 rounded-full border border-[#D4D3C9]">
              High Fit
            </span>
          </div>
          <p className="text-xs text-[#2D2D2A]/60 mt-1">Based on genuine CV skills</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D4D3C9] shadow-sm hover:border-[#5A5A40]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-[#5A5A40] tracking-widest">Applications Tracked</span>
            <div className="p-2.5 bg-[#F8F7F4] text-[#5A5A40] rounded-xl border border-[#D4D3C9]">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-serif font-bold text-[#2D2D2A]">{applications.length}</span>
            <span className="text-[10px] font-bold uppercase text-[#5A5A40] bg-[#E5E5DF] px-2.5 py-1 rounded-full border border-[#D4D3C9]">
              Saved / Pipeline
            </span>
          </div>
          <p className="text-xs text-[#2D2D2A]/60 mt-1">Status tracker active</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D4D3C9] shadow-sm hover:border-[#5A5A40]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-[#5A5A40] tracking-widest">Closing Soon</span>
            <div className="p-2.5 bg-[#F8F7F4] text-amber-700 rounded-xl border border-[#D4D3C9]">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-serif font-bold text-[#2D2D2A]">{urgentDeadlines.length}</span>
            <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Next 14 Days
            </span>
          </div>
          <p className="text-xs text-[#2D2D2A]/60 mt-1">Action required before closing</p>
        </div>
      </div>

      {/* Fast URL Ingest Input Card */}
      <div className="bg-[#2D2D2A] text-white rounded-2xl p-5 border border-[#2D2D2A] shadow-sm">
        <form onSubmit={handleIngestSubmit} className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 w-full md:w-auto">
            <div className="flex items-center space-x-2 text-[#E5E5DF] font-bold text-xs uppercase tracking-wider">
              <PlusCircle className="h-4 w-4 text-[#D4D3C9]" />
              <span>Ingest Specific Job URL</span>
            </div>
            <p className="text-xs text-[#D4D3C9]/80 font-sans">
              Paste any vacancy page link from jobsearchmalawi.com to parse, evaluate match, and generate a tailored application letter.
            </p>
          </div>
          <div className="flex w-full md:w-auto items-center space-x-2">
            <input
              type="url"
              placeholder="https://jobsearchmalawi.com/job/..."
              value={pastedUrl}
              onChange={(e) => setPastedUrl(e.target.value)}
              className="px-3.5 py-2.5 bg-[#3A3A36] border border-[#5A5A40] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] w-full md:w-80"
              required
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition whitespace-nowrap shadow-xs"
            >
              Ingest &amp; Match
            </button>
          </div>
        </form>
      </div>

      {/* Main Grid: Top Recommended Matches + Application Tracker Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recommended ICT Roles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-light text-[#2D2D2A] flex items-center space-x-2">
                <span>Matches from <span className="italic text-[#5A5A40]">jobsearchmalawi.com</span></span>
              </h2>
              <p className="text-xs text-[#2D2D2A]/60">Ranked by genuine technical CV background compatibility</p>
            </div>
            <button
              onClick={() => onNavigateTab('jobs')}
              className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] hover:underline flex items-center space-x-1"
            >
              <span>View All ({jobs.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topRecommendations.map((job) => {
              const match = matchesMap[job.id];
              const score = match ? match.compatibilityScore : 70;

              return (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className="bg-white rounded-3xl p-6 border border-[#D4D3C9] shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#E5E5DF] text-[#5A5A40] uppercase tracking-wider border border-[#D4D3C9]">
                        {job.category}
                      </span>
                      
                      {/* Match score pill */}
                      <div className="flex items-center space-x-1.5 bg-[#F8F7F4] border border-[#D4D3C9] px-3 py-1 rounded-full text-xs font-serif font-bold text-[#5A5A40]">
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                        <span>{score}% Fit</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-[#2D2D2A] text-base group-hover:text-[#5A5A40] transition line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#5A5A40] mt-1">{job.employer}</p>
                      <p className="text-xs text-[#2D2D2A]/60">{job.location}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredTechnicalSkills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-[11px] bg-[#F8F7F4] text-[#2D2D2A]/80 px-2.5 py-0.5 rounded-md border border-[#D4D3C9] font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#D4D3C9] flex items-center justify-between text-xs text-[#2D2D2A]/60">
                    <div className="flex items-center space-x-1 text-[11px]">
                      <Calendar className="h-3.5 w-3.5 text-[#5A5A40]" />
                      <span>Closes: {job.closingDate}</span>
                    </div>
                    <span className="text-[#5A5A40] font-bold text-xs uppercase tracking-wider group-hover:underline flex items-center gap-1">
                      <span>Analyze</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Application Pipeline & Urgent Reminders */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-[#D4D3C9] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#D4D3C9] pb-3">
              <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-[0.1em]">Active Pipeline</h3>
              <button
                onClick={() => onNavigateTab('applications')}
                className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider hover:underline"
              >
                Manage Tracker
              </button>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Saved / Interested', count: applications.filter(a => a.status === 'Interested' || a.status === 'New').length, accent: 'border-l-amber-500' },
                { label: 'Letter Generated', count: applications.filter(a => a.status === 'Letter Generated').length, accent: 'border-l-purple-500' },
                { label: 'Submitted / Applied', count: applications.filter(a => a.status === 'Applied').length, accent: 'border-l-emerald-500' },
                { label: 'Interviews Scheduled', count: applications.filter(a => a.status === 'Interview').length, accent: 'border-l-[#5A5A40]' },
              ].map((item, idx) => (
                <div key={idx} className={`p-3 rounded-xl bg-[#F8F7F4] border-l-4 ${item.accent} border border-[#D4D3C9] flex items-center justify-between text-xs`}>
                  <span className="font-semibold text-[#2D2D2A]">{item.label}</span>
                  <span className="font-serif font-bold text-sm text-[#5A5A40] px-2 py-0.5 bg-white rounded-lg border border-[#D4D3C9]">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Closing Soon Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-[#D4D3C9] shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-[#5A5A40] font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Upcoming Vacancy Deadlines</span>
            </div>

            {urgentDeadlines.length === 0 ? (
              <p className="text-xs text-[#2D2D2A]/60 italic">No urgent deadlines in the next 14 days.</p>
            ) : (
              <div className="space-y-2">
                {urgentDeadlines.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D4D3C9] cursor-pointer hover:border-[#5A5A40] transition"
                  >
                    <p className="text-xs font-bold text-[#2D2D2A] line-clamp-1">{job.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-[#5A5A40] mt-1">
                      <span>{job.employer}</span>
                      <span className="font-bold text-amber-800">Closes: {job.closingDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
