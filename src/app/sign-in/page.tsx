"use client";

import Image from "next/image";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "./actions";
import { useState, useEffect } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-[#f16122] to-[#d84e12] hover:from-[#e05315] hover:to-[#c4430a] text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 text-base disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
    >
      {pending ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Authenticating...</span>
        </>
      ) : (
        <>
          <span>Sign In to Portal</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </>
      )}
    </button>
  );
}

export default function LoginPage() {
  const [rawState, formAction] = useFormState(login, { success: false, error: "" });
  const state = rawState || { success: false, error: "" };
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.error) {
      console.error("Login failed:", state.error);
    }
  }, [state?.error]);

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#2d1215] via-[#4e282c] to-[#1a090b] p-4 sm:p-6 md:p-8 overflow-hidden select-none">
      {/* Background Decorative Lighting & Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#f16122]/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#4e282c]/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10 my-auto">
        {/* Card Frame */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6 sm:p-8 flex flex-col gap-6 transition-all duration-300">
          
          {/* School Header / Crest */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3 group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#4e282c] to-[#f16122] rounded-full blur opacity-40 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden bg-white p-1 shadow-md border border-gray-100 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="School Logo"
                  width={80}
                  height={80}
                  priority
                  className="object-contain transform transition duration-300 group-hover:scale-105"
                />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-snug">
              Dr Cyrus Poonawalla
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#4e282c]/80 uppercase mt-0.5">
              English Medium School
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdece7] border border-[#f16122]/20 text-[#f16122] text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f16122] animate-ping" />
              <span>Official ERP Portal</span>
            </div>
          </div>

          {/* Login Form */}
          <form action={formAction} className="flex flex-col gap-4">
            
            {/* Username / Email Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span>Email or Username / Roll No</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="e.g. 10A-001 or name@email.com"
                  required
                  autoComplete="username"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200 text-gray-900 placeholder-gray-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#f16122] focus:border-transparent focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-gray-50/80 border border-gray-200 text-gray-900 placeholder-gray-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#f16122] focus:border-transparent focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message Box */}
            {state?.error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 text-red-500 shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{state.error}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="mt-2">
              <SubmitButton />
            </div>
          </form>

          {/* Accessible Roles Hint Pills */}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">
              Portal Access For
            </span>
            <div className="flex flex-wrap justify-center gap-1.5 text-[11px] font-medium text-gray-600">
              <span className="px-2.5 py-1 rounded-md bg-gray-100/80 hover:bg-gray-100 transition">🎓 Students</span>
              <span className="px-2.5 py-1 rounded-md bg-gray-100/80 hover:bg-gray-100 transition">👨‍🏫 Teachers</span>
              <span className="px-2.5 py-1 rounded-md bg-gray-100/80 hover:bg-gray-100 transition">👨‍👩‍👧 Parents</span>
              <span className="px-2.5 py-1 rounded-md bg-gray-100/80 hover:bg-gray-100 transition">⚡ Admins</span>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <span>Secure Enterprise Login • DCPEMS</span>
          </div>

        </div>
      </div>
    </div>
  );
}

