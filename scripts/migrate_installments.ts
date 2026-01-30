
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log("Creating Installment table...");

    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS "Installment" (
      "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      "studentFeeId" INTEGER REFERENCES "StudentFee"("id") ON DELETE CASCADE,
      "amount" DECIMAL(10, 2) NOT NULL,
      "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
      "status" TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
      "installmentOrder" INTEGER NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

    // We also need to enable RLS and policies, but for now let's just create the table.
    // Assuming "StudentFee" uses integer ID.

    const { error } = await supabase.rpc('execute_sql', { sql_query: createTableQuery });

    // If RPC execute_sql is not available (often not exposed directly), we might need to use direct PG connection 
    // or use the standard query interface if we had a query runner. 
    // Since we don't have direct SQL execution capability via JS client without a stored procedure,
    // I will rely on the fact that previous migrations used 'pg' or similar? 
    // Wait, previous migration `scripts/migrate_accountant_tables.ts` used `pg` Client?
    // Let me check `scripts/migrate_accountant_tables.ts` content I saw earlier? 
    // Re-reading summary: "A migration script ... was created ... Permissions: GRANT ALL statements were added".
    // It likely used `pg` library.

    console.log("Table creation logic via Supabase Client (RPC) might fail if execute_sql not set up.");
    console.log("Switching to 'pg' library pattern validation.");
}

// Rewriting to use 'pg' for direct DDL execution
const { Client } = require('pg');

async function migratePg() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected to database via pg.");

        const query = `
            CREATE TABLE IF NOT EXISTS "Installment" (
                "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                "studentFeeId" INTEGER REFERENCES "StudentFee"("id") ON DELETE CASCADE,
                "amount" DECIMAL(10, 2) NOT NULL,
                "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
                "status" TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
                "installmentOrder" INTEGER NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- RLS Policies (Optional but good practice)
            ALTER TABLE "Installment" ENABLE ROW LEVEL SECURITY;

            -- Grant access (Simulating what expected roles need)
            GRANT ALL ON "Installment" TO authenticated;
            GRANT ALL ON "Installment" TO service_role;
            GRANT ALL ON "Installment" TO anon; 
        `;

        await client.query(query);
        console.log("Installment table created successfully!");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

migratePg();
