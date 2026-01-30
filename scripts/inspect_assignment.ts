
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Checking Assignment table structure...");

    const { data, error } = await supabase.from('Assignment').select('*').limit(1);

    if (error) {
        console.error("Error fetching:", error);
    } else {
        // If no data, try insert to fail and see columns, or just list empty keys if possible (unlikely)
        // Supabase JS doesn't give schema directly easily without data.
        // If data is empty, I'll assume standard from code references.
        console.log("Record sample keys:", data && data[0] ? Object.keys(data[0]) : "No records found, relying on code inference.");
    }
}

inspect();
