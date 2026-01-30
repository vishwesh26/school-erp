"use client";

import Image from "next/image";
import { useFormState } from "react-dom";
import { login } from "./actions";
import { useEffect } from "react";

export default function LoginPage() {
  /* const [state, formAction] = useFormState(login, { success: false, error: "" }); */
  /* Using explicit fallback to prevent undefined crash during hydration */
  const [rawState, formAction] = useFormState(login, { success: false, error: "" });
  const state = rawState || { success: false, error: "" };
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
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="p-3 rounded-lg ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
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
