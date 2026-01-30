
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findUser() {
    console.log("Searching for user: test@library.com");

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("List Users Error:", error);
        return;
    }

    console.log(`Total Users Found: ${users.length}`);

    const target = users.find(u => u.email === "test@library.com");
    if (target) {
        console.log("User Found:", target.id, target.email, target.user_metadata);
    } else {
        console.log("User NOT found in the list.");
        // Log all emails to see what's there
        console.log("Available Emails:", users.map(u => u.email));
    }
}

findUser();
