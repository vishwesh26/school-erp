
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function updateSchema() {
    try {
        await client.connect();
        console.log("Connected to DB.");

        // Add columns if they don't exist
        await client.query(`
      ALTER TABLE "Book"
      ADD COLUMN IF NOT EXISTS "accession_no" TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS "category" TEXT,
      ADD COLUMN IF NOT EXISTS "rack_no" TEXT,
      ADD COLUMN IF NOT EXISTS "total_copies" INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "available_copies" INTEGER DEFAULT 1;
    `);

        // Update existing records to have some default values
        await client.query(`
        UPDATE "Book" SET 
        "total_copies" = 5, 
        "available_copies" = 4 
        WHERE "total_copies" IS NULL OR "total_copies" = 1;
    `);

        console.log("Book table schema updated.");

    } catch (err) {
        console.error("Error updating schema:", err);
    } finally {
        await client.end();
    }
}

updateSchema();
