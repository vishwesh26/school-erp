
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createLibrarianUser() {
    console.log("Creating Librarian User...");
    const email = "librarian@school.com";
    const password = "Librarian123";

    // 1. Create Auth
    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'librarian' }
    });

    if (authError) {
        if (authError.code === 'email_exists') {
            console.log("User already exists. Fetching...");
            const { data: { users } } = await supabase.auth.admin.listUsers();
            const existing = users.find(u => u.email === email);
            if (existing) {
                console.log("Found existing user:", existing.id);
                await insertLibrarian(existing.id, email);
            } else {
                console.error("Could not find existing user despite email_exists error.");
            }
        } else {
            console.error("Auth Error:", authError);
        }
    } else {
        console.log("Auth User Created:", user.id);
        await insertLibrarian(user.id, email);
    }
}

async function insertLibrarian(id, email) {
    // 2. Insert DB
    const { error: dbError } = await supabase.from('Librarian').insert({
        id: id,
        username: "librarian_main",
        name: "Main",
        surname: "Librarian",
        email: email,
        phone: "555-0199",
        address: "School Library",
        bloodType: "O+",
        sex: "FEMALE",
        birthday: "1990-01-01"
    });

    if (dbError) {
        console.error("DB Insert Error:", dbError);
    } else {
        console.log("Librarian successfully created in DB!");
    }
}

createLibrarianUser();
