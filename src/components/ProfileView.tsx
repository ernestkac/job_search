import React, { useState } from 'react';
import { CandidateProfile, WorkExperience, Education, Certification, Project } from '../types';
import { Upload, Sparkles, User, Briefcase, GraduationCap, Award, Code, Save, Plus, Trash2, CheckCircle2, RefreshCw, FileText } from 'lucide-react';

interface ProfileViewProps {
  profile: CandidateProfile;
  onSaveProfile: (profile: CandidateProfile) => Promise<void>;
  onParseCv: (payload: { rawText?: string; fileBase64?: string; mimeType?: string }) => Promise<void>;
  isParsingCv: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onSaveProfile,
  onParseCv,
  isParsingCv,
}) => {
  const [formData, setFormData] = useState<CandidateProfile>({ ...profile });
  const [rawCvInput, setRawCvInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'personal' | 'skills' | 'experience' | 'education' | 'certifications' | 'projects'>('upload');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    // For plain text files, read as text
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onParseCv({ rawText: text });
      };
      reader.readAsText(file);
    } else {
      // For PDF / DOCX, read base64 data URL
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64Data = result.split(',')[1];
        onParseCv({ fileBase64: base64Data, mimeType: file.type || 'application/pdf' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveProfile(formData);
    setIsSaving(false);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  // Skill category updater
  const handleSkillChange = (category: keyof CandidateProfile['technicalSkills'], textValue: string) => {
    const list = textValue.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      technicalSkills: {
        ...prev.technicalSkills,
        [category]: list
      }
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#2D2D2A] leading-tight">
            User Profile &amp; Candidate CV
          </h1>
          <p className="text-[#2D2D2A]/60 text-xs">
            Stored securely and analyzed by AI to evaluate job matches &amp; tailor application letters.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-3 bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition flex items-center space-x-2 self-start sm:self-auto"
        >
          {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Candidate profile saved successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-[#D4D3C9] gap-1 text-xs font-bold uppercase tracking-wider">
        {[
          { id: 'upload', label: 'CV AI Parser & Upload', icon: Upload },
          { id: 'personal', label: 'Personal & Summary', icon: User },
          { id: 'skills', label: 'Technical Skills', icon: Code },
          { id: 'experience', label: 'Work Experience', icon: Briefcase },
          { id: 'education', label: 'Education', icon: GraduationCap },
          { id: 'certifications', label: 'Certifications', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-3 border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-[#5A5A40] text-[#5A5A40] bg-[#E5E5DF]/50 rounded-t-xl'
                  : 'border-transparent text-[#2D2D2A]/60 hover:text-[#2D2D2A]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: CV AI Upload & Parser */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* File Drag & Drop Box */}
            <div className="bg-[#F8F7F4] rounded-3xl p-6 border-2 border-dashed border-[#D4D3C9] hover:border-[#5A5A40] transition text-center space-y-4 flex flex-col justify-center items-center">
              <div className="h-12 w-12 rounded-full bg-[#E5E5DF] text-[#5A5A40] border border-[#D4D3C9] flex items-center justify-center">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#2D2D2A] text-sm">Upload CV Document</h3>
                <p className="text-xs text-[#2D2D2A]/60 mt-1">Supports PDF, DOCX, or TXT files</p>
              </div>

              <label className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition shadow-xs">
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isParsingCv}
                />
              </label>

              {isParsingCv && (
                <div className="flex items-center space-x-2 text-xs text-[#5A5A40] font-bold uppercase tracking-wider">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>AI is analyzing your CV...</span>
                </div>
              )}
            </div>

            {/* Paste Raw Text Box */}
            <div className="bg-white rounded-3xl p-6 border border-[#D4D3C9] space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-[#2D2D2A] text-sm flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-[#5A5A40]" />
                  <span>Or Paste CV Text Content</span>
                </h3>
                <p className="text-xs text-[#2D2D2A]/60 mt-1">
                  Paste raw text from your resume directly for instant structured extraction.
                </p>
                <textarea
                  rows={6}
                  placeholder="Paste work experience, education, skills, and contact details here..."
                  value={rawCvInput}
                  onChange={(e) => setRawCvInput(e.target.value)}
                  className="w-full mt-3 p-3 text-xs bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-[#2D2D2A]"
                />
              </div>

              <button
                onClick={() => onParseCv({ rawText: rawCvInput })}
                disabled={isParsingCv || !rawCvInput.trim()}
                className="w-full py-3 bg-[#5A5A40] hover:bg-[#4A4A35] disabled:bg-[#D4D3C9] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Run AI CV Extraction</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Personal Info & Summary */}
      {activeTab === 'personal' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D4D3C9] space-y-4">
          <h2 className="font-serif font-bold text-[#2D2D2A] text-base">Personal Details &amp; Summary</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#5A5A40] uppercase tracking-wider text-[10px]">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[#2D2D2A] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#5A5A40] uppercase tracking-wider text-[10px]">Professional Title</label>
              <input
                type="text"
                value={formData.professionalTitle}
                onChange={(e) => setFormData(p => ({ ...p, professionalTitle: e.target.value }))}
                className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[#2D2D2A] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#5A5A40] uppercase tracking-wider text-[10px]">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[#2D2D2A] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#5A5A40] uppercase tracking-wider text-[10px]">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[#2D2D2A] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#5A5A40] uppercase tracking-wider text-[10px]">Location (City, Country)</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[#2D2D2A] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#5A5A40] uppercase tracking-wider text-[10px]">LinkedIn Profile</label>
              <input
                type="text"
                value={formData.linkedIn || ''}
                onChange={(e) => setFormData(p => ({ ...p, linkedIn: e.target.value }))}
                className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[#2D2D2A] focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="font-bold text-[#5A5A40] uppercase tracking-wider text-[10px]">Professional Background Summary</label>
            <textarea
              rows={4}
              value={formData.summary}
              onChange={(e) => setFormData(p => ({ ...p, summary: e.target.value }))}
              className="w-full p-3 text-xs bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[#2D2D2A] focus:bg-white"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Technical Skills */}
      {activeTab === 'skills' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D4D3C9] space-y-4">
          <h2 className="font-serif font-bold text-[#2D2D2A] text-base">Technical Skills Categorization</h2>
          <p className="text-xs text-[#2D2D2A]/60">Comma-separated list for each technical domain.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">Systems &amp; Operating Systems</label>
              <input
                type="text"
                value={formData.technicalSkills?.systemsAndOS?.join(', ') || ''}
                onChange={(e) => handleSkillChange('systemsAndOS', e.target.value)}
                placeholder="Linux, Windows Server, Active Directory, VMware..."
                className="w-full p-2.5 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[#2D2D2A]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">Networking &amp; Infrastructure</label>
              <input
                type="text"
                value={formData.technicalSkills?.networking?.join(', ') || ''}
                onChange={(e) => handleSkillChange('networking', e.target.value)}
                placeholder="Cisco, LAN/WAN, TCP/IP, VPN, Routing..."
                className="w-full p-2.5 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[#2D2D2A]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">Software &amp; Web Development</label>
              <input
                type="text"
                value={formData.technicalSkills?.softwareDevelopment?.join(', ') || ''}
                onChange={(e) => handleSkillChange('softwareDevelopment', e.target.value)}
                placeholder="JavaScript, TypeScript, React, Node.js, Python..."
                className="w-full p-2.5 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[#2D2D2A]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">Databases &amp; SQL Querying</label>
              <input
                type="text"
                value={formData.technicalSkills?.databasesAndSQL?.join(', ') || ''}
                onChange={(e) => handleSkillChange('databasesAndSQL', e.target.value)}
                placeholder="MySQL, PostgreSQL, MS SQL Server, Oracle..."
                className="w-full p-2.5 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[#2D2D2A]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">Cybersecurity &amp; InfoSec</label>
              <input
                type="text"
                value={formData.technicalSkills?.cybersecurity?.join(', ') || ''}
                onChange={(e) => handleSkillChange('cybersecurity', e.target.value)}
                placeholder="Firewalls, SIEM, Antivirus, Vulnerability Scanning..."
                className="w-full p-2.5 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[#2D2D2A]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">IT Support &amp; Hardware Maintenance</label>
              <input
                type="text"
                value={formData.technicalSkills?.itSupportAndHardware?.join(', ') || ''}
                onChange={(e) => handleSkillChange('itSupportAndHardware', e.target.value)}
                placeholder="Hardware diagnostics, Helpdesk ticketing, Printers..."
                className="w-full p-2.5 bg-[#F8F7F4] border border-[#D4D3C9] rounded-xl text-[#2D2D2A]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Work Experience */}
      {activeTab === 'experience' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D4D3C9] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-[#2D2D2A] text-base">Work Experience History</h2>
            <button
              onClick={() => setFormData(p => ({
                ...p,
                workExperience: [
                  ...p.workExperience,
                  {
                    id: `exp-${Date.now()}`,
                    jobTitle: 'ICT Role',
                    company: 'Organization',
                    startDate: '2023-01',
                    endDate: 'Present',
                    isCurrent: true,
                    responsibilities: ['Maintained ICT systems and infrastructure']
                  }
                ]
              }))}
              className="px-3.5 py-2 bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center space-x-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Position</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.workExperience.map((exp, idx) => (
              <div key={exp.id || idx} className="p-4 bg-[#F8F7F4] border border-[#D4D3C9] rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#5A5A40] uppercase tracking-wider text-[10px]">Position #{idx + 1}</span>
                  <button
                    onClick={() => setFormData(p => ({ ...p, workExperience: p.workExperience.filter((_, i) => i !== idx) }))}
                    className="text-rose-700 hover:text-rose-900 font-bold text-xs uppercase tracking-wider flex items-center space-x-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">Job Title</label>
                    <input
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(p => {
                          const updated = [...p.workExperience];
                          updated[idx].jobTitle = val;
                          return { ...p, workExperience: updated };
                        });
                      }}
                      className="w-full p-2 bg-white border border-[#D4D3C9] rounded-xl mt-1 text-[#2D2D2A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">Company / Employer</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(p => {
                          const updated = [...p.workExperience];
                          updated[idx].company = val;
                          return { ...p, workExperience: updated };
                        });
                      }}
                      className="w-full p-2 bg-white border border-[#D4D3C9] rounded-xl mt-1 text-[#2D2D2A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">Key Responsibilities (one per line)</label>
                  <textarea
                    rows={3}
                    value={exp.responsibilities.join('\n')}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n');
                      setFormData(p => {
                        const updated = [...p.workExperience];
                        updated[idx].responsibilities = lines;
                        return { ...p, workExperience: updated };
                      });
                    }}
                    className="w-full p-2 bg-white border border-[#D4D3C9] rounded-xl mt-1 text-[#2D2D2A]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Education */}
      {activeTab === 'education' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D4D3C9] space-y-4">
          <h2 className="font-serif font-bold text-[#2D2D2A] text-base">Education &amp; Academic Qualifications</h2>
          <div className="space-y-3">
            {formData.education.map((edu, idx) => (
              <div key={edu.id || idx} className="p-4 bg-[#F8F7F4] border border-[#D4D3C9] rounded-2xl space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">Degree / Diploma</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(p => {
                          const updated = [...p.education];
                          updated[idx].degree = val;
                          return { ...p, education: updated };
                        });
                      }}
                      className="w-full p-2 bg-white border border-[#D4D3C9] rounded-xl mt-1 text-[#2D2D2A]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(p => {
                          const updated = [...p.education];
                          updated[idx].institution = val;
                          return { ...p, education: updated };
                        });
                      }}
                      className="w-full p-2 bg-white border border-[#D4D3C9] rounded-xl mt-1 text-[#2D2D2A]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Certifications */}
      {activeTab === 'certifications' && (
        <div className="bg-white rounded-3xl p-6 border border-[#D4D3C9] space-y-4">
          <h2 className="font-serif font-bold text-[#2D2D2A] text-base">Certifications &amp; Licenses</h2>
          <div className="space-y-3">
            {formData.certifications.map((cert, idx) => (
              <div key={cert.id || idx} className="p-4 bg-[#F8F7F4] border border-[#D4D3C9] rounded-2xl space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">Certification Name</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(p => {
                          const updated = [...p.certifications];
                          updated[idx].name = val;
                          return { ...p, certifications: updated };
                        });
                      }}
                      className="w-full p-2 bg-white border border-[#D4D3C9] rounded-xl mt-1 text-[#2D2D2A]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#5A5A40] text-[10px] uppercase tracking-wider">Issuing Authority</label>
                    <input
                      type="text"
                      value={cert.issuingOrganization}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(p => {
                          const updated = [...p.certifications];
                          updated[idx].issuingOrganization = val;
                          return { ...p, certifications: updated };
                        });
                      }}
                      className="w-full p-2 bg-white border border-[#D4D3C9] rounded-xl mt-1 text-[#2D2D2A]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
