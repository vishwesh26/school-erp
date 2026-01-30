
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function createLibrarianTable() {
    try {
        await client.connect();
        console.log("Connected to DB.");

        // Create Librarian Table
        // Enum "UserSex" ('MALE', 'FEMALE') already exists in Supabase usually if other tables use it.
        // If not, we use TEXT and check constraint or just TEXT. Using TEXT to be safe and compatible with existing patterns.
        await client.query(`
      CREATE TABLE IF NOT EXISTS "Librarian" (
        "id" TEXT PRIMARY KEY,
        "username" TEXT UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "surname" TEXT NOT NULL,
        "email" TEXT UNIQUE,
        "phone" TEXT UNIQUE,
        "address" TEXT,
        "img" TEXT,
        "bloodType" TEXT,
        "sex" "UserSex" NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "birthday" TIMESTAMP NOT NULL
      );
    `);

        console.log("Librarian table created.");

    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        await client.end();
    }
}

createLibrarianTable();
