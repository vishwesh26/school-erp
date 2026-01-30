
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking latest Student Fees...");

    // Get last 5 fees
    const { data: fees, error } = await supabase
        .from('StudentFee')
        .select('id, studentId, totalAmount, pendingAmount, status, installments:Installment(*)')
        .order('id', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching fees:", error);
        return;
    }

    console.log(`Found ${fees.length} fees.`);
    fees.forEach((fee: any) => {
        console.log(`Fee ID: ${fee.id} | Total: ${fee.totalAmount} | Pending: ${fee.pendingAmount} | Status: ${fee.status}`);
        if (fee.installments && fee.installments.length > 0) {
            console.log(`   -> Has ${fee.installments.length} installments:`);
            fee.installments.forEach((inst: any) => {
                console.log(`      - ID: ${inst.id} | Amount: ${inst.amount} | Due: ${inst.dueDate} | Status: ${inst.status} | Order: ${inst.installmentOrder}`);
            });
        } else {
            console.log(`   -> NO INSTALLMENTS FOUND.`);
        }
    });
}

check();
