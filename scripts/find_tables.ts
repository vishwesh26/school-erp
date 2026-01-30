
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    console.log("Listing all tables...");

    // Query PostgREST resource - usually not possible to list tables directly via client client unless rpc is set up.
    // But we can try querying a known table or just guessing.
    // Actually, Supabase has a `rpc` for this if enabled, but likely not.
    // Best way in this env is to try common names.

    const candidates = ['books', 'library', 'resources', 'book_issues', 'library_transactions'];

    for (const table of candidates) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (!error) console.log(`Found table: ${table}`);
        else console.log(`Checked ${table}: ${error.code} - ${error.message}`);
    }
}

listTables();
