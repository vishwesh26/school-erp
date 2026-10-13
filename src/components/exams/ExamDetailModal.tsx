"use client";

import React, { useState } from "react";
import { ExamItem } from "@/lib/examActions";

interface ExamDetailModalProps {
  exam: ExamItem | null;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "syllabus" | "pattern" | "marks" | "timetable" | "questionBank";
}

const ExamDetailModal: React.FC<ExamDetailModalProps> = ({
  exam,
  isOpen,
  onClose,
  defaultTab = "syllabus",
}) => {
  const [activeTab, setActiveTab] = useState<"syllabus" | "pattern" | "marks" | "timetable" | "questionBank">(defaultTab);
  const [isGeneratingPrint, setIsGeneratingPrint] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen || !exam) return null;

  // Handler to open uploaded Timetable PDF or generate printable timetable datesheet
  const handleOpenTimetablePdf = () => {
    if (exam.timetablePdfUrl) {
      try {
        if (exam.timetablePdfUrl.startsWith("data:")) {
          const parts = exam.timetablePdfUrl.split(",");
          const mime = parts[0].match(/:(.*?);/)?.[1] || "application/pdf";
          const binary = atob(parts[1]);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([array], { type: mime });
          const blobUrl = URL.createObjectURL(blob);
          const win = window.open(blobUrl, "_blank");
          if (!win) {
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = exam.timetablePdfName || `${exam.title.replace(/\s+/g, "_")}_Schedule.pdf`;
            link.click();
          }
          return;
        } else {
          window.open(exam.timetablePdfUrl, "_blank");
          return;
        }
      } catch (err) {
        console.error("Failed to open base64 PDF, falling back to printable view", err);
      }
    }

    // Default: Printable official Exam Schedule & Timetable PDF window
    generatePrintableTimetable();
  };

  const generatePrintableTimetable = () => {
    setIsGeneratingPrint(true);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const unitsHtml = (exam.syllabus?.units || [])
        .map(
          (u) =>
            `<li style="margin-bottom: 6px;"><strong>${u.unitName} (${u.weightage} Marks):</strong> ${u.topics?.join(", ") || ""}</li>`
        )
        .join("");

      const marksHtml = (exam.marksDistribution?.sections || [])
        .map(
          (s) => `
          <tr>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 700;">${s.sectionName}</td>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center;">${s.questionCount}</td>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center;">${s.marksPerQuestion}</td>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #f16122;">${s.totalMarks}</td>
            <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">${s.description}</td>
          </tr>`
        )
        .join("");

      const instructions = exam.pattern?.examHallInstructions || exam.pattern?.onlineExamInstructions || [
        "Report to assigned examination hall 15 minutes before exam.",
        "15 minutes mandatory question paper reading time before writing.",
        "Use only blue or black ballpoint pen on the answer booklet.",
        "School ID card and admit card must be visibly displayed on desk.",
        "Electronic devices, smartwatches, and notes strictly prohibited.",
      ];

      const instructionsHtml = instructions
        .map((ins) => `<li style="margin-bottom: 4px;">${ins}</li>`)
        .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${exam.title} - Official School Examination Timetable & Blueprint</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 36px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 3px solid #4e282c; padding-bottom: 16px; margin-bottom: 20px; }
            .school-name { font-size: 22px; font-weight: 900; color: #4e282c; text-transform: uppercase; margin: 0; }
            .sub-title { font-size: 13px; color: #f16122; font-weight: 800; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
            .exam-title { font-size: 19px; font-weight: 800; color: #0f172a; margin-top: 12px; }
            .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f8fafc; padding: 14px; border-radius: 8px; margin: 18px 0; border: 1px solid #e2e8f0; font-size: 13px; }
            .section-title { font-size: 14px; font-weight: 800; color: #4e282c; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.5px; }
            .pattern-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            .pattern-table th { background: #f1f5f9; font-weight: 800; text-align: left; padding: 8px 10px; border: 1px solid #cbd5e1; }
            .footer { margin-top: 36px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; text-align: center; }
            .badge-mode { display: inline-block; padding: 3px 8px; background: #fef2f2; color: #991b1b; font-weight: 800; border-radius: 4px; font-size: 11px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="school-name">DCPEMS Examination Board</h1>
            <div class="sub-title">OFFICIAL SCHOOL EXAMINATION TIMETABLE & SPECIFICATION (2026-27)</div>
            <div class="exam-title">${exam.title}</div>
          </div>

          <div class="meta-grid">
            <div><strong>Subject:</strong> ${exam.subjectName}</div>
            <div><strong>Class:</strong> ${exam.className}</div>
            <div><strong>Exam Date:</strong> ${exam.examDate} (${exam.timetable?.dayOfWeek || "Scheduled"})</div>
            <div><strong>Writing Time:</strong> ${exam.timetable?.writingTime || `${exam.startTime} - ${exam.endTime}`}</div>
            <div><strong>Exam Mode:</strong> <span class="badge-mode">Offline (Pen & Paper)</span></div>
            <div><strong>Duration:</strong> ${exam.duration}</div>
            <div><strong>Total Marks:</strong> ${exam.totalMarks} (Passing: ${exam.passingMarks})</div>
            <div><strong>Reporting Time:</strong> ${exam.timetable?.reportingTime || "08:30 AM"}</div>
            <div><strong>Exam Hall / Room:</strong> ${exam.timetable?.hallOrPortal || "School Examination Hall"}</div>
          </div>

          <div class="section-title">I. Prescribed Examination Syllabus</div>
          <ul style="font-size: 13px; margin-top: 8px; padding-left: 20px;">
            ${unitsHtml || "<li>Complete Term Syllabus</li>"}
          </ul>
          <p style="font-size: 12px; margin-top: 6px;"><strong>Prescribed Book / References:</strong> ${exam.syllabus?.prescribedBook || "Standard Textbook"}</p>
          ${exam.syllabus?.generalInstructions ? `<p style="font-size: 12px; color: #64748b;"><em>Note: ${exam.syllabus.generalInstructions}</em></p>` : ""}

          <div class="section-title">II. Question Paper Pattern & Blue-Print</div>
          <p style="font-size: 12px; margin-top: 6px;"><strong>Structure Overview:</strong> ${exam.pattern?.sectionsSummary || "Physical Question Paper Format"}</p>
          <p style="font-size: 12px;"><strong>Total Questions:</strong> ${exam.pattern?.totalQuestions || "N/A"} &nbsp;|&nbsp; <strong>Writing Duration:</strong> ${exam.pattern?.durationLabel || exam.duration}</p>

          <div class="section-title">III. Marking Scheme & Marks Distribution</div>
          <table class="pattern-table">
            <thead>
              <tr>
                <th>Section Name</th>
                <th style="text-align: center;">Questions</th>
                <th style="text-align: center;">Marks / Q</th>
                <th style="text-align: center;">Total</th>
                <th>Question Type & Description</th>
              </tr>
            </thead>
            <tbody>
              ${marksHtml}
            </tbody>
          </table>
          <p style="font-size: 11px; margin-top: 8px; color: #475569;"><strong>Scoring Policy:</strong> ${exam.marksDistribution?.scoringPolicy || "Step-wise marking scheme. Full mathematical working must be shown."}</p>

          <div class="section-title">IV. Examination Hall Rules & Guidelines</div>
          <ol style="font-size: 12px; margin-top: 8px; padding-left: 20px;">
            ${instructionsHtml}
          </ol>

          <div class="footer">
            DCPEMS School ERP • Official Academic Examination Schedule • Authorized for Student Revision & Verification
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
    setTimeout(() => {
      setIsGeneratingPrint(false);
    }, 1000);
  };

  // Handler to open uploaded Question Bank PDF or generate printable reference problem sheet
  const handleOpenQuestionBankPdf = () => {
    if (exam.questionBankPdfUrl) {
      try {
        if (exam.questionBankPdfUrl.startsWith("data:")) {
          const parts = exam.questionBankPdfUrl.split(",");
          const mime = parts[0].match(/:(.*?);/)?.[1] || "application/pdf";
          const binary = atob(parts[1]);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([array], { type: mime });
          const blobUrl = URL.createObjectURL(blob);
          const win = window.open(blobUrl, "_blank");
          if (!win) {
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = exam.questionBankPdfName || `${exam.title.replace(/\s+/g, "_")}_QuestionBank_Reference.pdf`;
            link.click();
          }
          return;
        } else {
          window.open(exam.questionBankPdfUrl, "_blank");
          return;
        }
      } catch (err) {
        console.error("Failed to open question bank PDF", err);
      }
    }

    // Default: Printable Reference Question Bank & Model Practice Paper
    generatePrintableQuestionBank();
  };

  const generatePrintableQuestionBank = () => {
    setIsGeneratingPrint(true);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const unitsHtml = (exam.syllabus?.units || [])
        .map(
          (u, idx) => `
          <div style="margin-bottom: 20px; padding: 14px; background: #f8fafc; border-left: 4px solid #059669; border-radius: 6px;">
            <h3 style="font-size: 14px; margin: 0 0 6px 0; color: #065f46;">Unit ${idx + 1}: ${u.unitName} (${u.weightage} Marks)</h3>
            <p style="font-size: 12px; color: #475569; margin: 0 0 10px 0;"><strong>Prescribed Syllabus Topics:</strong> ${u.topics?.join(", ") || "Key syllabus concepts"}</p>
            <div style="font-size: 12px; font-weight: 500; color: #1e293b; line-height: 1.6;">
              <p style="margin: 6px 0;"><strong>Q1 (Conceptual Definitions & Recall):</strong> State the fundamental definitions and key theorems covering ${u.unitName}. (2 Marks)</p>
              <p style="margin: 6px 0;"><strong>Q2 (Short Derivation & Calculations):</strong> Solve model problems and establish proof for core principles in ${u.topics?.[0] || u.unitName}. (3 Marks)</p>
              <p style="margin: 6px 0;"><strong>Q3 (Analytical Long Application):</strong> Contextual examination problem evaluating practical understanding and multi-step derivations. (5 Marks)</p>
            </div>
          </div>
        `
        )
        .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${exam.questionBankTitle || `${exam.subjectName} Reference Question Bank`}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 36px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 3px solid #059669; padding-bottom: 16px; margin-bottom: 20px; }
            .school-name { font-size: 22px; font-weight: 900; color: #4e282c; text-transform: uppercase; margin: 0; }
            .sub-title { font-size: 13px; color: #059669; font-weight: 800; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
            .exam-title { font-size: 19px; font-weight: 800; color: #0f172a; margin-top: 12px; }
            .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f0fdf4; padding: 14px; border-radius: 8px; margin: 18px 0; border: 1px solid #bbf7d0; font-size: 13px; }
            .section-title { font-size: 14px; font-weight: 800; color: #065f46; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.5px; }
            .footer { margin-top: 36px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; text-align: center; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="school-name">DCPEMS Examination Board</h1>
            <div class="sub-title">OFFICIAL REFERENCE QUESTION BANK & MODEL PRACTICE MATERIAL (2026-27)</div>
            <div class="exam-title">${exam.questionBankTitle || `${exam.title} - Question Bank for Reference`}</div>
          </div>

          <div class="meta-grid">
            <div><strong>Subject:</strong> ${exam.subjectName}</div>
            <div><strong>Class:</strong> ${exam.className}</div>
            <div><strong>Exam Date:</strong> ${exam.examDate}</div>
            <div><strong>Total Marks:</strong> ${exam.totalMarks}</div>
            <div><strong>Prescribed Book:</strong> ${exam.syllabus?.prescribedBook || "Standard Textbook"}</div>
            <div><strong>Faculty In-Charge:</strong> ${exam.teacherName || "Assigned Faculty"}</div>
          </div>

          <div class="section-title">Curated Model Practice Problem Sets & Reference Questions</div>
          ${unitsHtml}

          <div class="footer">
            DCPEMS School ERP • Academic Reference Material • Strictly for Student Revision & Examination Preparation
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
    setTimeout(() => {
      setIsGeneratingPrint(false);
    }, 1000);
  };

  const hallInstructions = exam.pattern?.examHallInstructions || exam.pattern?.onlineExamInstructions || [
    "Students must report to the assigned examination hall at least 15 minutes prior to the exam start time.",
    "Mandatory 15-minute question paper reading time is provided from 08:45 AM to 09:00 AM. Writing is strictly prohibited during reading time.",
    "Write answers clearly using blue or black ballpoint pen only on the standardized school answer booklet.",
    "School ID card and hall ticket must be placed on the desk throughout the examination.",
    "Mobile phones, smartwatches, programmable calculators, or study notes are strictly prohibited inside the exam hall.",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-slate-50 to-[#fdece7]/30">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-[#FEFCE8] text-[#854d0e] border border-amber-200">
                {exam.subjectName}
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                Class {exam.className}
              </span>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                📝 Offline (Pen & Paper)
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                📅 {exam.examDate}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {exam.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Venue: {exam.timetable?.hallOrPortal || "Examination Hall"} • Duration: {exam.duration} • Total Marks: {exam.totalMarks}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              onClick={handleOpenTimetablePdf}
              type="button"
              disabled={isGeneratingPrint}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="View or download exam timetable PDF"
            >
              <span>📄</span>
              <span>Timetable PDF</span>
            </button>
            <button
              onClick={handleOpenQuestionBankPdf}
              type="button"
              disabled={isGeneratingPrint}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="View or download question bank PDF for reference"
            >
              <span>📑</span>
              <span>Q-Bank PDF</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="px-5 sm:px-6 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("syllabus")}
            className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "syllabus"
                ? "border-[#4e282c] text-[#4e282c] bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📖</span>
            <span>Exam Syllabus</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              {exam.syllabus?.units?.length || 0} Units
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pattern")}
            className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "pattern"
                ? "border-[#f16122] text-[#f16122] bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📋</span>
            <span>Paper Pattern</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
              Pen & Paper
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("marks")}
            className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "marks"
                ? "border-emerald-600 text-emerald-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🎯</span>
            <span>Marking Scheme</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {exam.marksDistribution?.sections?.length || 0} Sections
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("timetable")}
            className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "timetable"
                ? "border-indigo-600 text-indigo-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>⏰</span>
            <span>Schedule & Timetable PDF</span>
            {exam.timetablePdfUrl && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                PDF
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("questionBank")}
            className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "questionBank"
                ? "border-teal-600 text-teal-800 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📑</span>
            <span>Question Bank (Reference PDF)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 font-bold">
              {exam.questionBankPdfUrl ? "PDF Attached" : "Reference"}
            </span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* 1. SYLLABUS TAB */}
          {activeTab === "syllabus" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="bg-[#FEFCE8]/70 p-4 rounded-2xl border border-amber-200/80 flex items-start gap-3">
                <span className="text-xl">📚</span>
                <div>
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">
                    Prescribed Examination Syllabus & Units
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Prescribed Book: <strong>{exam.syllabus?.prescribedBook || "Standard Prescribed Textbook"}</strong>
                  </p>
                  {exam.syllabus?.generalInstructions && (
                    <p className="text-[11px] text-amber-700 mt-1 italic">
                      Coverage Note: {exam.syllabus.generalInstructions}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {exam.syllabus?.units?.map((unit, uIdx) => (
                  <div
                    key={uIdx}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col gap-2 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-black text-slate-900">
                        {unit.unitName}
                      </h5>
                      <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-[#4e282c] text-white shadow-2xs">
                        {unit.weightage} Marks
                      </span>
                    </div>

                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 mt-1 pl-1">
                      {unit.topics.map((t, tIdx) => (
                        <li key={tIdx} className="leading-relaxed">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. EXAM PAPER PATTERN TAB */}
          {activeTab === "pattern" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📋</span>
                  <div>
                    <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                      Question Paper Blueprint & Pattern (Pen & Paper)
                    </h4>
                    <p className="text-xs text-amber-900 mt-0.5">
                      Mode: <strong>Offline Pen-Paper Written Exam</strong> • Total Questions: <strong>{exam.pattern?.totalQuestions || "As Printed"}</strong> • Writing Time: <strong>{exam.pattern?.durationLabel || exam.duration}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* OVERVIEW SUMMARY */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                  Question Paper Structure & Section Layout
                </h5>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {exam.pattern?.sectionsSummary || "Physical question paper comprising multiple choice questions, short answers, and long descriptive questions with internal choice."}
                </p>
              </div>

              {/* EXAM HALL INSTRUCTIONS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2.5">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span>🏛️</span>
                  <span>Examination Hall Guidelines & Stationery Rules</span>
                </h5>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-1">
                  {hallInstructions.map((ins, iIdx) => (
                    <li key={iIdx} className="leading-relaxed">
                      {ins}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 3. MARKING SCHEME TAB */}
          {activeTab === "marks" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎯</span>
                  <div>
                    <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                      Official Marking Scheme & Section Breakdown
                    </h4>
                    <p className="text-xs text-emerald-900 mt-0.5">
                      Total Marks: <strong>{exam.totalMarks}</strong> • Passing Threshold: <strong>{exam.passingMarks}</strong> ({Math.round((exam.passingMarks / exam.totalMarks) * 100)}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION-WISE MARKS TABLE */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 uppercase font-extrabold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Section Name</th>
                      <th className="p-3.5 text-center">Questions</th>
                      <th className="p-3.5 text-center">Marks / Q</th>
                      <th className="p-3.5 text-center">Total Marks</th>
                      <th className="p-3.5">Question Type & Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {exam.marksDistribution?.sections?.map((sec, sIdx) => (
                      <tr key={sIdx} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-black text-slate-900">{sec.sectionName}</td>
                        <td className="p-3.5 text-center font-bold">{sec.questionCount}</td>
                        <td className="p-3.5 text-center font-bold">{sec.marksPerQuestion}</td>
                        <td className="p-3.5 text-center font-black text-[#f16122]">{sec.totalMarks}</td>
                        <td className="p-3.5 text-slate-600">{sec.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SCORING POLICY */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs flex items-start gap-2.5">
                <span className="text-base">⚖️</span>
                <div>
                  <span className="font-extrabold text-slate-800 block">Evaluation & Scoring Policy:</span>
                  <span className="text-slate-600 mt-0.5 block">
                    {exam.marksDistribution?.scoringPolicy || "Step marking applicable. Full working, formulas, and neatly labelled diagrams required."}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. TIMETABLE & SCHEDULE PDF TAB */}
          {activeTab === "timetable" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* UPLOADED TIMETABLE PDF BANNER */}
              <div className="bg-indigo-50/70 p-5 rounded-3xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-2xs">
                    📄
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-indigo-950">
                      {exam.timetablePdfName || `${exam.subjectName} Exam Timetable PDF`}
                    </h4>
                    <p className="text-xs text-indigo-800 mt-0.5">
                      {exam.timetablePdfUrl
                        ? "Official school examination schedule PDF uploaded by teacher. Verified and ready for download."
                        : "Official scheduled datesheet for this school examination with reporting and hall details."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenTimetablePdf}
                  disabled={isGeneratingPrint}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
                >
                  <span>⬇</span>
                  <span>{isGeneratingPrint ? "Generating PDF..." : "View / Download Timetable PDF"}</span>
                </button>
              </div>

              {/* SHIFT & TIMINGS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-2xs">
                    📅
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Examination Date</span>
                    <span className="text-sm font-black text-slate-900">
                      {exam.timetable?.examDate || exam.examDate} ({exam.timetable?.dayOfWeek || "Scheduled"})
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-2xs">
                    ⏰
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reporting to Hall</span>
                    <span className="text-sm font-black text-slate-900">
                      {exam.timetable?.reportingTime || "08:30 AM"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-2xs">
                    📖
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Question Paper Reading Time</span>
                    <span className="text-sm font-black text-slate-900">
                      {exam.timetable?.readingTime || "08:45 AM - 09:00 AM (15 Minutes)"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-2xs">
                    ✍️
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paper Writing Window</span>
                    <span className="text-sm font-black text-[#f16122]">
                      {exam.timetable?.writingTime || `${exam.startTime} - ${exam.endTime}`}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-2xs">
                    🏛️
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Examination Hall / Room</span>
                    <span className="text-sm font-black text-slate-900">
                      {exam.timetable?.hallOrPortal || "Examination Hall 1, Block A"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-2xs">
                    👨‍🏫
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chief Invigilator</span>
                    <span className="text-sm font-black text-slate-900">
                      {exam.timetable?.chiefInvigilator || exam.teacherName || "Assigned Faculty"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. QUESTION BANK (REFERENCE PDF) TAB */}
          {activeTab === "questionBank" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* UPLOADED QUESTION BANK PDF BANNER */}
              <div className="bg-teal-50/80 p-5 rounded-3xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-2xs">
                    📑
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm sm:text-base font-black text-teal-950">
                        {exam.questionBankTitle || `${exam.subjectName} Reference Question Bank PDF`}
                      </h4>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                        Reference PDF
                      </span>
                    </div>
                    <p className="text-xs text-teal-800">
                      {exam.questionBankPdfName
                        ? `Official reference question bank: ${exam.questionBankPdfName}`
                        : "Curated model practice questions, previous year question trends & sample revision material."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenQuestionBankPdf}
                  disabled={isGeneratingPrint}
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
                >
                  <span>⬇</span>
                  <span>{isGeneratingPrint ? "Generating PDF..." : "View / Download Q-Bank PDF"}</span>
                </button>
              </div>

              {/* REFERENCE STUDY MODULES PREVIEW */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Syllabus-Aligned Practice Modules & Problem Sets
                  </h5>
                  <span className="text-[11px] text-teal-700 font-bold">
                    For Student Preparation & Revision
                  </span>
                </div>

                <div className="space-y-2.5">
                  {exam.syllabus?.units?.map((unit, uIdx) => (
                    <div
                      key={uIdx}
                      className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">
                          Module {uIdx + 1}: {unit.unitName}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                          {unit.weightage} Marks Weightage
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Topics: {unit.topics?.join(", ") || "Key analytical concepts"}
                      </p>
                      <div className="mt-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                        <span>💡 Reference Tip:</span>
                        <span>Practice both 1-mark objective questions and 5-mark long derivations from {exam.syllabus?.prescribedBook || "prescribed textbook"}.</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            DCPEMS Academic Examination Portal 2026-27 • Offline Pen & Paper
          </span>
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailModal;
