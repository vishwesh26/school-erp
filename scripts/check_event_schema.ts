
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Checking Event and Announcement tables...");

    const { data: eventData, error: eventError } = await supabase.from('Event').select('id, classId').limit(1);
    if (eventError) console.log("Event Check Error:", eventError.message);
    else console.log("Event table has columns (verified via select id, classId).");

    const { data: annData, error: annError } = await supabase.from('Announcement').select('id, classId').limit(1);
    if (annError) console.log("Announcement Check Error:", annError.message);
    else console.log("Announcement table has columns (verified via select id, classId).");
}

inspect();
