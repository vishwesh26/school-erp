
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createParent() {
    // 1. Create Auth User for Parent
    const email = "parent" + Date.now() + "@test.com";
    const { data: user, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: "password123",
        user_metadata: { role: "parent" },
        email_confirm: true
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return;
    }

    console.log("Auth User Created:", user.user.id);

    // 2. Insert into Parent Table
    // Columns: id, username, name, surname, email, phone, address, createdAt
    const { data, error } = await supabase
        .from('Parent')
        .insert({
            id: user.user.id,
            username: "parent_" + Date.now(),
            name: "Test",
            surname: "Parent",
            email: email,
            phone: "1234567890",
            address: "Test Address",
        })
        .select();

    if (error) {
        console.error('Error creating parent:', error);
    } else {
        console.log('Successfully created parent:', data);
        console.log('PARENT ID TO USE:', data[0].id);
    }
}

createParent();
