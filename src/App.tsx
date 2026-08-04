/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import {
  CandidateProfile,
  JobFilterState,
  JobListing,
  JobMatchAnalysis,
  TrackedApplication,
} from "./types";
import {
  apiAnalyzeMatch,
  apiDeleteApplication,
  apiFetchApplications,
  apiFetchJobs,
  apiFetchProfile,
  apiGenerateLetter,
  apiParseCv,
  apiSaveApplication,
  apiSaveProfile,
  apiScrapeSingleUrl,
  computeInstantMatch,
  filterJobListings,
} from "./lib/api";
import { logout } from "./lib/googleauth";
import { Navbar } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { LoginScreen } from "./components/loginScreen";
import { JobExplorerView } from "./components/JobExplorerView";
import { JobDetailModal } from "./components/JobDetailModal";
import { ProfileView } from "./components/ProfileView";
import { ApplicationTrackerView } from "./components/ApplicationTrackerView";
import { CoverLetterModal } from "./components/CoverLetterModal";
import { ApplicationModal } from "./components/ApplicationModal";
import { ArchitectureModal } from "./components/ArchitectureModal";
import { INITIAL_CANDIDATE_PROFILE, INITIAL_MOCK_JOBS } from "./data/mockJobs";
import { RefreshCw, PlusCircle, Globe, X } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "jobs" | "profile" | "applications"
  >("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Application State
  const [profile, setProfile] = useState<CandidateProfile>(
    INITIAL_CANDIDATE_PROFILE,
  );
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<TrackedApplication[]>([]);
  const [matchesMap, setMatchesMap] = useState<
    Record<string, JobMatchAnalysis>
  >({});

  // Loading States
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isRefreshingJobs, setIsRefreshingJobs] = useState(false);
  const [isParsingCv, setIsParsingCv] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);

  // Modals State
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [activeLetterData, setActiveLetterData] = useState<{
    letter: string;
    jobTitle: string;
    employer: string;
    jobId: string;
  } | null>(null);
  const [applicationPortalState, setApplicationPortalState] = useState<{
    isOpen: boolean;
    job: JobListing | null;
    coverLetter: string;
  }>({
    isOpen: false,
    job: null,
    coverLetter: "",
  });
  const [isScrapeModalOpen, setIsScrapeModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [ingestInputUrl, setIngestInputUrl] = useState("");
  const [ingestMessage, setIngestMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Filter State
  const [filterState, setFilterState] = useState<JobFilterState>({
    searchQuery: "",
    category: "All",
    minScore: 0,
    location: "All",
    workType: "All",
    hideExpired: true,
    statusFilter: "All",
  });

  const handleSignOut = () => {
    logout();
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      try {
        await apiFetchProfile();
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifyAuth();
  }, []);

  // Initial Load
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    setIsLoadingJobs(true);
    try {
      const [fetchedProfile, fetchedJobs, fetchedApps] = await Promise.all([
        apiFetchProfile().catch(() => INITIAL_CANDIDATE_PROFILE),
        apiFetchJobs(false).catch(() => INITIAL_MOCK_JOBS),
        apiFetchApplications().catch(() => []),
      ]);

      if (fetchedProfile && fetchedProfile.fullName) {
        setProfile(fetchedProfile);
      }
      if (fetchedJobs && fetchedJobs.length > 0) {
        setJobs(fetchedJobs);
      }
      if (fetchedApps) {
        setApplications(fetchedApps);
      }

      // Initialize match map using instant local heuristic algorithm (avoids 429 API quota error)
      const initialProfile = fetchedProfile || profile;
      const initialJobs = fetchedJobs || INITIAL_MOCK_JOBS;
      runBatchMatchAnalysis(initialJobs, initialProfile);
    } catch (err) {
      console.warn("Initialization error, using fallback state:", err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleRefreshJobs = async () => {
    setIsRefreshingJobs(true);
    try {
      const freshJobs = await apiFetchJobs(true);
      if (freshJobs && freshJobs.length > 0) {
        setJobs(freshJobs);
        runBatchMatchAnalysis(freshJobs, profile);
      }
    } catch (err) {
      console.error("Error refreshing jobs:", err);
    } finally {
      setIsRefreshingJobs(false);
    }
  };

  const runBatchMatchAnalysis = (
    jobList: JobListing[],
    targetProfile: CandidateProfile = profile,
  ) => {
    const newMatches: Record<string, JobMatchAnalysis> = {};
    for (const job of jobList) {
      newMatches[job.id] = computeInstantMatch(targetProfile, job);
    }
    setMatchesMap((prev) => ({ ...newMatches, ...prev }));
  };

  // Action: Select job for detailed view
  const handleSelectJob = async (job: JobListing) => {
    setSelectedJob(job);
    // Request deep AI match analysis for selected job
    try {
      const matchResult = await apiAnalyzeMatch(job.id, job);
      setMatchesMap((prev) => ({ ...prev, [job.id]: matchResult }));
    } catch (err) {
      console.warn("AI job match note:", err);
    }
  };

  // Action: Generate Cover / Application Letter
  const handleGenerateLetter = async (job: JobListing, customNote?: string) => {
    setIsGeneratingLetter(true);
    try {
      const result = await apiGenerateLetter(job.id, customNote, job);

      // Update applications state
      setApplications((prev) => {
        const exists = prev.find((a) => a.jobId === job.id);
        if (exists) {
          return prev.map((a) =>
            a.jobId === job.id ? result.applicationRecord : a,
          );
        }
        return [result.applicationRecord, ...prev];
      });

      setActiveLetterData({
        letter: result.letter,
        jobTitle: job.title,
        employer: job.employer,
        jobId: job.id,
      });
    } catch (err: any) {
      alert(`Error generating application letter: ${err.message || err}`);
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handleOpenApplicationPortal = (
    letterText: string,
    job?: JobListing | null,
  ) => {
    const targetJob =
      job ?? jobs.find((j) => j.id === activeLetterData?.jobId) ?? selectedJob;

    if (!targetJob) {
      alert("Select a job first before opening the Gmail application portal.");
      return;
    }

    setActiveLetterData(null);
    setApplicationPortalState({
      isOpen: true,
      job: targetJob,
      coverLetter: letterText,
    });
  };

  // Action: Save / Track job
  const handleTrackJob = async (job: JobListing) => {
    const existing = applications.find((a) => a.jobId === job.id);
    if (existing) return;

    const newApp: TrackedApplication = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      employer: job.employer,
      location: job.location,
      status: "Interested",
      applicationDate: new Date().toISOString().split("T")[0],
      closingDate: job.closingDate,
      applicationContact: job.applicationMethod,
      notes: "Saved for review",
      updatedAt: new Date().toISOString(),
    };

    try {
      const updatedList = await apiSaveApplication(newApp);
      setApplications(updatedList);
    } catch (err) {
      console.error("Error saving application:", err);
      setApplications((prev) => [newApp, ...prev]);
    }
  };

  // Action: Save Candidate Profile
  const handleSaveProfile = async (updatedProfile: CandidateProfile) => {
    try {
      const saved = await apiSaveProfile(updatedProfile);
      setProfile(saved);
      runBatchMatchAnalysis(jobs, saved);
    } catch (err: any) {
      alert(`Failed to save profile: ${err.message}`);
    }
  };

  // Action: Parse CV file or text
  const handleParseCv = async (payload: {
    rawText?: string;
    fileBase64?: string;
    mimeType?: string;
  }) => {
    setIsParsingCv(true);
    try {
      const updatedProfile = await apiParseCv(payload);
      setProfile(updatedProfile);
      runBatchMatchAnalysis(jobs, updatedProfile);
      alert(
        "CV analyzed! Profile updated with your skills, experience, and education.",
      );
    } catch (err: any) {
      alert(`CV Analysis failed: ${err.message}`);
    } finally {
      setIsParsingCv(false);
    }
  };

  // Action: Ingest Job URL from jobsearchmalawi.com
  const handleIngestUrlSubmit = async (urlToIngest: string) => {
    setIngestMessage(null);
    try {
      const scraped = await apiScrapeSingleUrl(urlToIngest);
      setJobs((prev) => {
        const index = prev.findIndex(
          (j) => j.fingerprint === scraped.fingerprint || j.url === scraped.url,
        );
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = scraped;
          return updated;
        }
        return [scraped, ...prev];
      });

      setIngestMessage({
        type: "success",
        text: `Successfully ingested "${scraped.title}" from ${scraped.employer}.`,
      });
      setIsScrapeModalOpen(false);
      handleSelectJob(scraped);
    } catch (err: any) {
      setIngestMessage({
        type: "error",
        text: err.message || "Failed to ingest URL.",
      });
    }
  };

  // Filtered jobs list
  const filteredJobs = filterJobListings(jobs, filterState, matchesMap);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-600">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScrapeModal={() => setIsScrapeModalOpen(true)}
        onOpenArchitectureModal={() => setIsArchModalOpen(true)}
        isRefreshingJobs={isRefreshingJobs}
        onRefreshJobs={handleRefreshJobs}
        candidateName={profile.fullName}
        candidatePhotoUrl={profile.photoUrl}
        onSignOut={handleSignOut}
      />

      {/* Main App Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {isLoadingJobs ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-slate-600">
              Loading ICT opportunities from jobsearchmalawi.com...
            </p>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <DashboardView
                profile={profile}
                jobs={jobs}
                matchesMap={matchesMap}
                applications={applications}
                onSelectJob={handleSelectJob}
                onNavigateTab={setActiveTab}
                onIngestUrl={handleIngestUrlSubmit}
              />
            )}

            {activeTab === "jobs" && (
              <JobExplorerView
                jobs={filteredJobs}
                matchesMap={matchesMap}
                applications={applications}
                filterState={filterState}
                setFilterState={setFilterState}
                onSelectJob={handleSelectJob}
                onGenerateLetter={handleGenerateLetter}
                onTrackJob={handleTrackJob}
              />
            )}

            {activeTab === "profile" && (
              <ProfileView
                profile={profile}
                onSaveProfile={handleSaveProfile}
                onParseCv={handleParseCv}
                isParsingCv={isParsingCv}
              />
            )}

            {activeTab === "applications" && (
              <ApplicationTrackerView
                applications={applications}
                onUpdateStatus={async (id, status) => {
                  const target = applications.find((a) => a.id === id);
                  if (target) {
                    const updated = await apiSaveApplication({
                      ...target,
                      status,
                    });
                    setApplications(updated);
                  }
                }}
                onUpdateNotes={async (id, notes, reminderDate) => {
                  const target = applications.find((a) => a.id === id);
                  if (target) {
                    const updated = await apiSaveApplication({
                      ...target,
                      notes,
                      followUpReminderDate: reminderDate,
                    });
                    setApplications(updated);
                  }
                }}
                onDeleteApplication={async (id) => {
                  const updated = await apiDeleteApplication(id);
                  setApplications(updated);
                }}
                onOpenLetterModal={(app) => {
                  if (app.generatedLetter) {
                    setActiveLetterData({
                      letter: app.generatedLetter,
                      jobTitle: app.jobTitle,
                      employer: app.employer,
                      jobId: app.jobId,
                    });
                  }
                }}
                onViewJobDetails={(app) => {
                  const matchedJob = jobs.find((job) => job.id === app.jobId);
                  if (matchedJob) {
                    handleSelectJob(matchedJob);
                  } else {
                    alert(
                      "The full job details for this application are not available yet.",
                    );
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <JobDetailModal
        job={selectedJob}
        match={selectedJob ? matchesMap[selectedJob.id] : null}
        isLoadingMatch={isLoadingMatch}
        onClose={() => setSelectedJob(null)}
        onGenerateLetter={(j) => {
          setSelectedJob(null);
          handleGenerateLetter(j);
        }}
        onTrackJob={handleTrackJob}
        isTracked={
          selectedJob
            ? applications.some((a) => a.jobId === selectedJob.id)
            : false
        }
      />

      <CoverLetterModal
        isOpen={Boolean(activeLetterData)}
        letterText={activeLetterData?.letter || ""}
        jobTitle={activeLetterData?.jobTitle || ""}
        employer={activeLetterData?.employer || ""}
        onClose={() => setActiveLetterData(null)}
        isRegenerating={isGeneratingLetter}
        onRegenerateLetter={(note) => {
          const target = jobs.find((j) => j.id === activeLetterData?.jobId);
          if (target) {
            handleGenerateLetter(target, note);
          }
        }}
        onOpenApplicationPortal={(letterText) => {
          handleOpenApplicationPortal(letterText);
        }}
      />

      {applicationPortalState.isOpen && applicationPortalState.job && (
        <ApplicationModal
          isOpen={applicationPortalState.isOpen}
          onClose={() =>
            setApplicationPortalState({
              isOpen: false,
              job: null,
              coverLetter: "",
            })
          }
          job={applicationPortalState.job}
          candidateProfile={profile}
          coverLetterText={applicationPortalState.coverLetter}
          onApplicationSent={(applicationRecord) => {
            setApplications((prev) => [applicationRecord, ...prev]);
            setApplicationPortalState({
              isOpen: false,
              job: null,
              coverLetter: "",
            });
          }}
        />
      )}

      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      {/* Ingest Single URL Modal */}
      {isScrapeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold">
                <Globe className="h-5 w-5 text-blue-600" />
                <span>Ingest Direct Job Search Malawi Link</span>
              </div>
              <button
                onClick={() => setIsScrapeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Paste the URL of any specific job listing from jobsearchmalawi.com
              to extract details, calculate candidate match, and generate an
              application letter.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (ingestInputUrl.trim()) {
                  handleIngestUrlSubmit(ingestInputUrl.trim());
                }
              }}
              className="space-y-3"
            >
              <input
                type="url"
                placeholder="https://jobsearchmalawi.com/job/vacancy-title/"
                value={ingestInputUrl}
                onChange={(e) => setIngestInputUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              {ingestMessage && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-semibold ${ingestMessage.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}
                >
                  {ingestMessage.text}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScrapeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition"
                >
                  Fetch &amp; Parse Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © 2026 AI Job Finder &amp; Application Assistant • Monitoring
            jobsearchmalawi.com
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsArchModalOpen(true)}
              className="hover:text-white transition"
            >
              System Proposal Specs
            </button>
            <span>•</span>
            <span>ICT / Tech Roles Malawi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
