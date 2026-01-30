
const { createClient } = require("@supabase/supabase-js");

// Mocking the environment variables for the script context
require("dotenv").config({ path: ".env" });

async function checkUser() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const email = "vishweshshinde26@gmail.com";
    console.log("Checking for email:", email);

    const { data, error } = await supabase
        .from('Teacher')
        .select('*')
        .eq('email', email);

    console.log("Teacher DB Lookup:", data, error);

    // Check Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (users) {
        const user = users.find((u: any) => u.email === email);
        console.log("Auth Lookup:", user ? "Found User ID: " + user.id : "Not Found");
    } else {
        console.log("Auth Lookup Error:", authError);
    }
}

checkUser();
