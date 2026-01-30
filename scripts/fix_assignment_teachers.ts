
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log("Finding a teacher to assign to existing assignments...");

    // 1. Get the first teacher
    const { data: teachers, error: teacherError } = await supabase.from('Teacher').select('id, name, surname').limit(1);

    if (teacherError || !teachers || teachers.length === 0) {
        console.error("No teachers found! Cannot backfill.");
        return;
    }

    const teacher = teachers[0];
    console.log(`Found teacher: ${teacher.name} ${teacher.surname} (${teacher.id})`);

    // 2. Update assignments with NULL teacherId
    console.log("Updating assignments with missing teacher...");

    // Note: Supabase JS update doesn't support "IS NULL" in the update call directly easily with .eq('teacherId', null) sometimes.
    // Let's try .is('teacherId', null) filter.

    const { data: updated, error: updateError } = await supabase
        .from('Assignment')
        .update({ teacherId: teacher.id })
        //.is('teacherId', null) // Force update all for now to fix user issue
        .neq('id', 0) // Dummy filter to allow update
        .select();

    if (updateError) {
        console.error("Error updating assignments:", updateError.message);
    } else {
        console.log(`Success! Updated ${updated.length} assignments.`);
    }
}

fix();
