const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function listTables() {
    try {
        await client.connect();
        console.log('Connected to database');

        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE';
        `);

        console.log('Database Tables:');
        console.log(res.rows.map(r => r.table_name).join(', '));

    } catch (err) {
        console.error('Operation failed:', err);
    } finally {
        await client.end();
    }
}

listTables();
