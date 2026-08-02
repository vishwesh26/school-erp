const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

async function runSql() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("Connected to database.");

        const sql = `ALTER TABLE "Assignment" ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;`;
        console.log("Executing SQL:", sql);

        await client.query(sql);
        console.log("SQL executed successfully! pdfUrl column added to Assignment table.");

    } catch (err: any) {
        console.error("Error executing SQL:", err.message);
    } finally {
        await client.end();
    }
}

runSql();
