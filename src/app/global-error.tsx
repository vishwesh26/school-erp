"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (
      error?.name === "ChunkLoadError" ||
      error?.message?.includes("Loading chunk") ||
      error?.message?.includes("ChunkLoadError")
    ) {
      window.location.reload();
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans text-center">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-xl border border-gray-100 flex flex-col items-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-[#f16122] mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Portal Update Available</h2>
          <p className="text-sm text-gray-500 mb-6">
            A new version of the portal is available or a connection was interrupted. Click below to load the latest version.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#f16122] hover:bg-[#d84e12] text-white py-3 px-4 rounded-xl font-semibold shadow-lg shadow-orange-500/20 transition cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
