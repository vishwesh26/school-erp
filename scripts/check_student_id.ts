
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectStudent() {
    console.log("Checking Student table...");
    const { data, error } = await supabase.from('Student').select('id').limit(1);
    if (error) {
        console.log("Error:", error.message);
    } else {
        if (data.length > 0) {
            console.log("Sample Student ID:", data[0].id, "Type:", typeof data[0].id);
        } else {
            console.log("No students found.");
        }
    }
}

inspectStudent();
