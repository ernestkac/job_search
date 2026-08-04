import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import { CandidateProfile } from '../types';

/**
 * Utility to convert Blob to DataURL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Utility to convert base64 DataURL to ArrayBuffer
 */
export function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const base64 = dataUrl.split(',')[1] || dataUrl;
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generates a clean PDF for a Cover Letter
 */
export async function generateCoverLetterPdf(
  jobTitle: string,
  employer: string,
  letterContent: string,
  candidateName: string
): Promise<{ blob: Blob; dataUrl: string; arrayBuffer: ArrayBuffer }> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxLineWidth = pageWidth - margin * 2;
  let y = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(45, 45, 42); // #2D2D2A
  doc.text(candidateName || 'Applicant', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 64); // #5A5A40
  doc.text(`Application for: ${jobTitle} at ${employer}`, margin, y);
  y += 5;
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, y);
  y += 8;

  // Divider Line
  doc.setDrawColor(212, 211, 201); // #D4D3C9
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  const lines = doc.splitTextToSize(letterContent, maxLineWidth);
  for (const line of lines) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += 6;
  }

  const pdfOutput = doc.output('arraybuffer');
  const blob = new Blob([pdfOutput], { type: 'application/pdf' });
  const dataUrl = await blobToDataUrl(blob);

  return { blob, dataUrl, arrayBuffer: pdfOutput };
}

/**
 * Generates a structured multi-page PDF CV from CandidateProfile (including references)
 */
export async function generateCvPdf(
  profile: CandidateProfile
): Promise<{ blob: Blob; dataUrl: string; arrayBuffer: ArrayBuffer }> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededHeight: number = 10) => {
    if (y + neededHeight > 275) {
      doc.addPage();
      y = 18;
    }
  };

  // Header Box
  doc.setFillColor(248, 247, 244); // #F8F7F4
  doc.rect(margin - 3, y - 5, contentWidth + 6, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(45, 45, 42);
  doc.text(profile.fullName || 'Candidate Name', margin, y + 2);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 64);
  doc.text(profile.professionalTitle || 'ICT Professional', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  const contactText = [
    profile.email,
    profile.phone,
    profile.location,
    profile.linkedIn,
    profile.github
  ].filter(Boolean).join(' | ');
  doc.text(contactText, margin, y);
  y += 12;

  // Section Header Generator
  const renderSectionHeader = (title: string) => {
    checkPageBreak(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(45, 45, 42);
    doc.text(title.toUpperCase(), margin, y);
    y += 2.5;
    doc.setDrawColor(90, 90, 64);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;
  };

  // 1. Professional Summary
  if (profile.summary) {
    renderSectionHeader('Professional Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);
    const summaryLines = doc.splitTextToSize(profile.summary, contentWidth);
    for (const line of summaryLines) {
      checkPageBreak(5);
      doc.text(line, margin, y);
      y += 5;
    }
    y += 4;
  }

  // 2. Technical Skills
  if (profile.technicalSkills) {
    renderSectionHeader('Technical Skills');
    doc.setFontSize(9);
    const skillCategories = [
      { label: 'Systems & OS', skills: profile.technicalSkills.systemsAndOS },
      { label: 'Software Dev', skills: profile.technicalSkills.softwareDevelopment },
      { label: 'Databases & SQL', skills: profile.technicalSkills.databasesAndSQL },
      { label: 'Networking', skills: profile.technicalSkills.networking },
      { label: 'Cybersecurity', skills: profile.technicalSkills.cybersecurity },
      { label: 'IT Support', skills: profile.technicalSkills.itSupportAndHardware },
      { label: 'Tools & Frameworks', skills: profile.technicalSkills.toolsAndFrameworks },
    ];

    for (const cat of skillCategories) {
      if (cat.skills && cat.skills.length > 0) {
        checkPageBreak(5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 45, 42);
        doc.text(`${cat.label}: `, margin, y);
        const labelWidth = doc.getTextWidth(`${cat.label}: `);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const skillsStr = cat.skills.join(', ');
        const wrappedSkills = doc.splitTextToSize(skillsStr, contentWidth - labelWidth);
        
        doc.text(wrappedSkills[0], margin + labelWidth, y);
        y += 5;
        for (let i = 1; i < wrappedSkills.length; i++) {
          checkPageBreak(5);
          doc.text(wrappedSkills[i], margin + 10, y);
          y += 5;
        }
      }
    }
    y += 4;
  }

  // 3. Work Experience
  if (profile.workExperience && profile.workExperience.length > 0) {
    renderSectionHeader('Work Experience');
    for (const exp of profile.workExperience) {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(45, 45, 42);
      doc.text(exp.jobTitle, margin, y);

      const datesStr = `${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}`;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(90, 90, 64);
      doc.text(datesStr, margin + contentWidth - doc.getTextWidth(datesStr), y);
      y += 4.5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`${exp.company} ${exp.location ? `| ${exp.location}` : ''}`, margin, y);
      y += 5;

      if (exp.responsibilities && exp.responsibilities.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(50, 50, 50);
        for (const resp of exp.responsibilities) {
          checkPageBreak(5);
          const respLines = doc.splitTextToSize(`•  ${resp}`, contentWidth - 4);
          for (const line of respLines) {
            checkPageBreak(4.5);
            doc.text(line, margin + 2, y);
            y += 4.5;
          }
        }
      }
      y += 3;
    }
    y += 2;
  }

  // 4. Education
  if (profile.education && profile.education.length > 0) {
    renderSectionHeader('Education');
    for (const edu of profile.education) {
      checkPageBreak(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(45, 45, 42);
      doc.text(edu.degree, margin, y);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(90, 90, 64);
      doc.text(edu.graduationYear, margin + contentWidth - doc.getTextWidth(edu.graduationYear), y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`${edu.institution} - ${edu.fieldOfStudy}`, margin, y);
      y += 6;
    }
    y += 2;
  }

  // 5. Certifications
  if (profile.certifications && profile.certifications.length > 0) {
    renderSectionHeader('Certifications');
    for (const cert of profile.certifications) {
      checkPageBreak(6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(45, 45, 42);
      doc.text(`•  ${cert.name}`, margin + 2, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(90, 90, 64);
      doc.text(`(${cert.issuingOrganization}, ${cert.issueYear})`, margin + 6 + doc.getTextWidth(`•  ${cert.name}`), y);
      y += 5;
    }
    y += 3;
  }

  // 6. References
  if (profile.references && profile.references.length > 0) {
    renderSectionHeader('References');
    for (const ref of profile.references) {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(45, 45, 42);
      doc.text(ref.name, margin, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(70, 70, 70);
      doc.text(`${ref.position}, ${ref.organization}`, margin, y);
      y += 4;

      const refContact = [
        ref.phone ? `Phone: ${ref.phone}` : null,
        ref.email ? `Email: ${ref.email}` : null,
      ].filter(Boolean).join('  |  ');

      if (refContact) {
        doc.text(refContact, margin, y);
        y += 4.5;
      }
      y += 2;
    }
  }

  const pdfOutput = doc.output('arraybuffer');
  const blob = new Blob([pdfOutput], { type: 'application/pdf' });
  const dataUrl = await blobToDataUrl(blob);

  return { blob, dataUrl, arrayBuffer: pdfOutput };
}

/**
 * Merges multiple PDF ArrayBuffers into a single PDF
 */
export async function mergePdfBuffers(
  pdfBuffers: ArrayBuffer[]
): Promise<{
  blob: Blob;
  dataUrl: string;
  arrayBuffer: ArrayBuffer;
  pageCount: number;
  sizeMb: number;
  bytes: number;
}> {
  const mergedPdf = await PDFDocument.create();
  let totalPages = 0;

  for (const buffer of pdfBuffers) {
    if (!buffer || buffer.byteLength === 0) continue;
    try {
      const pdf = await PDFDocument.load(buffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
        totalPages++;
      });
    } catch (err) {
      console.warn('Error merging a PDF chunk:', err);
    }
  }

  const mergedPdfBytes = await mergedPdf.save();
  const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
  const dataUrl = await blobToDataUrl(blob);
  const bytes = mergedPdfBytes.byteLength;
  const sizeMb = Number((bytes / (1024 * 1024)).toFixed(2));

  return {
    blob,
    dataUrl,
    arrayBuffer: mergedPdfBytes.buffer,
    pageCount: totalPages,
    sizeMb,
    bytes,
  };
}

/**
 * Utility to count total pages in a PDF ArrayBuffer
 */
export async function getPdfPageCount(buffer: ArrayBuffer): Promise<number> {
  try {
    const pdf = await PDFDocument.load(buffer);
    return pdf.getPageCount();
  } catch (err) {
    return 1;
  }
}
