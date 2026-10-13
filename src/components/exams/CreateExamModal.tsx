"use client";

import React, { useState, useEffect } from "react";
import {
  createExamScheduleAction,
  ExamItem,
  MarksDistributionSection,
} from "@/lib/examActions";
import { getAssessmentFormData } from "@/lib/assessmentActions";

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (exam: ExamItem) => void;
  teacherName?: string;
}

const DEFAULT_SECTIONS: MarksDistributionSection[] = [
  {
    sectionName: "Section A (Objective & MCQs)",
    questionCount: 20,
    marksPerQuestion: 1,
    totalMarks: 20,
    description: "Objective MCQs and one-word questions on paper.",
  },
  {
    sectionName: "Section B (Short Answer)",
    questionCount: 6,
    marksPerQuestion: 3,
    totalMarks: 18,
    description: "Short calculation and descriptive steps (30-50 words).",
  },
  {
    sectionName: "Section C (Long Answer)",
    questionCount: 4,
    marksPerQuestion: 6,
    totalMarks: 24,
    description: "In-depth analytical and problem solving questions.",
  },
  {
    sectionName: "Section D (Case-Based / Applied)",
    questionCount: 3,
    marksPerQuestion: 6,
    totalMarks: 18,
    description: "Contextual application questions with internal choice.",
  },
];

const CreateExamModal: React.FC<CreateExamModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  teacherName,
}) => {
  const [classes, setClasses] = useState<Array<{ id: number; name: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: number; name: string }>>([]);

  const [title, setTitle] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [reportingTime, setReportingTime] = useState("08:30 AM");
  const [duration, setDuration] = useState("3 Hours (180 mins)");
  const [hallOrPortal, setHallOrPortal] = useState("Examination Hall 1, Block A");
  const [totalMarks, setTotalMarks] = useState(80);
  const [passingMarks, setPassingMarks] = useState(28);

  // Timetable PDF upload state
  const [timetablePdfUrl, setTimetablePdfUrl] = useState<string | null>(null);
  const [timetablePdfName, setTimetablePdfName] = useState<string | null>(null);
  const [timetablePdfSize, setTimetablePdfSize] = useState<string | null>(null);

  // Question Bank Reference PDF upload state
  const [questionBankPdfUrl, setQuestionBankPdfUrl] = useState<string | null>(null);
  const [questionBankPdfName, setQuestionBankPdfName] = useState<string | null>(null);
  const [questionBankPdfSize, setQuestionBankPdfSize] = useState<string | null>(null);
  const [questionBankTitle, setQuestionBankTitle] = useState("");

  // Syllabus
  const [syllabusUnitsText, setSyllabusUnitsText] = useState(
    "Unit 1: Number Systems & Rational Numbers\nUnit 2: Linear Equations & Word Problems\nUnit 3: Quadrilaterals & Geometry\nUnit 4: Squares, Roots & Exponents"
  );
  const [prescribedBook, setPrescribedBook] = useState("NCERT Textbook & Exemplar Problems");
  const [generalInstructions, setGeneralInstructions] = useState(
    "Offline pen-and-paper examination conducted in the school exam hall. Printed question paper and answer booklet will be provided."
  );

  // Exam Paper Pattern (Offline conduct)
  const [sectionsSummary, setSectionsSummary] = useState(
    "Physical Question Paper divided into 4 Sections: Objective MCQs (20 Qs), Short Answer (6 Qs), Long Answer (4 Qs), and Applied Cases (3 Qs)."
  );
  const [examHallInstructionsText, setExamHallInstructionsText] = useState(
    "Report to the assigned examination hall 15 minutes before start time (08:45 AM).\nMandatory 15-minute question paper reading time before writing begins.\nWrite answers only using blue or black ballpoint pen on the answer booklet.\nSchool ID card and admit card must be visibly displayed on desk.\nElectronic devices, smartwatches, and unauthorized notes are strictly prohibited."
  );

  // Marks Distribution
  const [marksSections, setMarksSections] = useState<MarksDistributionSection[]>(DEFAULT_SECTIONS);
  const [scoringPolicy, setScoringPolicy] = useState(
    "Step-wise marking scheme. Full working, formulas, and neatly labelled diagrams required."
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getAssessmentFormData().then((data) => {
        setClasses(data.classes);
        setSubjects(data.subjects);
        if (data.classes.length > 0 && !selectedClassId) {
          setSelectedClassId(String(data.classes[0].id));
        }
        if (data.subjects.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(String(data.subjects[0].id));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Timetable PDF file selection
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please upload a valid PDF file (.pdf).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("PDF file size must be less than 10MB.");
      return;
    }

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setTimetablePdfName(file.name);
    setTimetablePdfSize(sizeStr);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setTimetablePdfUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = () => {
    setTimetablePdfUrl(null);
    setTimetablePdfName(null);
    setTimetablePdfSize(null);
  };

  // Handle Question Bank Reference PDF file selection
  const handleQbPdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please upload a valid PDF file for the Question Bank (.pdf).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Question Bank PDF file size must be less than 10MB.");
      return;
    }

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setQuestionBankPdfName(file.name);
    setQuestionBankPdfSize(sizeStr);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setQuestionBankPdfUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQbPdf = () => {
    setQuestionBankPdfUrl(null);
    setQuestionBankPdfName(null);
    setQuestionBankPdfSize(null);
  };

  // Section modifiers
  const handleSectionChange = (
    index: number,
    field: keyof MarksDistributionSection,
    value: any
  ) => {
    setMarksSections((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };
      if (field === "questionCount" || field === "marksPerQuestion") {
        target.totalMarks = Number(target.questionCount) * Number(target.marksPerQuestion);
      }
      updated[index] = target;
      return updated;
    });
  };

  const handleAddSection = () => {
    setMarksSections((prev) => [
      ...prev,
      {
        sectionName: `Section ${String.fromCharCode(65 + prev.length)}`,
        questionCount: 5,
        marksPerQuestion: 2,
        totalMarks: 10,
        description: "Descriptive questions.",
      },
    ]);
  };

  const handleRemoveSection = (index: number) => {
    if (marksSections.length <= 1) return;
    setMarksSections((prev) => prev.filter((_, i) => i !== index));
  };

  const calculatedTotalMarks = marksSections.reduce((sum, s) => sum + (Number(s.totalMarks) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Please enter an examination title.");
      return;
    }
    if (!selectedClassId) {
      setErrorMsg("Please select a target class.");
      return;
    }
    if (!selectedSubjectId) {
      setErrorMsg("Please select a subject.");
      return;
    }

    setIsSubmitting(true);
    try {
      const chosenClass = classes.find((c) => String(c.id) === selectedClassId);
      const chosenSubject = subjects.find((s) => String(s.id) === selectedSubjectId);

      const res = await createExamScheduleAction({
        title: title.trim(),
        classId: selectedClassId,
        className: chosenClass ? chosenClass.name : "General",
        subjectId: selectedSubjectId,
        subjectName: chosenSubject ? chosenSubject.name : "General",
        teacherName: teacherName || "Faculty Member",
        examDate,
        startTime,
        endTime,
        reportingTime,
        duration,
        hallOrPortal,
        totalMarks: Number(totalMarks) || 80,
        passingMarks: Number(passingMarks) || 28,
        examMode: "Offline",
        // PDF Timetable
        timetablePdfUrl: timetablePdfUrl || undefined,
        timetablePdfName: timetablePdfName || undefined,
        // Question Bank PDF for Reference
        questionBankPdfUrl: questionBankPdfUrl || undefined,
        questionBankPdfName: questionBankPdfName || undefined,
        questionBankTitle: questionBankTitle.trim() || (chosenSubject ? `${chosenSubject.name} Reference Question Bank` : undefined),
        // Syllabus
        syllabusUnitsText,
        prescribedBook,
        generalInstructions,
        // Offline Paper Pattern & Exam Hall Guidelines
        sectionsSummary,
        examHallInstructionsText,
        // Marks Distribution / Marking Scheme
        marksSections,
        scoringPolicy,
      });

      if (res.success && res.exam) {
        onSuccess(res.exam);
        onClose();
      } else {
        setErrorMsg(res.error || "Failed to schedule exam.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white via-slate-50 to-[#fdece7]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4e282c] text-white flex items-center justify-center flex-shrink-0 shadow-2xs font-black">
              📋
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Schedule School Exam & Upload Resources
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Upload Timetable PDF & Reference Question Bank for Offline Pen-and-Paper Examination
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. PDF UPLOADS ROW: TIMETABLE PDF + REFERENCE QUESTION BANK PDF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TIMETABLE SCHEDULE PDF UPLOAD BLOCK */}
            <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/40 p-4 rounded-2xl border border-indigo-200/80 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📄</span>
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                      Exam Timetable PDF
                    </h4>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                    Schedule
                  </span>
                </div>
                <p className="text-[11px] text-indigo-800">
                  Official school exam schedule & datesheet document
                </p>
              </div>

              {timetablePdfName ? (
                <div className="bg-white p-3 rounded-xl border border-indigo-200 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                      PDF
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {timetablePdfName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {timetablePdfSize || "Ready"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePdf}
                    className="px-2 py-1 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-white/70 hover:bg-white rounded-xl p-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-center">
                  <span className="text-xl">📤</span>
                  <span className="text-xs font-bold text-indigo-900">
                    Upload Timetable PDF
                  </span>
                  <span className="text-[9px] text-slate-400">
                    School Datesheet (.pdf, Max 10MB)
                  </span>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handlePdfFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* REFERENCE QUESTION BANK PDF UPLOAD BLOCK */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 p-4 rounded-2xl border border-emerald-200/80 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📑</span>
                    <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                      Question Bank PDF (Reference)
                    </h4>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Reference
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Model practice questions for student revision
                </p>
              </div>

              {questionBankPdfName ? (
                <div className="bg-white p-3 rounded-xl border border-emerald-200 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                      PDF
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {questionBankPdfName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {questionBankPdfSize || "Ready"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveQbPdf}
                    className="px-2 py-1 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white/70 hover:bg-white rounded-xl p-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-center">
                  <span className="text-xl">📥</span>
                  <span className="text-xs font-bold text-emerald-900">
                    Upload Question Bank PDF
                  </span>
                  <span className="text-[9px] text-slate-400">
                    Reference & Model Practice (.pdf)
                  </span>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleQbPdfFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* OPTIONAL QUESTION BANK TITLE */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Reference Question Bank Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Official Model Practice & Revision Question Bank 2026-27"
              value={questionBankTitle}
              onChange={(e) => setQuestionBankTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden"
            />
          </div>

          {/* 2. BASIC EXAM METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Examination Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mid-Term Examination - Mathematics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#4e282c] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Class *
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#4e282c] focus:outline-hidden"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Class {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Subject *
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#4e282c] focus:outline-hidden"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Exam Date *
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="3 Hours (180 mins)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Paper Writing Hours (Start & End)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Reporting Time & Exam Hall / Room
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Report: 08:30 AM"
                  value={reportingTime}
                  onChange={(e) => setReportingTime(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="Exam Hall 1, Block A"
                  value={hallOrPortal}
                  onChange={(e) => setHallOrPortal(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Total Marks & Passing Marks
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="80"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
                <input
                  type="number"
                  placeholder="28"
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(Number(e.target.value))}
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* 3. EXAM PAPER PATTERN (OFFLINE QUESTION PAPER CONDUCT) */}
          <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>📋</span>
                <span>Question Paper Pattern & Layout</span>
              </label>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                Offline (Pen & Paper)
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Question Paper Structure Summary
              </label>
              <input
                type="text"
                value={sectionsSummary}
                onChange={(e) => setSectionsSummary(e.target.value)}
                placeholder="e.g. Physical Question Paper divided into 4 Sections: Objective MCQs (20 Qs), Short Answer (6 Qs), Long Answer (4 Qs), and Applied Cases (3 Qs)."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Exam Hall Guidelines & Stationery Instructions (One per line)
              </label>
              <textarea
                rows={3}
                value={examHallInstructionsText}
                onChange={(e) => setExamHallInstructionsText(e.target.value)}
                placeholder="Rule 1&#10;Rule 2&#10;Rule 3"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 4. MARKING SCHEME / MARKS DISTRIBUTION */}
          <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>🎯</span>
                <span>Marking Scheme & Section Breakdown</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  Total: <strong className={calculatedTotalMarks === totalMarks ? "text-emerald-600" : "text-amber-600"}>{calculatedTotalMarks}</strong> / {totalMarks}
                </span>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-black transition-colors cursor-pointer"
                >
                  + Add Section
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {marksSections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Section Name"
                      value={sec.sectionName}
                      onChange={(e) => handleSectionChange(idx, "sectionName", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      placeholder="Questions"
                      value={sec.questionCount}
                      onChange={(e) => handleSectionChange(idx, "questionCount", Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                      title="Number of Questions"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      placeholder="Marks each"
                      value={sec.marksPerQuestion}
                      onChange={(e) => handleSectionChange(idx, "marksPerQuestion", Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                      title="Marks Per Question"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Description"
                      value={sec.description}
                      onChange={(e) => handleSectionChange(idx, "description", e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                    />
                  </div>
                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(idx)}
                      disabled={marksSections.length <= 1}
                      className="text-xs text-rose-500 hover:text-rose-700 disabled:opacity-30 font-bold p-1 cursor-pointer"
                      title="Remove Section"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Evaluation & Marking Policy
              </label>
              <input
                type="text"
                value={scoringPolicy}
                onChange={(e) => setScoringPolicy(e.target.value)}
                placeholder="Step-wise marking scheme. Full working and diagrams must be shown."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          {/* 5. PRESCRIBED SYLLABUS SECTION */}
          <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block flex items-center gap-2">
              <span>📖</span>
              <span>Prescribed Syllabus Units (One unit per line)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Unit 1: Title&#10;Unit 2: Title"
              value={syllabusUnitsText}
              onChange={(e) => setSyllabusUnitsText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Prescribed Book & References
                </label>
                <input
                  type="text"
                  value={prescribedBook}
                  onChange={(e) => setPrescribedBook(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Syllabus Coverage Note
                </label>
                <input
                  type="text"
                  value={generalInstructions}
                  onChange={(e) => setGeneralInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#4e282c] hover:bg-[#3d1f23] text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? "Publishing Schedule..." : "Publish Exam & Timetable"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;
