
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Checking for Book and BookIssue tables...");

    // Check Book
    const { data: books, error: bookError } = await supabase.from('Book').select('*').limit(1);
    if (bookError) console.log("Book table error:", bookError.message);
    else console.log("Book table exists. Sample:", books[0]);

    // Check BookIssue
    const { data: issues, error: issueError } = await supabase.from('BookIssue').select('*').limit(1);
    if (issueError) console.log("BookIssue table error:", issueError.message);
    else console.log("BookIssue table exists. Sample:", issues[0]);
}

inspect();
