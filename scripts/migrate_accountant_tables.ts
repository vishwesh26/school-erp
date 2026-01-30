const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL is not defined in .env");
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase updates sometimes from local
});

const sql = `
-- Create Accountant Table
CREATE TABLE IF NOT EXISTS "Accountant" (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    img TEXT,
    "bloodType" TEXT,
    sex TEXT,
    birthday TIMESTAMP WITH TIME ZONE
);

-- Create FeeCategory
CREATE TABLE IF NOT EXISTS "FeeCategory" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    "baseAmount" DECIMAL(10, 2) NOT NULL,
    "gradeId" INTEGER REFERENCES "Grade"(id)
);

-- Create StudentFee (Assignment)
CREATE TABLE IF NOT EXISTS "StudentFee" (
    id SERIAL PRIMARY KEY,
    "studentId" TEXT REFERENCES "Student"(id),
    "feeCategoryId" INTEGER REFERENCES "FeeCategory"(id),
    "totalAmount" DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    "paidAmount" DECIMAL(10, 2) DEFAULT 0,
    "pendingAmount" DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'PENDING',
    "dueDate" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Payment
CREATE TABLE IF NOT EXISTS "Payment" (
    id SERIAL PRIMARY KEY,
    "studentFeeId" INTEGER REFERENCES "StudentFee"(id),
    amount DECIMAL(10, 2) NOT NULL,
    "paymentDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "paymentMode" TEXT NOT NULL,
    "receiptNumber" TEXT UNIQUE NOT NULL,
    remarks TEXT
);

-- Create Expense
CREATE TABLE IF NOT EXISTS "Expense" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category TEXT
);

-- Grant Permissions
GRANT ALL ON TABLE "Accountant", "FeeCategory", "StudentFee", "Payment", "Expense" TO "anon", "authenticated", "service_role";
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO "anon", "authenticated", "service_role";
`;

async function migrate() {
    try {
        await client.connect();
        console.log("Connected to database...");

        await client.query(sql);
        console.log("Migration executed successfully: All tables created.");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

migrate();
