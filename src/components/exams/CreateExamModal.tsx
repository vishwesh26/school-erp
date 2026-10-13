"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  createExamScheduleAction,
  ExamItem,
} from "@/lib/examActions";
import { getAssessmentFormData } from "@/lib/assessmentActions";

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (exam: ExamItem) => void;
  teacherName?: string;
}

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
  const [hallNumber, setHallNumber] = useState("Exam Hall 2, Block A");
  const [totalMarks, setTotalMarks] = useState(80);
  const [passingMarks, setPassingMarks] = useState(28);

  // Syllabus & Pattern & Q-Bank
  const [syllabusUnitsText, setSyllabusUnitsText] = useState(
    "Unit 1: Number Systems & Rational Numbers\nUnit 2: Linear Equations & Word Problems\nUnit 3: Quadrilaterals & Geometry\nUnit 4: Squares, Roots & Exponents"
  );
  const [prescribedBook, setPrescribedBook] = useState("NCERT Textbook & Exemplar Problems");
  const [questionBankTitle, setQuestionBankTitle] = useState("");
  const [sampleQuestionsText, setSampleQuestionsText] = useState(
    "Solve the equation with rational exponents and verify your answer.\nState the properties of regular polygons with proof.\nSolve the word problem on rate and proportions."
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Please enter an exam title.");
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
        hallNumber,
        totalMarks: Number(totalMarks) || 80,
        passingMarks: Number(passingMarks) || 28,
        syllabusUnitsText,
        prescribedBook,
        questionBankTitle: questionBankTitle.trim() || `${chosenSubject?.name || "Subject"} Official Question Bank 2026`,
        sampleQuestionsText,
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
                Schedule New Exam & Resources
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Add Exam Timetable, Prescribed Syllabus, Question Pattern & Question Bank PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
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

          {/* BASIC METRICS */}
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
                Writing Time (Start & End)
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
                Reporting Time & Venue
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="08:30 AM"
                  value={reportingTime}
                  onChange={(e) => setReportingTime(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="Exam Hall 2, Block A"
                  value={hallNumber}
                  onChange={(e) => setHallNumber(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Max Marks & Passing Marks
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

            {/* SYLLABUS SECTION */}
            <div className="sm:col-span-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                📖 Prescribed Syllabus Units (One unit per line)
              </label>
              <textarea
                rows={3}
                placeholder="Unit 1: Title&#10;Unit 2: Title"
                value={syllabusUnitsText}
                onChange={(e) => setSyllabusUnitsText(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
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

            {/* QUESTION BANK SECTION */}
            <div className="sm:col-span-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                📑 Question Bank Title & Sample Model Questions (One question per line)
              </label>
              <input
                type="text"
                placeholder="Question Bank Document Title (Optional)"
                value={questionBankTitle}
                onChange={(e) => setQuestionBankTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold mb-2"
              />
              <textarea
                rows={3}
                placeholder="Question 1&#10;Question 2&#10;Question 3"
                value={sampleQuestionsText}
                onChange={(e) => setSampleQuestionsText(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#4e282c] hover:bg-[#3d1f23] text-white text-xs font-black shadow-md flex items-center gap-2"
            >
              {isSubmitting ? "Publishing Schedule..." : "Schedule Exam & Resources"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;
