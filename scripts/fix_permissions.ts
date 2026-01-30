
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function fixPermissions() {
  try {
    await client.connect();
    console.log("Connected to DB.");

    // Grant permissions to Supabase roles
    await client.query(`GRANT ALL ON TABLE "Librarian" TO postgres;`);
    await client.query(`GRANT ALL ON TABLE "Librarian" TO service_role;`);
    await client.query(`GRANT ALL ON TABLE "Librarian" TO authenticated;`);
    await client.query(`GRANT ALL ON TABLE "Librarian" TO anon;`);

    // Enable RLS (Good practice, even if we are flexible for now)
    await client.query(`ALTER TABLE "Librarian" ENABLE ROW LEVEL SECURITY;`);

    // Create Policies
    // 1. Service Role bypasses everything automatically in Supabase usually, but ensuring it has rights.
    // 2. Authenticated users (Admins) need to READ (Select) and probably more if we used client-side. 
    //    But we use Server Actions with Service Role for mutations.
    //    We explicitly need authenticated users to SELECT for the List page.
    
    // Drop existing policies to avoid conflict
    await client.query(`DROP POLICY IF EXISTS "Enable read access for all users" ON "Librarian";`);
    await client.query(`DROP POLICY IF EXISTS "Enable insert for service_role only" ON "Librarian";`); // Example

    // Simple Policy: Allow Read for Authenticated
    await client.query(`
        CREATE POLICY "Enable read access for authenticated users" 
        ON "Librarian" FOR SELECT 
        TO authenticated 
        USING (true);
    `);

    // Simple Policy: Allow All for Service Role (Implicit, but explicit doesn't hurt if we granted to it)
    // Actually, service_role is superuser effectively in Supabase logic (bypass RLS: true).
    
    console.log("Permissions granted and RLS updated.");

  } catch (err) {
    console.error("Error fixing permissions:", err);
  } finally {
    await client.end();
  }
}

fixPermissions();
