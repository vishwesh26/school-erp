
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function addRollNumber() {
    try {
        await client.connect();
        console.log("Connected to DB...");

        // 1. Add column if not exists
        console.log("Adding rollNumber column...");
        await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Student' AND column_name='rollNumber') THEN
          ALTER TABLE "Student" ADD COLUMN "rollNumber" TEXT;
          ALTER TABLE "Student" ADD CONSTRAINT "Student_rollNumber_key" UNIQUE ("rollNumber");
        END IF;
      END
      $$;
    `);

        // 2. Fetch students without rollNumber
        const res = await client.query(`SELECT id, name, surname FROM "Student" WHERE "rollNumber" IS NULL`);
        const students = res.rows;
        console.log(`Found ${students.length} students to update.`);

        // 3. Update each student with a generated roll number
        // Simple logic: S + Year + Random/Sequence. Since we don't have year easily, just use S + 1000 + index
        let startNum = 1000;

        for (const student of students) {
            const roll = `S${startNum++}`;
            await client.query(`UPDATE "Student" SET "rollNumber" = $1 WHERE id = $2`, [roll, student.id]);
            console.log(`Updated ${student.name} ${student.surname} -> ${roll}`);
        }

        console.log("Migration complete.");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

addRollNumber();
