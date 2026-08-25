"use client";

import { useEffect } from "react";

export default function ChunkErrorHandler() {
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error = "reason" in event ? event.reason : event.error;
      const message = error?.message || ("message" in event ? event.message : "") || "";
      const isChunkError =
        error?.name === "ChunkLoadError" ||
        message.includes("ChunkLoadError") ||
        message.includes("Loading chunk") ||
        message.includes("Failed to fetch dynamically imported module");

      if (isChunkError) {
        const lastReload = sessionStorage.getItem("chunk_reload_retry");
        const now = Date.now();
        // Prevent infinite reload loops (only auto-reload if last reload was > 10s ago)
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem("chunk_reload_retry", now.toString());
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleChunkError);
    window.addEventListener("unhandledrejection", handleChunkError);

    return () => {
      window.removeEventListener("error", handleChunkError);
      window.removeEventListener("unhandledrejection", handleChunkError);
    };
  }, []);

  return null;
}
