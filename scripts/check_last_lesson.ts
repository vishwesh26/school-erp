const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('DATABASE_URL is missing!');
    process.exit(1);
}

const client = new Client({
    connectionString: dbUrl,
});

async function main() {
    console.log('Connecting to database...');
    await client.connect();

    try {
        const res = await client.query(`SELECT * FROM "Lesson" ORDER BY id DESC LIMIT 1`);
        if (res.rows.length === 0) {
            console.log("No lessons found.");
        } else {
            const lesson = res.rows[0];
            console.log("Last Lesson Data:");
            console.log("ID:", lesson.id);
            console.log("Name:", lesson.name);
            console.log("StartTime (Raw from DB):", lesson.startTime);
            console.log("EndTime (Raw from DB):", lesson.endTime);
            // Check type
            console.log("Type of startTime:", typeof lesson.startTime);

            // Simulate Frontend Logic
            const isoString = new Date(lesson.startTime).toISOString();
            console.log("toISOString:", isoString);

        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

main();
