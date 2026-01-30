const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function checkConstraints() {
    try {
        await client.connect();
        console.log('Connected to database');

        const res = await client.query(`
            SELECT
                tc.constraint_name, 
                tc.table_name, 
                kcu.column_name, 
                tc.constraint_type
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'UNIQUE' AND tc.table_name = 'Student';
        `);

        console.log('Unique constraints on Student table:');
        console.table(res.rows);

    } catch (err) {
        console.error('Operation failed:', err);
    } finally {
        await client.end();
    }
}

checkConstraints();
