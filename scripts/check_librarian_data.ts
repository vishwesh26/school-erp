
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function checkLibrarians() {
    try {
        await client.connect();
        // Query Librarian table
        const res = await client.query('SELECT * FROM "Librarian"');
        console.log("Librarian Table Rows:", res.rows);

        // Also check if user exists in keys or just logic? We can't query keys here easily.
        // Just debugging table state.
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

checkLibrarians();
