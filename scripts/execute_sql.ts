
const { Client } = require("pg");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config({ path: ".env" });

async function runSql() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("Connected to database.");

        const sql = fs.readFileSync(path.join(__dirname, "receptionist.sql"), "utf8");
        console.log("Executing SQL...");

        await client.query(sql);
        console.log("SQL executed successfully!");

    } catch (err) {
        console.error("Error executing SQL:", err.message);
    } finally {
        await client.end();
    }
}

runSql();
