
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testInsert() {
    console.log("Testing Service Role Insert...");

    // 1. Create a dummy simple insert
    const dummyId = "test-id-" + Date.now();
    const { data, error } = await supabase.from('Librarian').insert({
        id: dummyId,
        username: "testuser" + Date.now(),
        name: "Test",
        surname: "Librarian",
        email: "testlib" + Date.now() + "@test.com",
        phone: "123456" + Date.now(), // unique
        address: "123 Test St",
        bloodType: "A+",
        sex: "MALE",
        birthday: new Date()
    }).select();

    if (error) {
        console.error("Insert Error:", error);
    } else {
        console.log("Insert Success:", data);

        // Clean up
        await supabase.from('Librarian').delete().eq('id', dummyId);
        console.log("Cleaned up.");
    }
}

testInsert();
