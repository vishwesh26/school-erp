
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Checking Assignment table columns...");

    // Attempt to insert a dummy record with 'description' to see if it errors or succeeds (then delete)
    // Or just try to select 'description' from existing
    const { data, error } = await supabase.from('Assignment').select('description').limit(1);

    if (error) {
        console.log("Error selecting description:", error.message);
    } else {
        console.log("Select success, description column likely exists. Data:", data);
    }
}

inspect();
