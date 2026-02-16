
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runSql() {
    console.log("Creating Receptionist table...");

    // We can't run arbitrary SQL directly via the official supabase client easily 
    // without a separate library or using their RPC. 
    // However, we can check if the table exists by trying to select from it.

    const { error: checkError } = await supabase.from('Receptionist').select('*').limit(1);

    if (checkError && checkError.code === 'PGRST116') {
        console.log("Table 'Receptionist' does not exist. Please run the SQL manually in Supabase Dashboard.");
        console.log("SQL Content:");
        const sql = fs.readFileSync(path.join(__dirname, "receptionist.sql"), "utf8");
        console.log(sql);
    } else if (checkError) {
        console.error("Error checking table:", checkError.message);
        // If it's a 404 or similar, it might mean the table is missing.
        if (checkError.message.includes("relation \"Receptionist\" does not exist")) {
            console.log("CONFIRMED: Table 'Receptionist' does not exist.");
        }
    } else {
        console.log("Table 'Receptionist' already exists.");
    }
}

runSql();
