const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSearch(searchTerm: any) {
    console.log(`Testing search for: "${searchTerm}"`);

    // The query from accountantActions.ts
    // query = query.or(`student.name.ilike.%${search}%,student.surname.ilike.%${search}%,student.rollNumber.ilike.%${search}%`);

    let query = supabase.from('StudentFee')
        .select('*, student:Student!inner(name, surname, rollNumber), feeCategory:FeeCategory(name)', { count: 'exact' });

    // Try the exact logic
    // Note: The original code used 'student.name', let's see if that works with the alias 'student'
    query = query.or(`name.ilike.%${searchTerm}%,surname.ilike.%${searchTerm}%,rollNumber.ilike.%${searchTerm}%`, { foreignTable: 'student' });

    // Actually, looking at the code:
    // query = query.or(`student.name.ilike.%${search}%,student.surname.ilike.%${search}%,student.rollNumber.ilike.%${search}%`);
    // This attempts to filter on the top level using dot notation for the relationship.

    // Correct logic
    let codeQuery = supabase.from('StudentFee')
        .select('*, student:Student!inner(name, surname, rollNumber), feeCategory:FeeCategory(name)', { count: 'exact' });

    codeQuery = codeQuery.or(`name.ilike.%${searchTerm}%,surname.ilike.%${searchTerm}%,rollNumber.ilike.%${searchTerm}%`, { foreignTable: 'student' });

    const { data, error, count } = await codeQuery;

    if (error) {
        console.error("Query Error:", error);
    } else {
        console.log(`Found ${count} records.`);
        if (data.length > 0) {
            console.log("First match:", data[0].student.name);
        }
    }
}

// We know we have a student named "manthan" from previous logs.
testSearch("manthan");
