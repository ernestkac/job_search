import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  FileText,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
  RefreshCw,
  ShieldCheck,
  Upload,
  Trash2,
  Layers,
  FileCheck,
  Lock,
  Mail,
} from "lucide-react";
import {
  JobListing,
  CandidateProfile,
  TrackedApplication,
  UploadedCertificate,
} from "../types";
import {
  generateCoverLetterPdf,
  generateCvPdf,
  mergePdfBuffers,
  dataUrlToArrayBuffer,
} from "../lib/pdfService";
import { EmailAttachment } from "../lib/gmailService";
import { authorizeGmailWithGoogle } from "../lib/googleauth";
import { apiSendGmailMessage } from "../lib/api";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobListing;
  candidateProfile: CandidateProfile;
  coverLetterText: string;
  onApplicationSent: (app: TrackedApplication) => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  job,
  candidateProfile,
  coverLetterText,
  onApplicationSent,
}) => {
  if (!isOpen) return null;

  // Form & Options State
  const defaultEmail = job.applicationMethod?.includes("@")
    ? job.applicationMethod
    : "hr@employer.mw";

  const [recipientEmail, setRecipientEmail] = useState(defaultEmail);
  const [emailSubject, setEmailSubject] = useState(
    `Application for ${job.title} - ${candidateProfile.fullName}`,
  );
  const [coverLetter, setCoverLetter] = useState(coverLetterText);
  const [combineDocuments, setCombineDocuments] = useState(false); // Requirement #5 Default: Unchecked
  const [certificates, setCertificates] = useState<UploadedCertificate[]>(
    candidateProfile.certificates || [],
  );

  // Preview Mode Tab: 'email' or 'pdf'
  const [previewTab, setPreviewTab] = useState<"email" | "pdf">("email");

  // PDF Preview & Packaging State
  const [isPreparingPdfs, setIsPreparingPdfs] = useState(true);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [totalSizeMb, setTotalSizeMb] = useState<number>(0);
  const [totalPagesCount, setTotalPagesCount] = useState<number>(0);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [pdfAttachments, setPdfAttachments] = useState<EmailAttachment[]>([]);

  // Sending State
  const [isSending, setIsSending] = useState(false);
  const [sendingStatusMsg, setSendingStatusMsg] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sentMessageId, setSentMessageId] = useState<string | null>(null);

  const firstName = candidateProfile.fullName.split(" ")[0] || "Applicant";
  const lastName =
    candidateProfile.fullName.split(" ").slice(1).join("_") || "Candidate";
  const sanitizedName = `${firstName}_${lastName}`.replace(
    /[^a-zA-Z0-9_]/g,
    "",
  );

  // Generate / Merge PDFs whenever options or input change
  useEffect(() => {
    let isMounted = true;

    async function preparePdfs() {
      setIsPreparingPdfs(true);
      try {
        // 1. Generate Cover Letter PDF & CV PDF
        const coverLetterPdf = await generateCoverLetterPdf(
          job.title,
          job.employer,
          coverLetter,
          candidateProfile.fullName,
        );

        const cvPdf = await generateCvPdf(candidateProfile);

        // Prepare certificate ArrayBuffers
        const certBuffers = certificates.map((cert) => ({
          name: cert.name,
          buffer: dataUrlToArrayBuffer(cert.fileDataUrl),
          bytes: cert.fileSize,
        }));

        if (combineDocuments) {
          // COMBINE ALL DOCUMENTS INTO ONE PDF
          const allBuffers = [
            coverLetterPdf.arrayBuffer,
            cvPdf.arrayBuffer,
            ...certBuffers.map((c) => c.buffer),
          ];

          const mergedFilename = `${sanitizedName}_Application.pdf`;
          const merged = await mergePdfBuffers(allBuffers);

          if (!isMounted) return;

          setPreviewPdfUrl(merged.dataUrl);
          setTotalSizeMb(merged.sizeMb);
          setTotalPagesCount(merged.pageCount);
          setAttachmentNames([mergedFilename]);

          setPdfAttachments([
            {
              filename: mergedFilename,
              mimeType: "application/pdf",
              arrayBuffer: merged.arrayBuffer,
            },
          ]);
        } else {
          // INDIVIDUAL PDF ATTACHMENTS
          // Do NOT attach Cover Letter PDF when Combine is OFF (because cover letter is already in email body)
          const cvFilename = `${sanitizedName}_CV.pdf`;

          const individualAttachments: EmailAttachment[] = [
            {
              filename: cvFilename,
              mimeType: "application/pdf",
              arrayBuffer: cvPdf.arrayBuffer,
            },
            ...certificates.map((cert) => ({
              filename: `${cert.name.replace(/[^a-zA-Z0-9_]/g, "_")}.pdf`,
              mimeType: "application/pdf",
              arrayBuffer: dataUrlToArrayBuffer(cert.fileDataUrl),
            })),
          ];

          // Calculate total size across individual PDFs (CV + certificates)
          const cvBytes = cvPdf.arrayBuffer.byteLength;
          const certsBytes = certBuffers.reduce((sum, c) => sum + c.bytes, 0);
          const totalBytes = cvBytes + certsBytes;
          const calculatedMb = Number((totalBytes / (1024 * 1024)).toFixed(2));

          if (!isMounted) return;

          // Default preview shows merged view of CV + certificates
          const previewMerged = await mergePdfBuffers([
            cvPdf.arrayBuffer,
            ...certBuffers.map((c) => c.buffer),
          ]);

          setPreviewPdfUrl(previewMerged.dataUrl);
          setTotalSizeMb(calculatedMb);
          setTotalPagesCount(previewMerged.pageCount);
          setAttachmentNames(individualAttachments.map((a) => a.filename));
          setPdfAttachments(individualAttachments);
        }
      } catch (err) {
        console.error("Error assembling application PDFs:", err);
      } finally {
        if (isMounted) setIsPreparingPdfs(false);
      }
    }

    preparePdfs();

    return () => {
      isMounted = false;
    };
  }, [combineDocuments, coverLetter, candidateProfile, certificates, job]);

  const isOverSizeLimit = totalSizeMb > 25.0;

  // Handle Certificate Upload directly in modal
  const handleCertUploadInModal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    files.forEach((file: File) => {
      if (
        !file.name.toLowerCase().endsWith(".pdf") &&
        file.type !== "application/pdf"
      ) {
        alert(`File "${file.name}" is not a PDF.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        const cleanName = file.name
          .replace(/\.pdf$/i, "")
          .replace(/[-_]/g, " ");
        const newCert: UploadedCertificate = {
          id: `modal-cert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          fileDataUrl: dataUrl,
        };
        setCertificates((prev) => [...prev, newCert]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove certificate
  const handleRemoveCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
  };

  // Handle Send Application via Gmail API
  const handleSendApplication = async () => {
    if (isOverSizeLimit) return;
    setIsSending(true);
    setSendError(null);
    setSendingStatusMsg("Verifying Google authorization token...");

    try {
      let token = localStorage.getItem("token");

      setSendingStatusMsg("Building RFC 2822 MIME email package...");

      // Email Body Text
      let finalBody = coverLetter;
      if (combineDocuments) {
        finalBody = `Dear Hiring Team at ${job.employer},\n\nPlease find attached my complete job application package (${sanitizedName}_Application.pdf) containing my Cover Letter, Curriculum Vitae, and supporting Academic & Professional Certificates for the ${job.title} position.\n\nThank you for considering my application.\n\nSincerely,\n${candidateProfile.fullName}\n${candidateProfile.email} | ${candidateProfile.phone}`;
      }

      setSendingStatusMsg("Transmitting application via Gmail API...");

      const payload = {
        recipientEmail: recipientEmail.trim(),
        subject: emailSubject.trim(),
        bodyText: finalBody,
        attachments: pdfAttachments,
      };

      let result = await apiSendGmailMessage(payload);

      if (result.requiresGmailAuthorization) {
        setSendingStatusMsg("Requesting Gmail permission...");
        await authorizeGmailWithGoogle();
        setSendingStatusMsg("Retrying email delivery...");
        result = await apiSendGmailMessage(payload);
      }

      if (result.success) {
        setSendSuccess(true);
        setSentMessageId(result.messageId || `msg-${Date.now()}`);

        const applicationRecord: TrackedApplication = {
          id: `app-${Date.now()}`,
          jobId: job.id,
          jobTitle: job.title,
          employer: job.employer,
          location: job.location,
          status: "Applied",
          applicationDate: new Date().toISOString().split("T")[0],
          closingDate: job.closingDate,
          applicationContact: recipientEmail,
          generatedLetter: coverLetter,
          updatedAt: new Date().toISOString(),
          sentAt: new Date().toISOString(),
          gmailMessageId: result.messageId || `msg-${Date.now()}`,
          attachmentMode: combineDocuments ? "merged" : "individual",
          recipientEmail: recipientEmail,
          attachmentNames: attachmentNames,
        };

        onApplicationSent(applicationRecord);
      } else {
        throw new Error(result.error || "Failed to send application email.");
      }
    } catch (err: any) {
      console.error("Send application error:", err);
      setSendError(
        err.message ||
          "An error occurred while sending the email via Gmail API.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D2A]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#D4D3C9] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="p-6 bg-[#2D2D2A] text-white flex items-start justify-between border-b border-[#5A5A40] sticky top-0 z-20">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>One-Click Gmail Application Portal</span>
            </div>
            <h2 className="text-xl font-serif text-white leading-tight">
              Apply for {job.title}
            </h2>
            <p className="text-xs text-[#D4D3C9]">
              {job.employer} &bull; {job.location}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#D4D3C9] hover:text-white hover:bg-[#5A5A40] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        {sendSuccess ? (
          <div className="p-10 text-center space-y-6 flex flex-col items-center justify-center my-auto">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2 max-w-lg">
              <h3 className="font-serif text-2xl font-bold text-[#2D2D2A]">
                Application Sent Successfully!
              </h3>
              <p className="text-xs text-[#5A5A40]">
                Your application package was transmitted directly through your
                authorized Google/Gmail account to{" "}
                <span className="font-bold text-[#2D2D2A]">
                  {recipientEmail}
                </span>
                .
              </p>
              {sentMessageId && (
                <div className="p-3 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[11px] font-mono text-[#5A5A40] inline-block mt-2">
                  Gmail Message ID: {sentMessageId}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#D4D3C9] w-full max-w-md">
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Close &amp; View Application Tracker
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            {/* Left Column: Email Configuration & Document Selection (5 Cols) */}
            <div className="lg:col-span-5 space-y-5 flex flex-col">
              {/* Recipient & Subject */}
              <div className="p-4 bg-[#F8F7F4] border border-[#D4D3C9] rounded-2xl space-y-3 text-xs">
                <div className="flex items-center space-x-2 text-[#5A5A40] font-bold uppercase tracking-wider text-[11px]">
                  <Mail className="h-4 w-4" />
                  <span>Email Details</span>
                </div>

                <div>
                  <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">
                    Employer Email (To)
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full p-2 bg-white border border-[#D4D3C9] rounded-xl mt-1 text-[#2D2D2A] font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full p-2 bg-white border border-[#D4D3C9] rounded-xl mt-1 text-[#2D2D2A] font-medium"
                  />
                </div>
              </div>

              {/* Requirement #5 & #6: COMBINE ALL DOCUMENTS CHECKBOX */}
              <div className="p-4 bg-white border-2 border-[#5A5A40]/30 hover:border-[#5A5A40] rounded-2xl transition space-y-2">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={combineDocuments}
                    onChange={(e) => setCombineDocuments(e.target.checked)}
                    className="h-5 w-5 mt-0.5 rounded-md border-[#D4D3C9] text-[#5A5A40] focus:ring-[#5A5A40] cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="font-serif font-bold text-sm text-[#2D2D2A]">
                      Combine all documents into a single PDF
                    </span>
                    <p className="text-[11px] text-[#5A5A40] leading-snug">
                      Merges Cover Letter + Generated CV + Uploaded Certificates
                      in exact order into{" "}
                      <code className="bg-[#E5E5DF] px-1 py-0.5 rounded text-[10px]">
                        {sanitizedName}_Application.pdf
                      </code>
                      .
                    </p>
                  </div>
                </label>
              </div>

              {/* Uploaded Certificates List in Modal */}
              <div className="p-4 bg-[#F8F7F4] border border-[#D4D3C9] rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[#5A5A40] font-bold uppercase tracking-wider text-[11px]">
                    <FileCheck className="h-4 w-4" />
                    <span>Uploaded Certificates ({certificates.length})</span>
                  </div>

                  <label className="relative inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#5A5A40] hover:bg-[#4A4A35] text-white rounded-lg cursor-pointer transition">
                    <span>+ Add PDF</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      multiple
                      onChange={handleCertUploadInModal}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-2 bg-white border border-[#D4D3C9] rounded-xl flex items-center justify-between"
                    >
                      <div className="truncate space-y-0.5 pr-2">
                        <p className="font-bold text-[#2D2D2A] truncate text-[11px]">
                          {cert.name}
                        </p>
                        <p className="text-[9px] text-[#5A5A40]">
                          {(cert.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveCertificate(cert.id)}
                        className="text-red-600 hover:text-red-800 p-1 transition shrink-0"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {certificates.length === 0 && (
                    <p className="text-[11px] text-[#5A5A40] italic py-2 text-center">
                      No additional certificate PDFs attached. Click &quot;+ Add
                      PDF&quot; to include transcripts or diplomas.
                    </p>
                  )}
                </div>
              </div>

              {/* Requirement #8: Attachment Size Box */}
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  isOverSizeLimit
                    ? "bg-red-50 border-red-300 text-red-800"
                    : "bg-[#E5E5DF]/50 border-[#D4D3C9] text-[#2D2D2A]"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Total Attachment Size</span>
                  <span
                    className={
                      isOverSizeLimit
                        ? "text-red-700 font-extrabold"
                        : "text-[#5A5A40]"
                    }
                  >
                    {totalSizeMb.toFixed(2)} MB / 25.0 MB Limit
                  </span>
                </div>

                {isOverSizeLimit && (
                  <div className="flex items-start space-x-2 text-[11px] text-red-700">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <span>
                      Total package exceeds Gmail&apos;s 25 MB attachment
                      threshold. Please remove large certificates before
                      sending.
                    </span>
                  </div>
                )}
              </div>

              {/* Send Button & Status */}
              <div className="pt-2 space-y-3 mt-auto">
                {sendError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{sendError}</span>
                  </div>
                )}

                <button
                  onClick={handleSendApplication}
                  disabled={isSending || isPreparingPdfs || isOverSizeLimit}
                  className="w-full py-3.5 px-6 bg-[#5A5A40] hover:bg-[#4A4A35] active:bg-[#3A3A25] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>{sendingStatusMsg || "Sending..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Application via Gmail</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Live Email Preview & PDF Package Preview (7 Cols) */}
            <div className="lg:col-span-7 bg-[#F8F7F4] border border-[#D4D3C9] rounded-3xl p-5 flex flex-col space-y-4">
              {/* Tab Selector Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#D4D3C9]">
                <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-[#D4D3C9]">
                  <button
                    onClick={() => setPreviewTab("email")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      previewTab === "email"
                        ? "bg-[#5A5A40] text-white shadow-xs"
                        : "text-[#5A5A40] hover:text-[#2D2D2A]"
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email Body Preview (Live)</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab("pdf")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      previewTab === "pdf"
                        ? "bg-[#5A5A40] text-white shadow-xs"
                        : "text-[#5A5A40] hover:text-[#2D2D2A]"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>PDF Attachments ({attachmentNames.length})</span>
                  </button>
                </div>

                {previewTab === "pdf" && previewPdfUrl && (
                  <a
                    href={previewPdfUrl}
                    download={
                      combineDocuments
                        ? `${sanitizedName}_Application.pdf`
                        : `${sanitizedName}_CV.pdf`
                    }
                    className="px-3 py-1.5 bg-white hover:bg-[#E5E5DF] text-[#2D2D2A] border border-[#D4D3C9] font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5 text-[#5A5A40]" />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>

              {/* Attachment list badge bar */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="font-bold text-[#5A5A40] self-center mr-1">
                  Attachments ({attachmentNames.length}):
                </span>
                {attachmentNames.map((name, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-white border border-[#D4D3C9] rounded-md text-[#2D2D2A] font-mono font-bold"
                  >
                    {name}
                  </span>
                ))}
              </div>

              {/* Tab 1: LIVE EMAIL BODY PREVIEW */}
              {previewTab === "email" ? (
                <div className="flex-1 bg-white border border-[#D4D3C9] rounded-2xl p-5 flex flex-col space-y-4 overflow-y-auto min-h-[420px]">
                  {/* Email Header Info Bar */}
                  <div className="p-3 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#5A5A40] w-16">To:</span>
                      <span className="font-mono text-[#2D2D2A] font-bold">
                        {recipientEmail || "Not specified"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#5A5A40] w-16">
                        Subject:
                      </span>
                      <span className="font-bold text-[#2D2D2A]">
                        {emailSubject || "Not specified"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-[#5A5A40]">
                      <span className="font-bold w-16">Attached:</span>
                      <span>{attachmentNames.join(", ")}</span>
                    </div>
                  </div>

                  {/* Email Body Editable / Live Rendered Box */}
                  <div className="flex-1 flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A40]">
                        Cover Letter &amp; Email Message Body (Updates Live)
                      </label>
                      <span className="text-[10px] text-[#5A5A40]">
                        Exact text transmitted to recipient
                      </span>
                    </div>

                    <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D4D3C9] text-xs font-serif text-[#2D2D2A]/80 leading-snug">
                      Dear {job.employer} Hiring Team,
                      <br />
                      <br />
                      Please find attached my application documents for the{" "}
                      <strong>{job.title}</strong> position.
                    </div>

                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={12}
                      className="w-full flex-1 p-4 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-xs text-[#2D2D2A] leading-relaxed focus:bg-white focus:outline-none focus:border-[#5A5A40] transition font-sans"
                      placeholder="Cover letter content..."
                    />

                    <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#D4D3C9] text-xs font-serif text-[#2D2D2A]/80 leading-snug">
                      Best regards,
                      <br />
                      <strong>{candidateProfile.fullName}</strong>
                      <br />
                      Email: {candidateProfile.email}
                      <br />
                      Phone: {candidateProfile.phone || "N/A"}
                    </div>
                  </div>
                </div>
              ) : (
                /* Tab 2: PDF VIEWER FRAME */
                <div className="flex-1 bg-white border border-[#D4D3C9] rounded-2xl overflow-hidden min-h-[420px] flex items-center justify-center">
                  {isPreparingPdfs ? (
                    <div className="text-center space-y-3 p-6">
                      <RefreshCw className="h-8 w-8 text-[#5A5A40] animate-spin mx-auto" />
                      <p className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                        Rendering PDF Application Documents...
                      </p>
                    </div>
                  ) : previewPdfUrl ? (
                    <iframe
                      src={previewPdfUrl}
                      className="w-full h-full min-h-[420px] border-0"
                      title="PDF Application Package Preview"
                    />
                  ) : (
                    <p className="text-xs text-[#5A5A40]">
                      Unable to render PDF preview.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
