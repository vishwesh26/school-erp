"use client";

import { useEffect } from "react";

export default function ChunkErrorHandler() {
  useEffect(() => {
    // Clean up any cache-busting query parameter like ?_v=... or ?_reload=... after successful page render
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("_v") || url.searchParams.has("_reload")) {
        url.searchParams.delete("_v");
        url.searchParams.delete("_reload");
        const cleanUrl = url.pathname + (url.search ? url.search : "") + url.hash;
        window.history.replaceState(null, "", cleanUrl);
      }
    }

    const triggerReload = (reason: string) => {
      console.warn(`Static asset chunk or CSS failure detected (${reason}). Auto-recovering...`);
      const lastReload = sessionStorage.getItem("chunk_reload_retry");
      const now = Date.now();
      // Prevent reload loops: only reload once every 10 seconds
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem("chunk_reload_retry", now.toString());
        const url = new URL(window.location.href);
        url.searchParams.set("_v", now.toString());
        window.location.replace(url.toString());
      }
    };

    // 1. Handle JavaScript ChunkLoadErrors and dynamic import failures
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error = "reason" in event ? event.reason : event.error;
      const message = error?.message || ("message" in event ? event.message : "") || "";
      const isChunkError =
        error?.name === "ChunkLoadError" ||
        message.includes("ChunkLoadError") ||
        message.includes("Loading chunk") ||
        message.includes("Failed to fetch dynamically imported module");

      if (isChunkError) {
        triggerReload("JS ChunkLoadError");
      }
    };

    // 2. Handle static CSS (<link>) or Script (<script>) 404 network errors during capturing phase
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const isLink = target.tagName === "LINK";
      const isScript = target.tagName === "SCRIPT";
      if (!isLink && !isScript) return;

      const url =
        (target as HTMLLinkElement).href ||
        (target as HTMLScriptElement).src ||
        "";

      if (url && (url.includes("/_next/static/") || url.includes(".css"))) {
        triggerReload(`Resource failed to load: ${url}`);
      }
    };

    window.addEventListener("error", handleChunkError);
    window.addEventListener("unhandledrejection", handleChunkError);
    // Resource loading errors (like 404 on <link> or <script>) do NOT bubble; use capture phase:
    window.addEventListener("error", handleResourceError, true);

    return () => {
      window.removeEventListener("error", handleChunkError);
      window.removeEventListener("unhandledrejection", handleChunkError);
      window.removeEventListener("error", handleResourceError, true);
    };
  }, []);

  return null;
}
