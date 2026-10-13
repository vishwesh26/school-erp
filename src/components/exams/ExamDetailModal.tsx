"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ExamItem } from "@/lib/examActions";

interface ExamDetailModalProps {
  exam: ExamItem | null;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "syllabus" | "pattern" | "timetable" | "questionBank";
}

const ExamDetailModal: React.FC<ExamDetailModalProps> = ({
  exam,
  isOpen,
  onClose,
  defaultTab = "syllabus",
}) => {
  const [activeTab, setActiveTab] = useState<"syllabus" | "pattern" | "timetable" | "questionBank">(defaultTab);
  const [isDownloading, setIsDownloading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen || !exam) return null;

  const handleDownloadPdf = () => {
    setIsDownloading(true);

    // Create a clean printable window containing the Question Bank and Exam details
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${exam.title} - Question Bank & Syllabus</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 3px solid #4e282c; padding-bottom: 20px; margin-bottom: 25px; }
            .school-name { font-size: 24px; font-weight: 900; color: #4e282c; text-transform: uppercase; margin: 0; }
            .sub-title { font-size: 14px; color: #f16122; font-weight: 700; margin-top: 5px; }
            .exam-title { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 15px; }
            .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; font-size: 13px; }
            .section-title { font-size: 16px; font-weight: 800; color: #4e282c; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px; text-transform: uppercase; }
            .question-item { margin-bottom: 15px; padding-left: 10px; border-left: 3px solid #f16122; }
            .pattern-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            .pattern-table th, .pattern-table td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
            .pattern-table th { background: #f1f5f9; font-weight: 700; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="school-name">DCPEMS Examination Board</h1>
            <div class="sub-title">OFFICIAL QUESTION BANK & SYLLABUS DIRECTORY 2026-27</div>
            <div class="exam-title">${exam.title}</div>
          </div>

          <div class="meta-grid">
            <div><strong>Subject:</strong> ${exam.subjectName}</div>
            <div><strong>Class:</strong> ${exam.className}</div>
            <div><strong>Exam Date:</strong> ${exam.examDate}</div>
            <div><strong>Duration:</strong> ${exam.duration}</div>
            <div><strong>Max Marks:</strong> ${exam.totalMarks}</div>
            <div><strong>Hall / Venue:</strong> ${exam.timetable?.hallNumber || "Main Hall"}</div>
          </div>

          <div class="section-title">I. Prescribed Examination Syllabus</div>
          <ul>
            ${exam.syllabus.units.map(u => `<li><strong>${u.unitName} (${u.weightage} Marks):</strong> ${u.topics.join(", ")}</li>`).join("")}
          </ul>
          <p><strong>Prescribed Book:</strong> ${exam.syllabus.prescribedBook || "Standard Textbook"}</p>

          <div class="section-title">II. Question Paper Pattern & Blue-Print</div>
          <table class="pattern-table">
            <thead>
              <tr>
                <th>Section</th>
                <th>Questions</th>
                <th>Marks Each</th>
                <th>Total Marks</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${exam.pattern.sections.map(s => `
                <tr>
                  <td><strong>${s.sectionName}</strong></td>
                  <td>${s.questionCount}</td>
                  <td>${s.marksPerQuestion}</td>
                  <td>${s.totalMarks}</td>
                  <td>${s.description}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="section-title">III. Curated Model Question Bank</div>
          <ol>
            ${exam.questionBank.sampleQuestions.map(q => `<li class="question-item">${q}</li>`).join("")}
          </ol>

          <div class="footer">
            Generated from DCPEMS School ERP Portal • Confidential Examination Material • Strictly for Academic Preparation
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
      setIsDownloading(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-slate-50 to-[#fdece7]/30">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-[#FEFCE8] text-[#854d0e] border border-amber-200">
                {exam.subjectName}
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                Class {exam.className}
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                📅 {exam.examDate}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {exam.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Hall: {exam.timetable?.hallNumber || exam.hallNumber || "Main Hall"} • Duration: {exam.duration} • Total Marks: {exam.totalMarks}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleDownloadPdf}
              type="button"
              disabled={isDownloading}
              className="px-4 py-2 rounded-xl bg-[#f16122] hover:bg-[#d85218] text-white text-xs font-black shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>📑</span>
              <span>{isDownloading ? "Preparing PDF..." : "Download Question Bank PDF"}</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-all"
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
            className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
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
            className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "pattern"
                ? "border-[#f16122] text-[#f16122] bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📋</span>
            <span>Question Paper Pattern</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              {exam.pattern?.sections?.length || 0} Sections
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("timetable")}
            className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "timetable"
                ? "border-indigo-600 text-indigo-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>⏰</span>
            <span>Exam Timetable & Shifts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("questionBank")}
            className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "questionBank"
                ? "border-emerald-600 text-emerald-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📑</span>
            <span>Questions Bank - PDF</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              PDF
            </span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* 1. SYLLABUS TAB */}
          {activeTab === "syllabus" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="bg-[#FEFCE8]/60 p-4 rounded-2xl border border-amber-200/80 flex items-start gap-3">
                <span className="text-xl">📚</span>
                <div>
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">
                    Prescribed Syllabus & Topics Covered
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Prescribed Book: <strong>{exam.syllabus?.prescribedBook || "Standard NCERT Textbook"}</strong>
                  </p>
                  {exam.syllabus?.generalInstructions && (
                    <p className="text-[11px] text-amber-700 mt-1 italic">
                      Note: {exam.syllabus.generalInstructions}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {exam.syllabus?.units?.map((unit, uIdx) => (
                  <div
                    key={uIdx}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col gap-2"
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

          {/* 2. EXAM PATTERN TAB */}
          {activeTab === "pattern" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📋</span>
                  <div>
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wide">
                      Question Paper Blueprint & Marking Scheme
                    </h4>
                    <p className="text-xs text-indigo-700 mt-0.5">
                      Total Questions: <strong>{exam.pattern?.totalQuestions || 35}</strong> • Maximum Marks: <strong>{exam.totalMarks}</strong> • Passing Threshold: <strong>{exam.passingMarks}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 uppercase font-extrabold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Section</th>
                      <th className="p-3.5">Questions Count</th>
                      <th className="p-3.5">Marks Per Question</th>
                      <th className="p-3.5">Total Marks</th>
                      <th className="p-3.5">Description & Question Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {exam.pattern?.sections?.map((sec, sIdx) => (
                      <tr key={sIdx} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-black text-slate-900">{sec.sectionName}</td>
                        <td className="p-3.5 font-bold">{sec.questionCount} Questions</td>
                        <td className="p-3.5 font-bold">{sec.marksPerQuestion} Marks</td>
                        <td className="p-3.5 font-black text-[#f16122]">{sec.totalMarks} Marks</td>
                        <td className="p-3.5 text-slate-600">{sec.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. TIMETABLE TAB */}
          {activeTab === "timetable" && (
            <div className="flex flex-col gap-4 animate-fade-in">
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
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reporting Time</span>
                    <span className="text-sm font-black text-slate-900">
                      {exam.timetable?.reportingTime || exam.reportingTime || "08:30 AM"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-2xs">
                    📖
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Question Paper Reading</span>
                    <span className="text-sm font-black text-slate-900">
                      {exam.timetable?.readingTime || "08:45 AM - 09:00 AM (15 Mins)"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-2xs">
                    ✍️
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Writing Time & Hours</span>
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
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Exam Hall / Venue</span>
                    <span className="text-sm font-black text-slate-900">
                      {exam.timetable?.hallNumber || exam.hallNumber || "Exam Hall 2, Block A"}
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

          {/* 4. QUESTIONS BANK - PDF TAB */}
          {activeTab === "questionBank" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-2xs">
                    📑
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-emerald-950">
                      {exam.questionBank?.title || `${exam.subjectName} Official Model Question Bank`}
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Curated sample papers, previous year questions, and step-by-step scoring guide • {exam.questionBank?.fileSize || "2.5 MB PDF"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <span>⬇</span>
                  <span>{isDownloading ? "Generating PDF..." : "Download Question Bank PDF"}</span>
                </button>
              </div>

              {/* SAMPLE QUESTIONS PREVIEW */}
              <div className="flex flex-col gap-2.5">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Question Bank Preview & Practice Problems
                </h5>

                <div className="flex flex-col gap-2.5">
                  {exam.questionBank?.sampleQuestions?.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center flex-shrink-0">
                        {qIdx + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                        {q}
                      </p>
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
            DCPEMS Examination Portal 2026-27
          </span>
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailModal;
