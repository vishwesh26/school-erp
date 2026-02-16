
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking for Receptionist table...");
    try {
        const { data, error } = await supabase.from('AdmissionInquiry').select('*').limit(1);
        if (error) {
            console.log("ERROR CODE:", error.code);
            console.log("ERR MESSAGE:", error.message);
            if (error.message.includes("relation \"Receptionist\" does not exist")) {
                console.log("RESULT: TABLE_MISSING");
            } else {
                console.log("RESULT: UNKNOWN_ERROR");
            }
        } else {
            console.log("RESULT: TABLE_EXISTS");
        }
    } catch (e) {
        console.error("CATCHED ERR:", e.message);
    }
}

check();
