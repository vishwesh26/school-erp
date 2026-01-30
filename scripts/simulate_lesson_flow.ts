
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Simulating Lesson Creation...");

    // 1. Define a time: 10:00 AM Local (assuming this machine is Local)
    // In Node, new Date() uses system timezone?
    // Metadata says "The current local time is: ... +05:30".
    // So new Date("2025-12-16T10:00:00") should be 10 AM IST.

    const localTimeStr = "2025-12-16T10:00:00";
    const dateObj = new Date(localTimeStr);
    console.log("Input Local String:", localTimeStr);
    console.log("Date Object:", dateObj.toString());
    console.log("ISO String (sent to DB):", dateObj.toISOString());

    // 2. Insert Lesson
    // Need valid IDs. Check check_last_lesson output or just hardcode if known.
    // I will use random IDs or fetch generic ones if possible?
    // To avoid constraints, I'll fetch first Subject, Class, Teacher.

    const { data: subject } = await supabase.from('Subject').select('id').limit(1).single();
    const { data: classItem } = await supabase.from('Class').select('id').limit(1).single();
    const { data: teacher } = await supabase.from('Teacher').select('id').limit(1).single();

    if (!subject || !classItem || !teacher) {
        console.error("Missing relations (Subject/Class/Teacher). Seed DB first.");
        return;
    }

    const payload = {
        name: "Simulation Lesson",
        day: "MONDAY",
        startTime: dateObj.toISOString(), // Action does this (or passes Date, Supabase converts)
        endTime: new Date(dateObj.getTime() + 3600000).toISOString(),
        subjectId: subject.id,
        classId: classItem.id,
        teacherId: teacher.id
    };

    const { data: inserted, error: insertError } = await supabase.from('Lesson').insert(payload).select().single();

    if (insertError) {
        console.error("Insert Error:", insertError);
        return;
    }

    console.log("Inserted ID:", inserted.id);

    // 3. Fetch it back (Simulate Client Fetch)
    const { data: fetched, error: fetchError } = await supabase.from('Lesson').select('*').eq('id', inserted.id).single();

    if (fetchError) {
        console.error("Fetch Error:", fetchError);
        return;
    }

    const rawStartTime = fetched.startTime;
    console.log("Fetched startTime (Raw String):", rawStartTime);
    console.log("Fetched Type:", typeof rawStartTime);

    // 4. Simulate Client Fix
    const formatToLocalDatetime = (isoString: string) => {
        if (!isoString) return "";
        console.log("--- Formatting logic ---");
        console.log("Input:", isoString);
        const safeIso = isoString.endsWith("Z") || isoString.includes("+") ? isoString : isoString + "Z";
        console.log("SafeIso:", safeIso);
        const d = new Date(safeIso);
        console.log("Date Obj:", d.toString());
        console.log("Hours:", d.getHours());

        const pad = (n: number) => n.toString().padStart(2, '0');
        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const formatted = formatToLocalDatetime(rawStartTime);
    console.log("Formatted Result:", formatted);

    // Cleanup
    await supabase.from('Lesson').delete().eq('id', inserted.id);
}

main();
