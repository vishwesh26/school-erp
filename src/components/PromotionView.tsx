"use client";

import { useState, useEffect } from "react";
import { getStudentsForPromotion, promoteStudents, createAcademicYear } from "@/lib/promotionActions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface PromotionViewProps {
    academicYears: any[];
    grades: any[];
    classes: any[];
}

const PromotionView = ({ academicYears, grades, classes }: PromotionViewProps) => {
    const [sourceYear, setSourceYear] = useState<string>("");
    const [destYear, setDestYear] = useState<string>("");
    const [sourceClass, setSourceClass] = useState<string>("");
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showYearModal, setShowYearModal] = useState(false);

    // New Year Form State
    const [newYearName, setNewYearName] = useState("");
    const [newYearStart, setNewYearStart] = useState("");
    const [newYearEnd, setNewYearEnd] = useState("");

    const router = useRouter();

    const handleCreateYear = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        const { error } = await createAcademicYear({
            name: newYearName,
            startDate: newYearStart,
            endDate: newYearEnd,
            isCurrent: false
        });

        if (error) {
            toast.error("Failed to create academic year");
        } else {
            toast.success("Academic year created!");
            setShowYearModal(false);
            setNewYearName("");
            setNewYearStart("");
            setNewYearEnd("");
            router.refresh();
        }
        setProcessing(false);
    };

    // Fetch students when filters change
    useEffect(() => {
        const fetchStudents = async () => {
            if (sourceYear && sourceClass) {
                setLoading(true);
                const classId = sourceClass === "all" ? undefined : parseInt(sourceClass);
                const { data, error } = await getStudentsForPromotion(parseInt(sourceYear), classId);
                if (error) {
                    toast.error("Failed to fetch students");
                } else {
                    // Map students with default destination data
                    const mapped = (data || []).map((record: any) => {
                        const currentClass = classes.find(c => c.id === record.classId);
                        // Fallback to Grade ID from Class if record.gradeId is null
                        const resolvedGradeId = record.gradeId || currentClass?.gradeId;
                        const currentGrade = grades.find(g => g.id === resolvedGradeId);
                        const nextGrade = grades.find(g => g.level === (currentGrade?.level + 1));

                        // Auto-find class in next grade with same division suffix
                        const currentClassName = currentClass?.name || "";
                        const divisionSuffix = currentClassName.replace(currentGrade?.level?.toString() || "", "");

                        const nextClassNamePattern = nextGrade ? `${nextGrade.level}${divisionSuffix}` : "";
                        const nextClass = classes.find(c => c.name === nextClassNamePattern && c.gradeId === nextGrade?.id);

                        // Handle roll number change (e.g. 7B-001 -> 8B-001)
                        const currentRoll = record.Student.rollNumber || "";
                        const nextRoll = nextClassNamePattern && currentRoll.includes("-")
                            ? `${nextClassNamePattern}-${currentRoll.split("-")[1]}`
                            : currentRoll;

                        // Handle username change (library card number)
                        const nextUsername = nextClass ? `${nextClass.name}-${currentRoll}` : record.Student.username;

                        return {
                            studentId: record.Student.id,
                            name: `${record.Student.name} ${record.Student.surname}`,
                            rollNumber: currentRoll,
                            username: record.Student.username,
                            currentGradeId: resolvedGradeId,
                            currentClassId: record.classId,
                            status: nextGrade ? 'Promoted' : 'Passed Out',
                            nextGradeId: nextGrade?.id || null,
                            nextClassId: nextClass?.id || "",
                            nextRollNumber: nextRoll,
                            nextUsername: nextUsername,
                            remarks: ""
                        };
                    });
                    setStudents(mapped);
                }
                setLoading(false);
            } else {
                setStudents([]);
            }
        };
        fetchStudents();
    }, [sourceYear, sourceClass, grades, classes]);

    const handleStatusChange = (studentId: string, status: string) => {
        setStudents(prev => prev.map(s => {
            if (s.studentId === studentId) {
                const currentClass = classes.find(c => c.id === s.currentClassId);
                const resolvedGradeId = s.currentGradeId || currentClass?.gradeId;
                const currentGrade = grades.find(g => g.id === resolvedGradeId);
                const divisionSuffix = currentClass?.name.replace(currentGrade?.level.toString() || "", "") || "";

                let nextGradeId = s.nextGradeId;
                let nextClassId = s.nextClassId;
                let nextRollNumber = s.nextRollNumber;
                let nextUsername = s.nextUsername;

                if (status === 'Repeat') {
                    nextGradeId = resolvedGradeId;
                    nextClassId = s.currentClassId;
                    nextRollNumber = s.rollNumber;
                    nextUsername = s.username;
                } else if (status === 'Promoted') {
                    const nextGrade = grades.find(g => g.level === (currentGrade?.level + 1));
                    nextGradeId = nextGrade?.id || null;

                    const nextClassNamePattern = nextGrade ? `${nextGrade.level}${divisionSuffix}` : "";
                    const nextClass = classes.find(c => c.name === nextClassNamePattern && c.gradeId === nextGrade?.id);
                    nextClassId = nextClass?.id || "";

                    nextRollNumber = nextClassNamePattern && s.rollNumber.includes("-")
                        ? `${nextClassNamePattern}-${s.rollNumber.split("-")[1]}`
                        : s.rollNumber;

                    nextUsername = nextClass ? `${nextClass.name}-${s.rollNumber}` : s.username;
                } else {
                    nextGradeId = null;
                    nextClassId = "";
                    nextRollNumber = null;
                    nextUsername = null;
                }
                return { ...s, status, nextGradeId, nextClassId, nextRollNumber, nextUsername, currentGradeId: resolvedGradeId };
            }
            return s;
        }));
    };

    const handleClassChange = (studentId: string, nextClassId: string) => {
        setStudents(prev => prev.map(s => {
            if (s.studentId === studentId) {
                const selectedClass = classes.find(c => c.id === parseInt(nextClassId));
                let nextRollNumber = s.nextRollNumber;
                let nextUsername = s.nextUsername;
                if (selectedClass) {
                    if (s.rollNumber.includes("-")) {
                        nextRollNumber = `${selectedClass.name}-${s.rollNumber.split("-")[1]}`;
                    }
                    nextUsername = `${selectedClass.name}-${s.rollNumber}`;
                }
                return { ...s, nextClassId, nextRollNumber, nextUsername };
            }
            return s;
        }));
    };

    const handleBulkClassChange = (nextClassId: string) => {
        setStudents(prev => prev.map(s => {
            const selectedClass = classes.find(c => c.id === parseInt(nextClassId));
            let nextRollNumber = s.nextRollNumber;
            let nextUsername = s.nextUsername;
            if (selectedClass) {
                if (s.rollNumber.includes("-")) {
                    nextRollNumber = `${selectedClass.name}-${s.rollNumber.split("-")[1]}`;
                }
                nextUsername = `${selectedClass.name}-${s.rollNumber}`;
            }
            return { ...s, nextClassId: parseInt(nextClassId), nextRollNumber, nextUsername };
        }));
    };

    const handlePromote = async () => {
        if (!destYear) {
            toast.error("Please select a destination academic year.");
            return;
        }

        if (students.length === 0) return;

        // Check if any promoted/repeat students are missing a class
        const missingClass = students.find(s => (s.status === 'Promoted' || s.status === 'Repeat') && !s.nextClassId);
        if (missingClass) {
            toast.error(`Please select a destination class for ${missingClass.name}`);
            return;
        }

        if (!confirm(`Are you sure you want to process promotion for ${students.length} students?`)) return;

        setProcessing(true);
        const sourceClassId = sourceClass === "all" ? null : parseInt(sourceClass);
        const { success, error } = await promoteStudents({
            previousYearId: parseInt(sourceYear),
            nextYearId: parseInt(destYear),
            classId: sourceClassId as any,
            students: students.map(s => ({
                studentId: s.studentId,
                status: s.status,
                nextGradeId: s.nextGradeId ? parseInt(s.nextGradeId as any) : null,
                nextClassId: s.nextClassId ? parseInt(s.nextClassId as any) : null,
                nextRollNumber: s.nextRollNumber,
                nextUsername: s.nextUsername,
                remarks: s.remarks
            }))
        });

        if (success) {
            toast.success("Students promoted successfully!");
            setStudents([]);
            setSourceClass("");
            router.refresh();
        } else {
            toast.error("Failed to promote students.");
        }
        setProcessing(false);
    };

    return (
        <div className="flex flex-col gap-6 relative">
            {/* Top Controls */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowYearModal(true)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                    <span className="text-lg">+</span> Add Academic Year
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Source Academic Year</label>
                    <select
                        value={sourceYear}
                        onChange={(e) => setSourceYear(e.target.value)}
                        className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                        <option value="">Select Year</option>
                        {academicYears.map(y => <option key={y.id} value={y.id}>{y.name} {y.isCurrent ? '(Current)' : ''}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Source Class</label>
                    <select
                        value={sourceClass}
                        onChange={(e) => setSourceClass(e.target.value)}
                        className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                        <option value="">Select Class</option>
                        <option value="all">All Classes (Whole School)</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Destination Year</label>
                    <select
                        value={destYear}
                        onChange={(e) => setDestYear(e.target.value)}
                        className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                        <option value="">Select Year</option>
                        {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Students Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest animate-pulse">Fetching Students...</p>
                </div>
            ) : students.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Student List</h2>
                            <p className="text-blue-100 text-xs font-medium">Mapped for Academic Session Transition</p>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md">
                            <span className="text-3xl font-black">{students.length}</span>
                            <span className="text-[10px] uppercase ml-2 opacity-80">Students</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-6">
                        <h2 className="font-bold text-gray-700"></h2>
                        {sourceClass !== "all" && (
                            <div className="flex gap-2 items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase">Bulk Class:</span>
                                <select
                                    onChange={(e) => handleBulkClassChange(e.target.value)}
                                    className="p-1 text-xs border rounded-md outline-none"
                                >
                                    <option value="">Set All Classes</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="overflow-x-auto border rounded-xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="p-4">Roll</th>
                                    <th className="p-4">Student Name</th>
                                    <th className="p-4 text-center">New Roll</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">Destination Class</th>
                                    <th className="p-4">Next Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {students.map(s => (
                                    <tr key={s.studentId} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-medium">{s.rollNumber}</td>
                                        <td className="p-4 font-bold text-gray-700">{s.name}</td>
                                        <td className="p-4 text-center text-xs font-bold text-blue-600">
                                            {sourceClass === "all" ? (
                                                <span>{s.nextRollNumber || "-"}</span>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={s.nextRollNumber || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setStudents(prev => prev.map(st => st.studentId === s.studentId ? { ...st, nextRollNumber: val } : st));
                                                    }}
                                                    className="w-24 p-1 text-xs border rounded text-center font-bold text-blue-600 bg-blue-50/30"
                                                />
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {sourceClass === "all" ? (
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.status === 'Promoted' ? 'bg-green-100 text-green-700' :
                                                    s.status === 'Passed Out' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {s.status}
                                                </span>
                                            ) : (
                                                <select
                                                    value={s.status}
                                                    onChange={(e) => handleStatusChange(s.studentId, e.target.value)}
                                                    className={`p-1 text-xs border rounded font-bold ${s.status === 'Promoted' ? 'text-green-600 border-green-200 bg-green-50' :
                                                        s.status === 'Repeat' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                                                            'text-red-600 border-red-200 bg-red-50'
                                                        }`}
                                                >
                                                    <option value="Promoted">Promote</option>
                                                    <option value="Repeat">Repeat</option>
                                                    <option value="Passed Out">Passed Out</option>
                                                    <option value="Transferred">Transferred</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {sourceClass === "all" ? (
                                                <span className="text-xs font-bold text-gray-500">
                                                    {classes.find(c => c.id === parseInt(s.nextClassId as any))?.name || "-"}
                                                </span>
                                            ) : (
                                                (s.status === 'Promoted' || s.status === 'Repeat') ? (
                                                    <select
                                                        value={s.nextClassId?.toString() || ""}
                                                        onChange={(e) => handleClassChange(s.studentId, e.target.value)}
                                                        className="p-1 text-xs border rounded outline-none w-32"
                                                    >
                                                        <option value="">Select Class</option>
                                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs font-bold text-gray-600">
                                                {s.nextGradeId ? `Grade ${grades.find(g => g.id === s.nextGradeId)?.level}` : 'N/A'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        onClick={handlePromote}
                        disabled={processing}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                        {processing ? "PROCESSING..." : "PROCESS PROMOTION"}
                    </button>
                </div>
            ) : sourceYear && sourceClass ? (
                <div className="p-20 text-center bg-gray-50 rounded-xl border border-dashed">
                    <p className="text-gray-500 font-bold">No students found in this class for the selected year.</p>
                </div>
            ) : (
                <div className="p-20 text-center bg-gray-50 rounded-xl border border-dashed">
                    <p className="text-gray-400 font-medium">Select a source academic year and class to begin promotion.</p>
                </div>
            )}
            {/* Year Modal */}
            {showYearModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">New Academic Year</h2>
                            <button onClick={() => setShowYearModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                        </div>
                        <form onSubmit={handleCreateYear} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Year Name</label>
                                <input
                                    required
                                    placeholder="e.g. 2025-26"
                                    className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 font-medium"
                                    value={newYearName}
                                    onChange={(e) => setNewYearName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 font-medium"
                                        value={newYearStart}
                                        onChange={(e) => setNewYearStart(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 font-medium"
                                        value={newYearEnd}
                                        onChange={(e) => setNewYearEnd(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg mt-4 disabled:opacity-50"
                            >
                                {processing ? "CREATING..." : "CREATE YEAR"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromotionView;
