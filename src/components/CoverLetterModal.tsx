import React, { useState } from 'react';
import { X, Copy, Check, Download, ShieldCheck, Edit3, Save, RefreshCw, FileText } from 'lucide-react';

interface CoverLetterModalProps {
  letterText: string;
  jobTitle: string;
  employer: string;
  isOpen: boolean;
  onClose: () => void;
  onRegenerateLetter?: (customNote?: string) => void;
  isRegenerating?: boolean;
}

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({
  letterText,
  jobTitle,
  employer,
  isOpen,
  onClose,
  onRegenerateLetter,
  isRegenerating,
}) => {
  if (!isOpen) return null;

  const [currentLetter, setCurrentLetter] = useState(letterText);
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentLetter);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([currentLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Application_Letter_${jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D2A]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D4D3C9] flex flex-col my-auto">
        
        {/* Header */}
        <div className="p-6 bg-[#2D2D2A] text-white flex items-start justify-between border-b border-[#5A5A40] sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Grounded CV Truth Guarantee • No False Qualifications</span>
            </div>
            <h2 className="text-xl font-serif text-white leading-tight">
              Application Letter for {jobTitle}
            </h2>
            <p className="text-xs text-[#D4D3C9] font-bold">{employer}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#D4D3C9] hover:text-white hover:bg-[#5A5A40] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 flex-1">
          
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8F7F4] p-3 rounded-2xl border border-[#D4D3C9] text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-xs transition flex items-center space-x-1 ${
                  isEditing
                    ? 'bg-[#5A5A40] text-white'
                    : 'bg-white hover:bg-[#E5E5DF] text-[#2D2D2A] border border-[#D4D3C9]'
                }`}
              >
                {isEditing ? <Save className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
                <span>{isEditing ? 'Done Editing' : 'Edit Letter'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-1.5 bg-white hover:bg-[#E5E5DF] text-[#2D2D2A] font-bold uppercase tracking-wider text-xs border border-[#D4D3C9] rounded-xl transition flex items-center space-x-1.5 shadow-xs"
              >
                {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5 text-[#5A5A40]" />}
                <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                className="px-3.5 py-1.5 bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold uppercase tracking-wider text-xs rounded-xl transition flex items-center space-x-1.5 shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download TXT</span>
              </button>
            </div>
          </div>

          {/* User Confirmation Banner */}
          <div className="p-3 bg-[#E5E5DF]/70 border border-[#D4D3C9] rounded-2xl text-xs text-[#2D2D2A] flex items-center space-x-2">
            <FileText className="h-4 w-4 text-[#5A5A40] shrink-0" />
            <span>
              <strong className="font-bold text-[#5A5A40]">Review Required:</strong> Please review and edit this application letter before sending.
            </span>
          </div>

          {/* Letter Content Display or Editor */}
          {isEditing ? (
            <textarea
              rows={18}
              value={currentLetter}
              onChange={(e) => setCurrentLetter(e.target.value)}
              className="w-full p-4 text-xs font-mono bg-[#F8F7F4] border border-[#D4D3C9] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40] leading-relaxed text-[#2D2D2A]"
            />
          ) : (
            <div className="p-6 bg-[#F8F7F4] rounded-2xl border border-[#D4D3C9] text-xs text-[#2D2D2A] font-sans leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto shadow-inner">
              {currentLetter}
            </div>
          )}

          {/* Regenerate with Custom Note Bar */}
          {onRegenerateLetter && (
            <div className="pt-3 border-t border-[#D4D3C9] flex items-center space-x-2 text-xs">
              <input
                type="text"
                placeholder="Optional instruction to adjust tone or emphasize specific skill..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[#2D2D2A]"
              />
              <button
                onClick={() => onRegenerateLetter(customNote)}
                disabled={isRegenerating}
                className="px-3.5 py-2 bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold uppercase tracking-wider text-xs rounded-xl flex items-center space-x-1 transition shadow-xs"
              >
                {isRegenerating && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Regenerate Letter</span>
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8F7F4] border-t border-[#D4D3C9] flex justify-end sticky bottom-0 z-10 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#2D2D2A] hover:bg-[#1D1D1A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
