"use client";

import { useEffect, useState } from "react";

const ClientDate = ({ date }: { date: string }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return server-side consistent placeholder or formatted UTC
        // Ideally empty or "-" to avoid hydration mismatch, or a server-safe format.
        // However, table alignment matters.
        // UTC formatting is safe for SSG/SSR but user wants local.
        // If we return UTC, it will flicker to Local.
        return <span>{new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })} (UTC)</span>;
    }

    return (
        <span>
            {new Date(date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            })}
        </span>
    );
};

export default ClientDate;
