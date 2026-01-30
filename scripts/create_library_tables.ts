
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function createTables() {
  try {
    await client.connect();
    console.log("Connected to DB.");

    // 1. Create Book Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Book" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "author" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Book table ensured.");

    // 2. Create BookIssue Table
    // Using TEXT for studentId matches the UUID string from Supabase Auth
    await client.query(`
      CREATE TABLE IF NOT EXISTS "BookIssue" (
        "id" SERIAL PRIMARY KEY,
        "bookId" INTEGER REFERENCES "Book"("id") ON DELETE CASCADE,
        "studentId" TEXT REFERENCES "Student"("id") ON DELETE CASCADE,
        "issueDate" TIMESTAMP DEFAULT NOW(),
        "dueDate" TIMESTAMP NOT NULL,
        "returnDate" TIMESTAMP,
        "status" TEXT NOT NULL DEFAULT 'ISSUED',
        "fineAmount" DECIMAL DEFAULT 0
      );
    `);
    console.log("BookIssue table ensured.");

    // 3. Seed Data
    // Check if books exist
    const bookCheck = await client.query('SELECT count(*) FROM "Book"');
    if (bookCheck.rows[0].count === '0') {
        console.log("Seeding Books...");
        const books = [
            ['Harry Potter and the Sorcerers Stone', 'J.K. Rowling'],
            ['The Hobbit', 'J.R.R. Tolkien'],
            ['1984', 'George Orwell'],
            ['The Great Gatsby', 'F. Scott Fitzgerald'],
            ['Clean Code', 'Robert C. Martin']
        ];
        
        for (const b of books) {
            await client.query('INSERT INTO "Book" (title, author) VALUES ($1, $2)', b);
        }
        console.log("Books seeded.");

        // Issue a book to the sample student (from previous step check: ef853ee6...)
        // Fetch a student ID dynamically to be safe
        const studentRes = await client.query('SELECT id FROM "Student" LIMIT 1');
        if (studentRes.rows.length > 0) {
            const studentId = studentRes.rows[0].id;
            const bookRes = await client.query('SELECT id FROM "Book" LIMIT 1');
            const bookId = bookRes.rows[0].id; // Harry Potter

            // Issue it (Overdue)
            await client.query(`
                INSERT INTO "BookIssue" ("bookId", "studentId", "issueDate", "dueDate", "status")
                VALUES ($1, $2, NOW() - INTERVAL '30 days', NOW() - INTERVAL '15 days', 'OVERDUE')
            `, [bookId, studentId]);
             console.log(`Seeded overdue book for student ${studentId}`);
        }
    } else {
        console.log("Data already exists, skipping seed.");
    }

  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    await client.end();
  }
}

createTables();
