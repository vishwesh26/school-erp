const { Client } = require('pg');
require("dotenv").config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function migrate() {
  console.log("Connecting to database for migration...");
  try {
    await client.connect();
    console.log("Connected. Adding certificate fields to Student table...");

    const columns = [
      { name: 'motherName', type: 'text' },
      { name: 'aadharNo', type: 'text' },
      { name: 'placeOfBirth', type: 'text' },
      { name: 'taluka', type: 'text' },
      { name: 'district', type: 'text' },
      { name: 'nationality', type: 'text' },
      { name: 'religion', type: 'text' },
      { name: 'caste', type: 'text' },
      { name: 'isST', type: 'text' },
      { name: 'classAdmitted', type: 'text' },
      { name: 'lastDateAttendance', type: 'timestamp' },
      { name: 'examTaken', type: 'text' },
      { name: 'examResult', type: 'text' },
      { name: 'isFailed', type: 'text' },
      { name: 'qualifiedPromotion', type: 'text' },
      { name: 'duesPaidUpTo', type: 'text' },
      { name: 'feeConcession', type: 'text' },
      { name: 'workingDays', type: 'text' },
      { name: 'presentDays', type: 'text' },
      { name: 'isNcc', type: 'text' },
      { name: 'extraCurricular', type: 'text' },
      { name: 'conduct', type: 'text' },
      { name: 'dateApplication', type: 'timestamp' },
      { name: 'dateIssue', type: 'timestamp' },
      { name: 'reasonLeaving', type: 'text' },
      { name: 'remarks', type: 'text' },
      { name: 'stateStudentId', type: 'text' },
      { name: 'pen', type: 'text' },
      { name: 'apaarId', type: 'text' },
    ];

    for (const col of columns) {
      console.log(`Adding column: ${col.name}...`);
      try {
        await client.query(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type};`);
      } catch (err) {
        if (err.code === '42701') {
          console.log(`Column ${col.name} already exists.`);
        } else {
          throw err;
        }
      }
    }

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
