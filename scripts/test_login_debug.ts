const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthUsers() {
    console.log("Checking Auth Users in Supabase...");
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Error listing users:", error.message);
        return;
    }

    console.log(`Total Auth Users found: ${users.length}`);
    users.slice(0, 10).forEach((u: any) => {
        console.log(`ID: ${u.id} | Email: ${u.email} | Role: ${u.user_metadata?.role}`);
    });

    console.log("\nChecking Student count...");
    const { count: studentCount } = await supabase.from('Student').select('*', { count: 'exact', head: true });
    console.log("Student count:", studentCount);

    console.log("\nChecking Teacher count...");
    const { count: teacherCount } = await supabase.from('Teacher').select('*', { count: 'exact', head: true });
    console.log("Teacher count:", teacherCount);
}

checkAuthUsers();

export {};

