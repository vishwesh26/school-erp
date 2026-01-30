
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Testing Subject query...");

    // Attempt 1: Aliased Teacher
    const { data: d1, error: e1 } = await supabase.from('Subject').select('*, teachers:Teacher(*)').limit(1);
    if (!e1) {
        console.log("Success 1 (Alias):", d1);
        return;
    } else {
        console.log("Error 1:", e1.message);
        console.log("Hint 1:", e1.hint);
    }

    // Attempt 2: Direct Teacher
    const { data: d2, error: e2 } = await supabase.from('Subject').select('*, Teacher(*)').limit(1);
    if (!e2) {
        console.log("Success 2 (Direct):", d2);
        return;
    } else {
        console.log("Error 2:", e2.message);
    }

    // Attempt 3: Join Table
    // Prisma usually names it _SubjectToTeacher (A, B)
    const { data: d3, error: e3 } = await supabase.from('Subject').select('*, _SubjectToTeacher(*)').limit(1);
    if (!e3) {
        console.log("Success 3 (Join Table Only):", d3);
    }

    // Attempt 4: Nested Teacher via Join Table
    // Try to fetch Teacher details from _SubjectToTeacher
    // Note: If column names are A/B, relation might be implicit or mapped.
    // Try nesting Teacher.
    const { data: d4, error: e4 } = await supabase.from('Subject').select('*, _SubjectToTeacher(Teacher(name, surname))').limit(1);
    if (!e4) {
        console.log("Success 4 (Nested Teacher):", JSON.stringify(d4, null, 2));
    } else {
        console.log("Error 4:", e4.message);
        console.log("Hint 4:", e4.hint);
    }
}

test();
