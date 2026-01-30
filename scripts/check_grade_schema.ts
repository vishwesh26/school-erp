
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Checking Grade table columns...");
    const { data, error } = await supabase.from('Grade').select('*').limit(1);
    if (error) {
        console.log("Error:", error.message);
    } else {
        console.log("Sample Grade:", data[0]);
    }
}

inspect();
