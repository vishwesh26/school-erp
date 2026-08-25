const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

async function addPasswordColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL database.");

    await client.query(`
      ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "password" TEXT;
    `);
    console.log("Column 'password' added successfully to 'Student' table!");

    // Check count of students with empty password
    const countRes = await client.query(`
      SELECT COUNT(*) FROM "Student" WHERE "password" IS NULL OR "password" = '';
    `);
    console.log(`Students with empty password: ${countRes.rows[0].count}`);
  } catch (err) {
    console.error("Error adding password column:", err.message);
  } finally {
    await client.end();
  }
}

addPasswordColumn();
