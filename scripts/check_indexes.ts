
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Checking Indexes on Subject table...");

    // We can't access pg_indexes via client select easily if RLS blocks system tables or if not exposed.
    // But we can try RPC if available, or just use the "Constraint Violation" method again with a random name?
    // No, we want to SEE the index name.

    // Actually, Supabase 'get_indexes' via RPC would be ideal but it's not standard.
    // Let's try to infer from error message again by inserting a Duplicate.
    // If it fails, capture the Message.

    const { error: insertError } = await supabase.from('Subject').insert({ name: 'DUPLICATE_TEST_ABC' });
    if (!insertError) {
        console.log("Insert 1 successful.");
        const { error: insertError2 } = await supabase.from('Subject').insert({ name: 'DUPLICATE_TEST_ABC' });
        if (insertError2) {
            console.log("DUPLICATE BLOCKED BY:", insertError2.message);
            console.log("Details:", insertError2.details);
            // Cleanup
            await supabase.from('Subject').delete().eq('name', 'DUPLICATE_TEST_ABC');
        } else {
            console.log("SUCCESS! No unique constraint found. Duplicates allowed.");
            // Cleanup
            await supabase.from('Subject').delete().eq('name', 'DUPLICATE_TEST_ABC');
        }
        // Cleanup first
        await supabase.from('Subject').delete().eq('name', 'DUPLICATE_TEST_ABC');
    } else {
        console.log("Setup failed:", insertError.message);
    }
}

inspect();
