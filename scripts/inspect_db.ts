
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Checking Attendance table structure...");

    const { data, error } = await supabase.from('Attendance').select('*').limit(1);

    if (error) {
        console.error("Error fetching:", error);
    } else {
        console.log("Record sample keys:", data && data[0] ? Object.keys(data[0]) : "No records found");
    }

    const { data: students } = await supabase.from('Student').select('id').limit(1);
    if (students && students.length > 0) {
        const sId = students[0].id;
        console.log("Testing insert with NULL lessonId for student:", sId);

        const { error: insertError } = await supabase.from('Attendance').insert({
            date: new Date().toISOString(),
            present: true,
            studentId: sId,
            lessonId: null
        });

        if (insertError) {
            console.error("Insert failed:", insertError.message);
        } else {
            console.log("Insert SUCCESS with NULL lessonId!");
        }
    }
}

inspect();
