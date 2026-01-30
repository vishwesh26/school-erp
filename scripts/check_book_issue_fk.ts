
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkConstraints() {
    console.log("Checking BookIssue constraints with specific alias...");

    const { data: testData, error: testError } = await supabase
        .from('BookIssue')
        .select('*, student:Student(name, surname)')
        .limit(1);

    if (testError) {
        console.error("Join Test Failed:", testError);
    } else {
        console.log("Join Test Success:", testData);
    }
}

checkConstraints();
