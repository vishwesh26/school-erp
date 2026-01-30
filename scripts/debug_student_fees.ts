const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugFees() {
    console.log("Fetching StudentFees...");

    // Exact query from accountantActions.ts
    const { data, error } = await supabase.from('StudentFee')
        .select('*, student:Student(name, surname, rollNumber), feeCategory:FeeCategory(name)')
        .limit(5);

    if (error) {
        console.error("Error fetching fees:", error);
    } else {
        console.log("Found", data.length, "records.");
        if (data.length > 0) {
            console.log("First record:", JSON.stringify(data[0], null, 2));
        } else {
            console.log("No records found in StudentFee table.");
        }
    }
}

debugFees();
