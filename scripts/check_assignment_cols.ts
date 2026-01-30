
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Checking Assignment table columns...");
    // Try to insert a dummy record with only title to see what constraints fail
    // Or just try to select some columns to see if they exist

    // Fallback: Insert duplicate 'Math' and see error?
    // Or generic insert check.
    const { error: insertError } = await supabase.from('Subject').insert({ name: 'TEST_DUPLICATE_CHECK_XYZ' });
    if (!insertError) {
        const { error: insertError2 } = await supabase.from('Subject').insert({ name: 'TEST_DUPLICATE_CHECK_XYZ' });
        if (insertError2) {
            console.log("Unique Constraint exists on Subject name:", insertError2.message);
        } else {
            console.log("No unique constraint on Subject name. Duplicates allowed.");
            // Cleanup
            await supabase.from('Subject').delete().eq('name', 'TEST_DUPLICATE_CHECK_XYZ');
        }
        // Cleanup first insert
        await supabase.from('Subject').delete().eq('name', 'TEST_DUPLICATE_CHECK_XYZ');
    } else {
        console.log("Setup Insert Failed:", insertError.message);
    }
}

inspect();
