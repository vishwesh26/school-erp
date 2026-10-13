"use client";

import React from "react";
import StudentAttendanceCalendarView from "./StudentAttendanceCalendarView";

interface StudentAttendanceCalendarModalProps {
    studentId: string;
    studentName?: string;
    className?: string;
    rollNumber?: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function StudentAttendanceCalendarModal({
    studentId,
    studentName,
    className,
    rollNumber,
    isOpen,
    onClose,
}: StudentAttendanceCalendarModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
                <StudentAttendanceCalendarView
                    studentId={studentId}
                    studentName={studentName}
                    className={className}
                    rollNumber={rollNumber}
                    onClose={onClose}
                    isModal={true}
                />
            </div>
        </div>
    );
}
