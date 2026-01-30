"use client";

import { useState, useMemo } from "react";
import { manualData, ManualCategory } from "@/lib/manualData";
import Image from "next/image";
import Link from "next/link";

const ManualPage = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredData = useMemo(() => {
        if (!searchQuery) return manualData;

        const query = searchQuery.toLowerCase();
        return manualData.map(category => ({
            ...category,
            topics: category.topics.filter(topic =>
                topic.title.toLowerCase().includes(query) ||
                topic.description.toLowerCase().includes(query) ||
                topic.keywords.some(k => k.toLowerCase().includes(query)) ||
                topic.steps.some(s => s.toLowerCase().includes(query))
            )
        })).filter(category => category.topics.length > 0);
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            {/* Header */}
            <header className="max-w-5xl mx-auto mb-12 text-center">
                <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
                    <span className="mr-2">←</span> Back to Dashboard
                </Link>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    ERP User <span className="text-blue-600">Manual</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Welcome to the DCPEMS Operations Guide. Find step-by-step instructions for managing students, classes, and more.
                </p>
            </header>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-16 relative">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Scan for features... (e.g. 'add student', 'mark attendance')"
                        className="w-full p-5 pl-14 text-lg rounded-2xl border-none ring-1 ring-slate-200 shadow-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto">
                {filteredData.length > 0 ? (
                    <div className="flex flex-col gap-12">
                        {filteredData.map((cat, catIdx) => (
                            <section key={cat.category} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${catIdx * 100}ms` }}>
                                <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-4">
                                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                        <Image src={`/${cat.icon}.png`} alt="" width={24} height={24} className="brightness-0 saturate-100" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800">{cat.category}</h2>
                                </div>

                                <div className="grid gap-8">
                                    {cat.topics.map((topic, topicIdx) => (
                                        <div key={topic.title} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-3">
                                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg text-sm">
                                                    {topicIdx + 1}
                                                </span>
                                                {topic.title}
                                            </h3>
                                            <p className="text-slate-600 mb-6 italic">{topic.description}</p>

                                            <div className="space-y-4">
                                                {topic.steps.map((step, stepIdx) => (
                                                    <div key={stepIdx} className="flex gap-4 group">
                                                        <div className="flex-shrink-0 w-1.5 h-auto bg-slate-100 rounded-full group-hover:bg-blue-300 transition-colors" />
                                                        <p className="text-slate-700 leading-relaxed font-medium">
                                                            {step}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="text-6xl mb-6">🔍</div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">No instructions found</h2>
                        <p className="text-slate-500">We couldn&apos;t find anything matching &quot;{searchQuery}&quot;. Try a broader term.</p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-6 text-blue-600 font-bold hover:underline"
                        >
                            Clear search and browse all
                        </button>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="max-w-5xl mx-auto mt-24 pt-12 border-t border-slate-200 text-center text-slate-400 text-sm">
                <p>© {new Date().getFullYear()} DCPEMS School ERP • Need المزيد من المساعدة? Contact IT Support.</p>
            </footer>

            <style jsx global>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-from-bottom-4 { from { transform: translateY(1rem); } to { transform: translateY(0); } }
                .animate-in { animation: fade-in 0.5s ease-out, slide-in-from-bottom-4 0.5s ease-out; }
            `}</style>
        </div>
    );
};

export default ManualPage;
