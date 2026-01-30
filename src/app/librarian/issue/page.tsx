"use client";
import React, { useState } from 'react';
import { findStudent, findBookByAccession, issueBook } from '@/lib/librarianActions';
import { toast } from 'react-toastify';

const IssueBookPage = () => {
    const [studentQuery, setStudentQuery] = useState('');
    const [bookAccession, setBookAccession] = useState('');
    const [student, setStudent] = useState<any>(null);
    const [book, setBook] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSearchStudent = async () => {
        if (!studentQuery) return;
        setLoading(true);
        const { data, error } = await findStudent(studentQuery);
        // data is array
        if (data && data.length > 0) setStudent(data[0]); // Pick first for now
        else toast.error("Student not found");
        setLoading(false);
    };

    const handleSearchBook = async () => {
        if (!bookAccession) return;
        setLoading(true);
        const { data, error } = await findBookByAccession(bookAccession);
        if (data) setBook(data);
        else toast.error("Book not found");
        setLoading(false);
    };

    const handleIssue = async () => {
        if (!student || !book) return;
        setLoading(true);
        const res = await issueBook(student.id, book.id);
        if (res.success) {
            toast.success("Book Issued Successfully!");
            // Reset
            setBook(null);
            setBookAccession('');
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="p-4 flex flex-col md:flex-row gap-4 h-full">
            {/* LEFT: SCANNERS */}
            <div className="w-full md:w-1/2 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-md shadow-sm">
                    <h2 className="text-lg font-bold mb-4">1. Scan Student</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 p-2 border rounded"
                            placeholder="Enter Name or ID..."
                            value={studentQuery}
                            onChange={e => setStudentQuery(e.target.value)}
                        />
                        <button onClick={handleSearchStudent} className="bg-lamaSky text-white px-4 rounded">Search</button>
                    </div>
                </div>

                {student && (
                    <div className="bg-white p-6 rounded-md shadow-sm border-l-4 border-lamaSky">
                        <h3 className="font-bold text-gray-700">{student.name} {student.surname}</h3>
                        <p className="text-sm text-gray-500">Class: {student.classId || "N/A"}</p>
                    </div>
                )}

                <div className="bg-white p-6 rounded-md shadow-sm disabled:opacity-50">
                    <h2 className="text-lg font-bold mb-4">2. Scan Book</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 p-2 border rounded"
                            placeholder="Scan Accession No..."
                            value={bookAccession}
                            onChange={e => setBookAccession(e.target.value)}
                            disabled={!student}
                        />
                        <button onClick={handleSearchBook} disabled={!student} className="bg-lamaYellow text-black px-4 rounded">Search</button>
                    </div>
                </div>

                {book && (
                    <div className="bg-white p-6 rounded-md shadow-sm border-l-4 border-lamaYellow">
                        <h3 className="font-bold text-gray-700">{book.title}</h3>
                        <p className="text-sm text-gray-500">Author: {book.author}</p>
                        <p className={`text-sm font-bold ${book.available_copies > 0 ? "text-green-600" : "text-red-500"}`}>
                            {book.available_copies > 0 ? "Available" : "Not Available"}
                        </p>
                    </div>
                )}

                <button
                    onClick={handleIssue}
                    disabled={!student || !book || book.available_copies < 1 || loading}
                    className="w-full bg-black text-white py-4 rounded-lg font-bold text-xl hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Processing..." : "ISSUE BOOK"}
                </button>
            </div>

            {/* RIGHT: INSTRUCTIONS OR CAM */}
            <div className="w-full md:w-1/2 bg-gray-50 p-6 rounded-md flex items-center justify-center text-gray-400 text-center">
                <div>
                    <span className="text-4xl block mb-2">📷</span>
                    <p>Camera Scanner Placeholder</p>
                    <p className="text-xs mt-2">(Use manual search for MVP)</p>
                </div>
            </div>
        </div>
    );
};

export default IssueBookPage;
