const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function dropConstraint() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Drop the unique constraint on Student.rollNumber
        // Based on the error "duplicate key value violates unique constraint "Student_rollNumber_key""
        console.log('Dropping unique constraint "Student_rollNumber_key"...');
        await client.query('ALTER TABLE "Student" DROP CONSTRAINT IF EXISTS "Student_rollNumber_key"');
        console.log('Successfully dropped the unique constraint.');

    } catch (err) {
        console.error('Operation failed:', err);
    } finally {
        await client.end();
    }
}

dropConstraint();
