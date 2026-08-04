import React from "react";
import aiLogo from "../../assets/ai_job_search_logo.png";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  User as UserIcon,
  Globe,
  Code2,
  Sparkles,
  RefreshCw,
  LogOut,
} from "lucide-react";

interface NavbarUser {
  displayName?: string;
  email?: string;
  photoURL?: string;
}

interface NavbarProps {
  activeTab: "dashboard" | "jobs" | "profile" | "applications";
  setActiveTab: (
    tab: "dashboard" | "jobs" | "profile" | "applications",
  ) => void;
  onOpenScrapeModal: () => void;
  onOpenArchitectureModal: () => void;
  isRefreshingJobs: boolean;
  onRefreshJobs: () => void;
  candidateName: string;
  candidatePhotoUrl?: string;
  user?: NavbarUser | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenScrapeModal,
  onOpenArchitectureModal,
  isRefreshingJobs,
  onRefreshJobs,
  candidateName,
  candidatePhotoUrl,
  user,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white text-[#2D2D2A] border-b border-[#D4D3C9] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Application Branding */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActiveTab("dashboard")}
          >
            <img
              src={aiLogo}
              alt="AI Job Search logo"
              className="h-10 w-10 rounded-xl object-cover border border-[#D4D3C9] shadow-xs"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg tracking-tight text-[#2D2D2A]">
                  JobAssist{" "}
                  <span className="text-[#5A5A40] font-serif italic">
                    Malawi
                  </span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5E5DF] text-[#5A5A40] border border-[#D4D3C9] uppercase tracking-wider">
                  ICT
                </span>
              </div>
              <p className="text-xs text-[#5A5A40]/70 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Monitoring jobsearchmalawi.com
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1.5">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "dashboard"
                  ? "bg-[#5A5A40] text-white shadow-xs"
                  : "text-[#2D2D2A]/70 hover:text-[#2D2D2A] hover:bg-[#F8F7F4]"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("jobs")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "jobs"
                  ? "bg-[#5A5A40] text-white shadow-xs"
                  : "text-[#2D2D2A]/70 hover:text-[#2D2D2A] hover:bg-[#F8F7F4]"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>ICT Vacancies</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "profile"
                  ? "bg-[#5A5A40] text-white shadow-xs"
                  : "text-[#2D2D2A]/70 hover:text-[#2D2D2A] hover:bg-[#F8F7F4]"
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>CV Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("applications")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "applications"
                  ? "bg-[#5A5A40] text-white shadow-xs"
                  : "text-[#2D2D2A]/70 hover:text-[#2D2D2A] hover:bg-[#F8F7F4]"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Tracker</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefreshJobs}
              disabled={isRefreshingJobs}
              title="Fetch fresh jobs from jobsearchmalawi.com"
              className="p-2 text-[#5A5A40] hover:bg-[#F8F7F4] rounded-xl border border-[#D4D3C9] transition-colors flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshingJobs ? "animate-spin text-[#5A5A40]" : ""}`}
              />
              <span className="hidden lg:inline">Live Sync</span>
            </button>

            <button
              onClick={onOpenScrapeModal}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#F8F7F4] text-[#2D2D2A] border border-[#D4D3C9] transition"
            >
              <Globe className="h-3.5 w-3.5 text-[#5A5A40]" />
              <span>Ingest Link</span>
            </button>

            <div className="pl-2 border-l border-[#D4D3C9] flex items-center space-x-2">
              <div className="hidden sm:block text-right text-xs">
                <p className="font-bold uppercase tracking-wider text-[#2D2D2A] leading-tight truncate max-w-[140px]">
                  {user?.displayName || candidateName || "Candidate"}
                </p>
                <p className="text-[10px] text-[#5A5A40]/70 uppercase font-semibold truncate max-w-[140px]">
                  {user?.email || "Google User"}
                </p>
              </div>

              {candidatePhotoUrl || user?.photoURL ? (
                <img
                  src={candidatePhotoUrl || user?.photoURL}
                  alt={user?.displayName || candidateName || "Google Profile"}
                  className="h-9 w-9 rounded-full border border-[#D4D3C9] object-cover shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-[#E5E5DF] border border-[#D4D3C9] text-[#5A5A40] font-serif italic text-sm font-bold flex items-center justify-center">
                  {user?.displayName
                    ? user.displayName.slice(0, 2).toUpperCase()
                    : candidateName
                      ? candidateName.slice(0, 2).toUpperCase()
                      : "CV"}
                </div>
              )}

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title="Sign out of Google Account"
                  className="p-2 text-[#5A5A40] hover:bg-[#F8F7F4] hover:text-red-700 rounded-xl border border-[#D4D3C9] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden justify-around py-2 border-t border-[#D4D3C9] text-xs">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === "dashboard"
                ? "text-[#5A5A40] font-bold"
                : "text-[#2D2D2A]/60"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === "jobs"
                ? "text-[#5A5A40] font-bold"
                : "text-[#2D2D2A]/60"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Jobs</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === "profile"
                ? "text-[#5A5A40] font-bold"
                : "text-[#2D2D2A]/60"
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("applications")}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === "applications"
                ? "text-[#5A5A40] font-bold"
                : "text-[#2D2D2A]/60"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Tracker</span>
          </button>
        </div>
      </div>
    </header>
  );
};
