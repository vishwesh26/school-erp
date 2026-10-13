"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  createQuizAction,
  getAssessmentFormData,
  QuizQuestion,
  QuizItem,
} from "@/lib/assessmentActions";

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (quiz: QuizItem) => void;
  teacherId?: string;
  teacherName?: string;
}

interface QuestionDraft {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  marks: number;
  explanation: string;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  teacherId,
  teacherName,
}) => {
  const [classes, setClasses] = useState<Array<{ id: number; name: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: number; name: string }>>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [assessmentType, setAssessmentType] = useState<"Quiz" | "MCQ Quiz" | "Unit Test" | "Assessment">("MCQ Quiz");
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("10:45");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passingMarks, setPassingMarks] = useState(8);

  // Questions
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: "q-1",
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      marks: 5,
      explanation: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load classes and subjects
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

  const totalCalculatedMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        marks: 5,
        explanation: "",
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, val: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index].question = val;
      return copy;
    });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const optCopy = [...copy[qIndex].options] as [string, string, string, string];
      optCopy[optIndex] = val;
      copy[qIndex].options = optCopy;
      return copy;
    });
  };

  const handleCorrectIndexChange = (qIndex: number, correctIdx: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].correctIndex = correctIdx;
      return copy;
    });
  };

  const handleMarksChange = (qIndex: number, val: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].marks = val;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Please enter a title for this assessment.");
      return;
    }
    if (!selectedClassId) {
      setErrorMessage("Please select a target class.");
      return;
    }
    if (!selectedSubjectId) {
      setErrorMessage("Please select a subject.");
      return;
    }
    if (!scheduledDate) {
      setErrorMessage("Please choose a scheduled date.");
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setErrorMessage(`Question ${i + 1} cannot be empty.`);
        return;
      }
      const validOptions = q.options.filter((o) => o.trim() !== "");
      if (validOptions.length < 2) {
        setErrorMessage(`Question ${i + 1} must have at least 2 non-empty options.`);
        return;
      }
      if (!q.options[q.correctIndex] || !q.options[q.correctIndex].trim()) {
        setErrorMessage(`Question ${i + 1} has an empty option marked as correct answer.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const chosenClass = classes.find((c) => String(c.id) === selectedClassId);
      const chosenSubject = subjects.find((s) => String(s.id) === selectedSubjectId);

      const formattedQuestions: QuizQuestion[] = questions.map((q, idx) => ({
        id: `q-${idx + 1}-${Date.now()}`,
        question: q.question.trim(),
        options: q.options.filter((o) => o.trim() !== ""),
        correctAnswer: q.options[q.correctIndex].trim(),
        marks: Number(q.marks) || 5,
        explanation: q.explanation.trim() || undefined,
      }));

      const res = await createQuizAction({
        title: title.trim(),
        description: description.trim(),
        classId: selectedClassId,
        className: chosenClass ? chosenClass.name : "General",
        subjectId: selectedSubjectId,
        subjectName: chosenSubject ? chosenSubject.name : "General",
        teacherId: teacherId || "teacher-1",
        teacherName: teacherName || "Faculty",
        scheduledDate,
        startTime,
        endTime,
        durationMinutes: Number(durationMinutes) || 30,
        totalMarks: totalCalculatedMarks,
        passingMarks: Number(passingMarks) || Math.ceil(totalCalculatedMarks * 0.4),
        type: assessmentType,
        questions: formattedQuestions,
      });

      if (res.success && res.quiz) {
        onSuccess(res.quiz);
        onClose();
      } else {
        setErrorMessage(res.error || "Failed to create quiz.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white via-slate-50 to-[#fdece7]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fdece7] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Image src="/exam.png" alt="" width={22} height={22} className="w-5 h-5 object-contain" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Create New Assessment / Quiz
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Set quiz schedule, target class, timer, and multiple-choice questions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-all"
          >
            ✕
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-6 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SECTION 1: GENERAL INFO */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              1. Assessment Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Assessment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3: Photosynthesis & Respiration Test"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#f16122] focus:ring-2 focus:ring-[#f16122]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Class *
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#f16122]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#f16122]"
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
                  Assessment Type
                </label>
                <select
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#f16122]"
                >
                  <option value="MCQ Quiz">MCQ Quiz</option>
                  <option value="Quiz">Quick Quiz</option>
                  <option value="Unit Test">Unit Test</option>
                  <option value="Assessment">Formal Assessment</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#f16122]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Start Time & End Time
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Duration (Minutes)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-1/2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900"
                  />
                  <div className="w-1/2">
                    <span className="text-[10px] text-slate-400 block font-bold">Passing Marks:</span>
                    <input
                      type="number"
                      min="1"
                      value={passingMarks}
                      onChange={(e) => setPassingMarks(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Instructions / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Read each question carefully. Each question carries 5 marks. No negative marking."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:border-[#f16122]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: QUESTIONS BUILDER */}
          <div className="flex flex-col gap-4 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  2. Questions Builder ({questions.length} Questions • {totalCalculatedMarks} Total Marks)
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Select the radio button beside the correct option for automated evaluation.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3.5 py-1.5 rounded-xl bg-[#fdece7] hover:bg-[#f16122] text-[#f16122] hover:text-white text-xs font-black transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>+</span> Add Question
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 flex flex-col gap-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">
                      Question {qIndex + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-slate-500">Marks:</span>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={q.marks}
                          onChange={(e) => handleMarksChange(qIndex, Number(e.target.value))}
                          className="w-14 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-center bg-white"
                        />
                      </div>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIndex)}
                          className="text-xs text-rose-500 hover:text-rose-700 font-bold p-1 rounded-md"
                          title="Delete this question"
                        >
                          ✕ Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter question prompt here..."
                    value={q.question}
                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:outline-hidden focus:border-[#f16122]"
                  />

                  {/* Options (A, B, C, D) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {q.options.map((opt, optIndex) => {
                      const letter = ["A", "B", "C", "D"][optIndex];
                      const isCorrect = q.correctIndex === optIndex;

                      return (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                            isCorrect
                              ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={isCorrect}
                              onChange={() => handleCorrectIndexChange(qIndex, optIndex)}
                              className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                            />
                            <span
                              className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                                isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {letter}
                            </span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={`Option ${letter}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                            className="w-full bg-transparent text-xs font-medium text-slate-900 focus:outline-hidden"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#f16122] text-slate-600 hover:text-[#f16122] text-xs font-extrabold transition-colors flex items-center justify-center gap-2 bg-white"
            >
              <span>+</span> Add Another Question
            </button>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#f16122] hover:bg-[#d85218] text-white text-xs font-black shadow-md transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing Quiz...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Publish Assessment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuizModal;
