
const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
const dotenvConfig = require("dotenv");

dotenvConfig.config({ path: ".env" });

const supUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supClient = createSupabaseClient(supUrl, supKey);

async function checkAccountantTables() {
    console.log("Checking for accountant-related tables...");

    const candidates = [
        'Accountant',
        'Fee',
        'Payment',
        'Expense',
        'FeeCategory',
        'StudentFee',
        'FeePayment',
        'FeeReceipt'
    ];

    for (const table of candidates) {
        const { error } = await supClient.from(table).select('*').limit(1);
        if (!error) console.log(`Found table: ${table}`);
        else if (error.code === '42P01') console.log(`Table not found: ${table}`);
        else console.log(`Checked ${table}: ${error.code} - ${error.message}`);
    }
}

checkAccountantTables();
