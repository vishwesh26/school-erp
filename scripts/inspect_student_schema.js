const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectSchema() {
  console.log("Inspecting Student table schema...");
  
  // We can't easily query information_schema via the Supabase client without an RPC.
  // But we can try to insert a duplicate to check for unique constraints.
  // Alternatively, we can use the `postgres` library if we had a connection string.
  
  // Let's try to fetch one student and see the structure again.
  const { data, error } = await supabase.from('Student').select('*').limit(1);
  if (error) {
    console.error("Error fetching student:", error);
    return;
  }
  console.log("Student structure:", data[0]);

  // Try to find if there's any RPC for schema info
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_table_info', { table_name: 'Student' });
  if (rpcError) {
    console.log("RPC get_table_info failed (expected if not exists).");
  } else {
    console.log("Table Info:", rpcData);
  }
}

inspectSchema();
