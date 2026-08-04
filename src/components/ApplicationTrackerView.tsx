import React, { useState } from "react";
import { ApplicationStatus, TrackedApplication } from "../types";
import {
  FileText,
  Calendar,
  Mail,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  Eye,
} from "lucide-react";

interface ApplicationTrackerViewProps {
  applications: TrackedApplication[];
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onUpdateNotes: (id: string, notes: string, reminderDate?: string) => void;
  onDeleteApplication: (id: string) => void;
  onOpenLetterModal: (app: TrackedApplication) => void;
  onViewJobDetails?: (app: TrackedApplication) => void;
}

const ALL_STATUSES: ApplicationStatus[] = [
  "New",
  "Interested",
  "Letter Generated",
  "Applied",
  "Interview",
  "Rejected",
  "Successful",
];

export const ApplicationTrackerView: React.FC<ApplicationTrackerViewProps> = ({
  applications,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteApplication,
  onOpenLetterModal,
  onViewJobDetails,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("All");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [tempReminder, setTempReminder] = useState("");

  const filteredApps = applications.filter((a) => {
    if (selectedStatusFilter === "All") return true;
    return a.status === selectedStatusFilter;
  });

  const handleStartEditNotes = (app: TrackedApplication) => {
    setEditingNotesId(app.id);
    setTempNotes(app.notes || "");
    setTempReminder(app.followUpReminderDate || "");
  };

  const handleSaveNotes = (id: string) => {
    onUpdateNotes(id, tempNotes, tempReminder);
    setEditingNotesId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#2D2D2A] leading-tight">
            Application Pipeline &amp; Status Tracker
          </h1>
          <p className="text-[#2D2D2A]/60 text-xs">
            Track saved job opportunities, tailored letters, submission
            contacts, and follow-up reminders.
          </p>
        </div>

        {/* Status filter bar */}
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-[#D4D3C9] text-xs">
          <Filter className="h-4 w-4 text-[#5A5A40]" />
          <span className="font-bold text-[#5A5A40] uppercase tracking-wider text-[10px]">
            Filter Stage:
          </span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="font-bold text-[#2D2D2A] bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="All">All Stages ({applications.length})</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D4D3C9] space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#F8F7F4] text-[#2D2D2A]/40 flex items-center justify-center border border-[#D4D3C9]">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="font-serif font-bold text-[#2D2D2A] text-sm">
            No applications tracked in this stage
          </h3>
          <p className="text-xs text-[#2D2D2A]/60 max-w-sm mx-auto">
            Save job listings from the Vacancies tab or generate application
            letters to automatically add them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl p-6 border border-[#D4D3C9] shadow-xs hover:border-[#5A5A40] transition space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Title & Employer */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-serif font-bold text-[#2D2D2A]">
                      {app.jobTitle}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#5A5A40]">
                    {app.employer}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#2D2D2A]/60">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-[#5A5A40]" />
                      <span>Closes: {app.closingDate}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-[#2D2D2A] font-mono">
                      <Mail className="h-3.5 w-3.5 text-[#5A5A40]" />
                      <span>{app.applicationContact}</span>
                    </span>
                  </div>
                </div>

                {/* Status Dropdown selector & Actions */}
                <div className="flex flex-wrap items-center gap-3 self-start md:self-auto w-full md:w-auto justify-end">
                  {onViewJobDetails && (
                    <button
                      onClick={() => onViewJobDetails(app)}
                      className="px-3.5 py-1.5 bg-[#E5E5DF] hover:bg-[#D4D3C9] text-[#2D2D2A] font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center space-x-1.5 border border-[#D4D3C9] shadow-xs"
                      title="View complete job breakdown and details"
                    >
                      <Eye className="h-3.5 w-3.5 text-[#5A5A40]" />
                      <span>View Job Details</span>
                    </button>
                  )}

                  <div className="space-y-1 text-right">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A40] block">
                      Application Stage
                    </label>
                    <select
                      value={app.status}
                      onChange={(e) =>
                        onUpdateStatus(
                          app.id,
                          e.target.value as ApplicationStatus,
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer min-w-[140px] ${
                        app.status === "Successful"
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : app.status === "Interview"
                            ? "bg-[#5A5A40] text-white border-[#5A5A40]"
                            : app.status === "Applied"
                              ? "bg-[#E5E5DF] text-[#2D2D2A] border-[#D4D3C9]"
                              : app.status === "Letter Generated"
                                ? "bg-[#E5E5DF] text-[#5A5A40] border-[#D4D3C9]"
                                : app.status === "Rejected"
                                  ? "bg-rose-100 text-rose-900 border-rose-300"
                                  : "bg-[#F8F7F4] text-[#2D2D2A] border-[#D4D3C9]"
                      }`}
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Generated Letter & Notes Row */}
              <div className="p-4 bg-[#F8F7F4] rounded-2xl border border-[#D4D3C9] space-y-3 text-xs">
                {app.sentAt && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-900 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center space-x-1.5 text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Submitted via Gmail API</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-mono">
                        {new Date(app.sentAt).toLocaleDateString()}{" "}
                        {new Date(app.sentAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-900/80">
                      <div>
                        <span className="font-bold text-emerald-900">
                          Recipient:
                        </span>{" "}
                        {app.recipientEmail || app.applicationContact}
                      </div>
                      <div>
                        <span className="font-bold text-emerald-900">
                          Attachment Mode:
                        </span>{" "}
                        {app.attachmentMode === "merged"
                          ? "Single Combined PDF"
                          : "Individual PDFs"}
                      </div>
                      {app.gmailMessageId && (
                        <div className="sm:col-span-2 font-mono text-[10px] text-emerald-800 truncate">
                          <span className="font-bold">Gmail Message ID:</span>{" "}
                          {app.gmailMessageId}
                        </div>
                      )}
                      {app.attachmentNames &&
                        app.attachmentNames.length > 0 && (
                          <div className="sm:col-span-2 text-[10px]">
                            <span className="font-bold text-emerald-900">
                              Files Attached ({app.attachmentNames.length}):
                            </span>{" "}
                            {app.attachmentNames.join(", ")}
                          </div>
                        )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4D3C9] pb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-[#5A5A40]" />
                    <span className="font-bold text-[#2D2D2A]">
                      Application Letter:
                    </span>
                    {app.generatedLetter ? (
                      <span className="text-[#5A5A40] font-bold bg-[#E5E5DF] px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-wider border border-[#D4D3C9]">
                        Generated &amp; Tailored
                      </span>
                    ) : (
                      <span className="text-[#2D2D2A]/50 italic text-[11px]">
                        Not generated yet
                      </span>
                    )}
                  </div>

                  {app.generatedLetter && (
                    <button
                      onClick={() => onOpenLetterModal(app)}
                      className="text-xs font-bold text-[#5A5A40] hover:text-[#2D2D2A] flex items-center space-x-1 uppercase tracking-wider bg-[#E5E5DF] hover:bg-[#D4D3C9] px-2.5 py-1.5 rounded-lg border border-[#D4D3C9]"
                    >
                      <span>View &amp; Edit Letter</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Notes & Follow-up reminders editor */}
                {editingNotesId === app.id ? (
                  <div className="space-y-3 pt-1">
                    <textarea
                      rows={2}
                      placeholder="Add personal notes, interview prep points, or contact responses..."
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#D4D3C9] rounded-xl text-[#2D2D2A] text-xs"
                    />
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-[#5A5A40]" />
                        <span className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">
                          Follow-up Date:
                        </span>
                        <input
                          type="date"
                          value={tempReminder}
                          onChange={(e) => setTempReminder(e.target.value)}
                          className="p-1.5 bg-white border border-[#D4D3C9] rounded-lg text-xs text-[#2D2D2A]"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="px-3 py-1.5 bg-[#E5E5DF] text-[#2D2D2A] font-bold text-xs uppercase tracking-wider rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNotes(app.id)}
                          className="px-3 py-1.5 bg-[#5A5A40] text-white font-bold text-xs uppercase tracking-wider rounded-xl"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[#2D2D2A] leading-relaxed">
                        <span className="font-bold text-[#5A5A40]">
                          Notes:{" "}
                        </span>
                        {app.notes ||
                          "No specific notes recorded for this application."}
                      </p>
                      {app.followUpReminderDate && (
                        <p className="text-amber-900 font-bold flex items-center space-x-1 text-[11px]">
                          <Clock className="h-3 w-3 text-amber-700" />
                          <span>
                            Follow-up scheduled: {app.followUpReminderDate}
                          </span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleStartEditNotes(app)}
                      className="p-1.5 rounded-lg text-[#2D2D2A]/60 hover:text-[#5A5A40] hover:bg-[#E5E5DF] transition shrink-0"
                      title="Edit Notes & Reminder"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Delete action */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => onDeleteApplication(app.id)}
                  className="text-xs text-rose-700 hover:text-rose-900 font-bold uppercase tracking-wider flex items-center space-x-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Application</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
