
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function setup() {
    try {
        await client.connect();
        console.log('Connected to database');

        // 1. Create Ledger Groups
        await client.query(`
      CREATE TABLE IF NOT EXISTS "LedgerGroup" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL, -- ASSET, LIABILITY, INCOME, EXPENSE, EQUITY
        "isSystem" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Created LedgerGroup table');

        // 2. Create Ledgers
        await client.query(`
      CREATE TABLE IF NOT EXISTS "Ledger" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "groupId" INTEGER REFERENCES "LedgerGroup"("id") ON DELETE RESTRICT,
        "openingBalance" DECIMAL(15,2) DEFAULT 0,
        "openingBalanceType" TEXT NOT NULL, -- DEBIT, CREDIT
        "currentBalance" DECIMAL(15,2) DEFAULT 0,
        "isSystem" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Created Ledger table');

        // 3. Create Vouchers
        await client.query(`
      CREATE TABLE IF NOT EXISTS "Voucher" (
        "id" SERIAL PRIMARY KEY,
        "voucherNumber" TEXT UNIQUE NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "type" TEXT NOT NULL, -- RECEIPT, PAYMENT, CONTRA, JOURNAL
        "narration" TEXT,
        "totalAmount" DECIMAL(15,2) DEFAULT 0,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Created Voucher table');

        // 4. Create Voucher Entries
        await client.query(`
      CREATE TABLE IF NOT EXISTS "VoucherEntry" (
        "id" SERIAL PRIMARY KEY,
        "voucherId" INTEGER REFERENCES "Voucher"("id") ON DELETE CASCADE,
        "ledgerId" INTEGER REFERENCES "Ledger"("id") ON DELETE RESTRICT,
        "amount" DECIMAL(15,2) NOT NULL,
        "type" TEXT NOT NULL, -- DEBIT, CREDIT
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Created VoucherEntry table');

        // Add indexes
        await client.query(`CREATE INDEX IF NOT EXISTS "idx_ledger_group" ON "Ledger"("groupId");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "idx_voucher_entry_voucher" ON "VoucherEntry"("voucherId");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "idx_voucher_entry_ledger" ON "VoucherEntry"("ledgerId");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "idx_voucher_date" ON "Voucher"("date");`);

        console.log('Setup completed successfully');
    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        await client.end();
    }
}

setup();
