
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function checkColumns() {
    try {
        await client.connect();
        // Get columns for Student table
        const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Student';
    `);
        console.log("Student Columns:", res.rows.map(r => r.column_name));
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

checkColumns();
