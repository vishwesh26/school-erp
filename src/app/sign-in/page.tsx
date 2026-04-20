"use client";

import Image from "next/image";
import { useFormState } from "react-dom";
import { login } from "./actions";
import { useState, useEffect } from "react";

export default function LoginPage() {
  /* const [state, formAction] = useFormState(login, { success: false, error: "" }); */
  /* Using explicit fallback to prevent undefined crash during hydration */
  const [rawState, formAction] = useFormState(login, { success: false, error: "" });
  const state = rawState || { success: false, error: "" };
  const [showPassword, setShowPassword] = useState(false);
  console.log("Form State:", state);

  useEffect(() => {
    if (state?.error) {
      console.error("Login failed:", state.error);
    }
  }, [state.error]);

  return (
    <div className="h-screen flex items-center justify-center bg-lamaSkyLight p-4">
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <div className="flex flex-col items-center gap-2 text-center">
          <Image src="/logo.png" alt="School Logo" width={100} height={100} className="rounded-full shadow-lg" />
          <h2 className="text-2xl font-bold text-gray-800">
            Dr Cyrus Poonawalla English Medium School
          </h2>
          <p className="text-gray-600">Welcome to School ERP</p>
        </div>

        <form action={formAction} className="bg-white p-8 rounded-xl shadow-2xl flex flex-col gap-6 w-full border border-gray-100">
          <h1 className="text-xl font-bold text-center text-blue-600">Sign In</h1>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Email or Username</label>
            <input
              name="email"
              type="text"
              placeholder="e.g. 10A-001 or name@email.com"
              required
              className="p-3 rounded-lg ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="w-full p-3 pr-10 rounded-lg ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold shadow-md transition-colors">
            Log In
          </button>

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center">
              Login Failed: {state.error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
