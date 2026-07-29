import React from "react";
import {
  JobFilterState,
  JobListing,
  JobMatchAnalysis,
  TrackedApplication,
} from "../types";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Briefcase,
  CheckCircle2,
  Sparkles,
  XCircle,
  ArrowUpRight,
  FileText,
  BookmarkCheck,
} from "lucide-react";

interface JobExplorerViewProps {
  jobs: JobListing[];
  matchesMap: Record<string, JobMatchAnalysis>;
  applications: TrackedApplication[];
  filterState: JobFilterState;
  setFilterState: React.Dispatch<React.SetStateAction<JobFilterState>>;
  onSelectJob: (job: JobListing) => void;
  onGenerateLetter: (job: JobListing) => void;
  onTrackJob: (job: JobListing) => void;
}

const ALL_CATEGORIES = [
  "All",
  "IT Officer",
  "ICT Officer",
  "Systems Administrator",
  "Network Administrator",
  "Software Developer",
  "Web Developer",
  "Database Administrator",
  "IT Support",
  "ICT Technician",
  "Cybersecurity",
  "Information Systems",
  "Systems Analyst",
  "Technical Project Management",
];

export const JobExplorerView: React.FC<JobExplorerViewProps> = ({
  jobs,
  matchesMap,
  applications,
  filterState,
  setFilterState,
  onSelectJob,
  onGenerateLetter,
  onTrackJob,
}) => {
  const trackedJobIds = new Set(applications.map((a) => a.jobId));

  const handleResetFilters = () => {
    setFilterState({
      searchQuery: "",
      category: "All",
      minScore: 0,
      location: "All",
      workType: "All",
      hideExpired: true,
      statusFilter: "All",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#2D2D2A] leading-tight">
            ICT &amp; Technical Job Listings
          </h1>
          <p className="text-[#2D2D2A]/60 text-xs">
            Monitored &amp; parsed from jobsearchmalawi.com with AI profile
            matching
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#5A5A40] bg-white px-3.5 py-2 rounded-xl border border-[#D4D3C9] shadow-xs">
          <span className="font-serif font-bold text-sm text-[#2D2D2A]">
            {jobs.length}
          </span>
          <span>total opportunities loaded</span>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#D4D3C9] shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#5A5A40] uppercase tracking-wider border-b border-[#D4D3C9] pb-3">
          <Filter className="h-4 w-4 text-[#5A5A40]" />
          <span>Filter &amp; Search Options</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider">
              Search Keywords
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#5A5A40]/50" />
              <input
                type="text"
                placeholder="Title, employer, SQL, Linux..."
                value={filterState.searchQuery}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    searchQuery: e.target.value,
                  }))
                }
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-[#2D2D2A]"
              />
            </div>
          </div>

          {/* Job Category */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider">
              ICT Job Category
            </label>
            <select
              value={filterState.category}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              className="w-full px-3 py-2 text-xs bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-[#2D2D2A]"
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider">
              Location
            </label>
            <select
              value={filterState.location}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              className="w-full px-3 py-2 text-xs bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-[#2D2D2A]"
            >
              <option value="All">All Malawi Locations</option>
              <option value="Blantyre">Blantyre</option>
              <option value="Lilongwe">Lilongwe</option>
              <option value="Mzuzu">Mzuzu</option>
            </select>
          </div>

          {/* Compatibility score slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider">
                Min Match Score
              </label>
              <span className="font-serif font-bold text-[#5A5A40]">
                {filterState.minScore}%+
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={filterState.minScore}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  minScore: Number(e.target.value),
                }))
              }
              className="w-full accent-[#5A5A40] cursor-pointer h-2 bg-[#E5E5DF] rounded-lg"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-[#D4D3C9] gap-3 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer text-[#2D2D2A] font-medium">
            <input
              type="checkbox"
              checked={filterState.hideExpired}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  hideExpired: e.target.checked,
                }))
              }
              className="rounded text-[#5A5A40] focus:ring-[#5A5A40] h-4 w-4"
            />
            <span>Hide expired vacancies (closing date passed)</span>
          </label>

          <button
            onClick={handleResetFilters}
            className="text-[#5A5A40] hover:text-[#2D2D2A] font-bold text-xs uppercase tracking-wider underline underline-offset-2 self-start sm:self-auto"
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Job Card List */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#D4D3C9] space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#F8F7F4] text-[#5A5A40] border border-[#D4D3C9] flex items-center justify-center">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="font-serif font-bold text-[#2D2D2A]">
            No vacancies match your current filter criteria
          </h3>
          <p className="text-xs text-[#2D2D2A]/60 max-w-sm mx-auto">
            Try adjusting the search query, lowering the match score threshold,
            or enabling expired vacancies.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#5A5A40] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#4A4A35] transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => {
            const match = matchesMap[job.id];
            const score = match ? match.compatibilityScore : 70;
            const isSaved = trackedJobIds.has(job.id);

            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-6 border border-[#D4D3C9] shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-3">
                  {/* Top line: Category, Expiry status & Score badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#E5E5DF] text-[#5A5A40] border border-[#D4D3C9] uppercase tracking-wider">
                        {job.category}
                      </span>
                      {job.isExpired ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 uppercase tracking-wider">
                          Expired
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Compatibility score pill */}
                    <div className="flex items-center space-x-1.5 bg-[#F8F7F4] border border-[#D4D3C9] px-3 py-1 rounded-full text-xs font-serif font-bold text-[#5A5A40]">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                      <span>{score}% Fit</span>
                    </div>
                  </div>

                  {/* Job Title & Employer */}
                  <div>
                    <h2
                      onClick={() => onSelectJob(job)}
                      className="text-base font-bold text-[#2D2D2A] hover:text-[#5A5A40] transition cursor-pointer leading-snug"
                    >
                      {job.title}
                    </h2>
                    <p className="text-xs font-bold text-[#5A5A40] mt-1">
                      {job.employer}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-[#2D2D2A]/60 mt-1">
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-3.5 w-3.5 text-[#5A5A40]" />
                        <span>{job.location}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-[#5A5A40]" />
                        <span>Closes: {job.closingDate}</span>
                      </span>
                    </div>
                  </div>

                  {/* Raw Description Excerpt */}
                  <p className="text-xs text-[#2D2D2A]/70 line-clamp-2 leading-relaxed">
                    {job.rawDescription}
                  </p>

                  {/* Required Technical Skills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.requiredTechnicalSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-[#F8F7F4] text-[#2D2D2A]/80 px-2.5 py-0.5 rounded-md font-medium border border-[#D4D3C9]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* AI Match reasoning snippet */}
                  {match && (
                    <div className="p-3 bg-[#F8F7F4] rounded-2xl border border-[#D4D3C9] text-xs text-[#2D2D2A]/80 space-y-1">
                      <p className="font-bold text-[#5A5A40] flex items-center space-x-1 uppercase text-[10px] tracking-wider">
                        <Sparkles className="h-3 w-3 text-amber-600" />
                        <span>AI Match Analysis:</span>
                      </p>
                      <p className="text-[#2D2D2A]/70 line-clamp-2 text-[11px]">
                        {match.matchReasoning}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-4 border-t border-[#D4D3C9] flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectJob(job)}
                    className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] hover:underline flex items-center space-x-1 transition"
                  >
                    <span>View Breakdown</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onTrackJob(job)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1 ${
                        isSaved
                          ? "bg-[#E5E5DF] text-[#5A5A40] border border-[#D4D3C9]"
                          : "bg-[#F8F7F4] hover:bg-[#E5E5DF] text-[#2D2D2A] border border-[#D4D3C9]"
                      }`}
                    >
                      <BookmarkCheck className="h-3.5 w-3.5" />
                      <span>{isSaved ? "Saved" : "Save"}</span>
                    </button>

                    <button
                      onClick={() => onGenerateLetter(job)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition flex items-center space-x-1"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Generate Letter</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
