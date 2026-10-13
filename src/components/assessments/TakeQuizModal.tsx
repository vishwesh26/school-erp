"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { QuizItem, submitQuizAction, QuizSubmission } from "@/lib/assessmentActions";

interface TakeQuizModalProps {
  quiz: QuizItem | null;
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  className?: string;
  rollNumber?: string;
  onSubmitted?: (submission: QuizSubmission) => void;
}

const TakeQuizModal: React.FC<TakeQuizModalProps> = ({
  quiz,
  isOpen,
  onClose,
  studentId,
  studentName,
  className,
  rollNumber,
  onSubmitted,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  // Initialize or restore if already submitted
  useEffect(() => {
    if (quiz && isOpen) {
      if (quiz.userSubmission) {
        setSubmissionResult({
          score: quiz.userSubmission.score,
          totalMarks: quiz.userSubmission.totalMarks,
          percentage: quiz.userSubmission.percentage,
          passed: quiz.userSubmission.passed,
          review: quiz.questions.map((q) => {
            const userAns = quiz.userSubmission?.answers[q.id] || "";
            const isCorrect = userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
            return {
              questionId: q.id,
              question: q.question,
              userAnswer: userAns,
              correctAnswer: q.correctAnswer,
              isCorrect,
              marksAwarded: isCorrect ? q.marks : 0,
              explanation: q.explanation,
            };
          }),
        });
      } else {
        setSelectedAnswers({});
        setSubmissionResult(null);
        setTimeLeftSeconds((quiz.durationMinutes || 30) * 60);
      }
    }
  }, [quiz, isOpen]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || submissionResult || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAnswers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, submissionResult, timeLeftSeconds]);

  if (!isOpen || !quiz) return null;

  const answeredCount = Object.keys(selectedAnswers).filter(
    (k) => selectedAnswers[k] && selectedAnswers[k].trim() !== ""
  ).length;
  const totalQuestions = quiz.questions.length;
  const progressPercent = Math.round((answeredCount / (totalQuestions || 1)) * 100);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
  };

  const handleSelectOption = (questionId: string, optionText: string) => {
    if (submissionResult) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  const handleSubmitAnswers = async () => {
    if (isSubmitting || submissionResult) return;

    setIsSubmitting(true);
    try {
      const res = await submitQuizAction({
        quizId: quiz.id,
        studentId,
        studentName,
        className,
        rollNumber,
        answers: selectedAnswers,
      });

      if (res.success && res.submission) {
        setSubmissionResult(res);
        if (onSubmitted) {
          onSubmitted(res.submission);
        }
      }
    } catch (err) {
      console.error("Submit quiz error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* HEADER */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white via-slate-50 to-[#fdece7]/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#fdece7] text-[#f16122]">
                {quiz.type}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {quiz.subjectName} • Class {quiz.className}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 line-clamp-1">
              {quiz.title}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* TIMER */}
            {!submissionResult && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-black border shadow-2xs ${
                  timeLeftSeconds < 180
                    ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
                    : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                <span>⏱</span>
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>
            )}

            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* PROGRESS BAR (IF IN PROGRESS) */}
        {!submissionResult && (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-600">
              Answered {answeredCount} of {totalQuestions} Questions
            </span>
            <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#f16122] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-black text-[#f16122]">
              {progressPercent}%
            </span>
          </div>
        )}

        {/* BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-6 flex-1">
          {/* RESULT BANNER IF SUBMITTED */}
          {submissionResult && (
            <div
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in ${
                submissionResult.passed
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                  : "bg-amber-50/80 border-amber-200 text-amber-950"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-2xs ${
                    submissionResult.passed ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                  }`}
                >
                  {submissionResult.passed ? "🎉" : "📚"}
                </div>
                <div>
                  <h4 className="text-base font-black">
                    {submissionResult.passed
                      ? "Congratulations! You Passed the Assessment"
                      : "Assessment Submitted - Needs Improvement"}
                  </h4>
                  <p className="text-xs opacity-80 mt-0.5">
                    Review your answers below with correct answers and explanations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/90 px-4 py-2 rounded-xl text-center shadow-2xs border border-white">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Score</span>
                  <span className="text-lg font-black text-slate-900">
                    {submissionResult.score} / {submissionResult.totalMarks}
                  </span>
                </div>
                <div className="bg-white/90 px-4 py-2 rounded-xl text-center shadow-2xs border border-white">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Percentage</span>
                  <span className="text-lg font-black text-[#f16122]">
                    {submissionResult.percentage}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* QUESTIONS LIST */}
          <div className="flex flex-col gap-5">
            {quiz.questions.map((q, qIndex) => {
              const selectedOpt = selectedAnswers[q.id];
              const reviewItem = submissionResult?.review?.find((r: any) => r.questionId === q.id);

              return (
                <div
                  key={q.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    reviewItem
                      ? reviewItem.isCorrect
                        ? "bg-emerald-50/30 border-emerald-200"
                        : "bg-rose-50/30 border-rose-200"
                      : "bg-white border-slate-100 shadow-xs"
                  }`}
                >
                  {/* QUESTION TOP BAR */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-black text-slate-800">
                      Question {qIndex + 1} of {totalQuestions}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold text-slate-500">
                        {q.marks} Marks
                      </span>
                      {reviewItem && (
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-md ${
                            reviewItem.isCorrect
                              ? "bg-emerald-600 text-white"
                              : "bg-rose-600 text-white"
                          }`}
                        >
                          {reviewItem.isCorrect ? `+${reviewItem.marksAwarded} Correct` : "Incorrect (0)"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PROMPT */}
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mb-3">
                    {q.question}
                  </p>

                  {/* OPTIONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const letter = ["A", "B", "C", "D"][optIdx];
                      const isSelected = selectedOpt === opt;
                      const isCorrectAnswer = reviewItem && opt.trim() === q.correctAnswer.trim();
                      const isWrongSelection = reviewItem && isSelected && !reviewItem.isCorrect;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={Boolean(submissionResult)}
                          onClick={() => handleSelectOption(q.id, opt)}
                          className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                            isCorrectAnswer
                              ? "bg-emerald-100/80 border-emerald-400 ring-2 ring-emerald-300 text-emerald-950 font-bold"
                              : isWrongSelection
                              ? "bg-rose-100/80 border-rose-400 text-rose-950 font-bold"
                              : isSelected
                              ? "bg-[#fdece7] border-[#f16122] text-[#9a3810] ring-1 ring-[#f16122]"
                              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 ${
                              isCorrectAnswer
                                ? "bg-emerald-600 text-white"
                                : isWrongSelection
                                ? "bg-rose-600 text-white"
                                : isSelected
                                ? "bg-[#f16122] text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="text-xs font-medium flex-1">
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* EXPLANATION IF REVIEW */}
                  {reviewItem && q.explanation && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      <strong className="text-slate-800">Explanation: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-semibold text-slate-500">
            {submissionResult
              ? "Assessment review completed."
              : `${answeredCount} of ${totalQuestions} selected`}
          </span>

          <div className="flex items-center gap-3">
            {submissionResult ? (
              <button
                onClick={onClose}
                type="button"
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all shadow-xs"
              >
                Close & Return
              </button>
            ) : (
              <button
                onClick={handleSubmitAnswers}
                disabled={isSubmitting}
                type="button"
                className="px-6 py-2.5 rounded-xl bg-[#f16122] hover:bg-[#d85218] text-white text-xs font-black transition-all shadow-md flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Grading Assessment...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Submit Assessment ({answeredCount}/{totalQuestions})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuizModal;
