"use client";
import React, { useState } from 'react';
import { findBookByAccession, returnBook, getActiveIssuesByBook } from '@/lib/librarianActions';
import { toast } from 'react-toastify';
import { createClient } from "@/lib/supabase/client";

const ReturnBookPage = () => {
    const [accession, setAccession] = useState('');
    const [issues, setIssues] = useState<any[]>([]);
    const [selectedIssue, setSelectedIssue] = useState<any>(null);
    const [fine, setFine] = useState(0);
    const [loading, setLoading] = useState(false);

    // Client-side fetch wrapper for Issue lookup by accession
    // Ideally this should be in librarianActions but for Return we need to find the ISSUE linked to the BOOK
    const findIssueByBook = async () => {
        if (!accession) return;
        setLoading(true);
        const supabase = createClient();

        // 1. Get Book ID
        const { data: book } = await supabase.from('Book').select('id, title').eq('accession_no', accession).single();
        if (!book) {
            toast.error("Book not found");
            setLoading(false);
            return;
        }

        // 2. Get Active Issues
        const { data: issueData, error } = await getActiveIssuesByBook(book.id);

        if (error || !issueData || issueData.length === 0) {
            toast.error("Book is not currently issued.");
            setIssues([]);
            setSelectedIssue(null);
        } else {
            // Attach book title to each issue for convenience
            const mappedIssues = issueData.map(i => ({ ...i, bookTitle: book.title }));
            setIssues(mappedIssues);

            // If only one, auto-select
            if (mappedIssues.length === 1) {
                selectIssue(mappedIssues[0]);
            } else {
                setSelectedIssue(null);
                toast.info(`Found ${mappedIssues.length} active issues. Please select student.`);
            }
        }
        setLoading(false);
    };

    const selectIssue = (issue: any) => {
        setSelectedIssue(issue);
        // Calculate provisional fine
        const now = new Date();
        const due = new Date(issue.dueDate);
        if (now > due) {
            const diffTime = Math.abs(now.getTime() - due.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setFine(diffDays * 1);
        } else {
            setFine(0);
        }
    };

    const handleReturn = async () => {
        if (!selectedIssue) return;
        setLoading(true);
        const res = await returnBook(selectedIssue.id);
        if (res.success) {
            toast.success(`Book Returned! Fine: $${res.fine}`);
            setIssues(prev => prev.filter(i => i.id !== selectedIssue.id));
            setSelectedIssue(null);
            setAccession('');
            setFine(0);
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="p-4 flex flex-col md:flex-row gap-4 h-full">
            <div className="w-full md:w-1/2 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-md shadow-sm">
                    <h2 className="text-lg font-bold mb-4">Scan Book to Return</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 p-2 border rounded"
                            placeholder="Scan Accession No..."
                            value={accession}
                            onChange={e => setAccession(e.target.value)}
                        />
                        <button onClick={findIssueByBook} className="bg-lamaPurple text-white px-4 rounded">Search</button>
                    </div>
                </div>

                {/* MULTIPLE ISSUES SELECTION */}
                {issues.length > 1 && !selectedIssue && (
                    <div className="bg-white p-6 rounded-md shadow-sm">
                        <h3 className="font-bold text-gray-700 mb-2">Multiple Issues Found:</h3>
                        <div className="flex flex-col gap-2">
                            {issues.map(issue => (
                                <div key={issue.id}
                                    className="p-3 border rounded cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                                    onClick={() => selectIssue(issue)}
                                >
                                    <span>{issue.student?.name} {issue.student?.surname}</span>
                                    <span className="text-sm text-gray-500">{new Date(issue.dueDate).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedIssue && (
                    <div className="bg-white p-6 rounded-md shadow-sm border-l-4 border-lamaPurple">
                        <h3 className="font-bold text-gray-700">{selectedIssue.bookTitle}</h3>
                        <p className="text-sm text-gray-500">Issued To: {selectedIssue.student?.name} {selectedIssue.student?.surname}</p>
                        <p className="text-sm text-gray-500">Due Date: {new Date(selectedIssue.dueDate).toLocaleDateString()}</p>

                        <div className="mt-4 p-4 bg-gray-50 rounded">
                            <span className="text-gray-500 text-sm">Fine Amount</span>
                            <div className={`text-2xl font-bold ${fine > 0 ? "text-red-500" : "text-green-500"}`}>
                                ${fine.toFixed(2)}
                            </div>
                        </div>
                        {issues.length > 1 && (
                            <button onClick={() => setSelectedIssue(null)} className="text-sm text-blue-500 mt-2 underline">
                                Change Selection
                            </button>
                        )}
                    </div>
                )}

                <button
                    onClick={handleReturn}
                    disabled={!selectedIssue || loading}
                    className="w-full bg-black text-white py-4 rounded-lg font-bold text-xl hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Processing..." : "CONFIRM RETURN"}
                </button>
            </div>
        </div>
    );
};

export default ReturnBookPage;
