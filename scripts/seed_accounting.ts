
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function seed() {
    try {
        await client.connect();
        console.log('Connected to database');

        const groups = [
            { name: 'Capital Account', category: 'EQUITY' },
            { name: 'Current Assets', category: 'ASSET' },
            { name: 'Bank Accounts', category: 'ASSET' },
            { name: 'Cash-in-hand', category: 'ASSET' },
            { name: 'Fixed Assets', category: 'ASSET' },
            { name: 'Current Liabilities', category: 'LIABILITY' },
            { name: 'Direct Income', category: 'INCOME' },
            { name: 'Indirect Income', category: 'INCOME' },
            { name: 'Direct Expenses', category: 'EXPENSE' },
            { name: 'Indirect Expenses', category: 'EXPENSE' },
        ];

        console.log('Seeding Groups...');

        const groupMap: Record<string, number> = {};

        for (const g of groups) {
            // Check if exists
            const res = await client.query('SELECT id FROM "LedgerGroup" WHERE name = $1', [g.name]);
            if (res.rows.length === 0) {
                const ins = await client.query(
                    'INSERT INTO "LedgerGroup" (name, category, "isSystem") VALUES ($1, $2, TRUE) RETURNING id',
                    [g.name, g.category]
                );
                groupMap[g.name] = ins.rows[0].id;
                console.log(`Created Group: ${g.name}`);
            } else {
                groupMap[g.name] = res.rows[0].id;
                console.log(`Group Exists: ${g.name}`);
            }
        }

        const ledgers = [
            { name: 'Cash', group: 'Cash-in-hand', type: 'DEBIT' },
            { name: 'Bank Account', group: 'Bank Accounts', type: 'DEBIT' },
            { name: 'Student Fees', group: 'Direct Income', type: 'CREDIT' },
            { name: 'Salary', group: 'Indirect Expenses', type: 'DEBIT' },
            { name: 'Electricity Bill', group: 'Indirect Expenses', type: 'DEBIT' },
            { name: 'Maintenance', group: 'Indirect Expenses', type: 'DEBIT' },
            { name: 'Rent', group: 'Indirect Expenses', type: 'DEBIT' },
            { name: 'General Fund', group: 'Capital Account', type: 'CREDIT' },
        ];

        console.log('Seeding Ledgers...');

        for (const l of ledgers) {
            const groupId = groupMap[l.group];
            if (!groupId) {
                console.error(`Group not found for ledger: ${l.name}`);
                continue;
            }

            const res = await client.query('SELECT id FROM "Ledger" WHERE name = $1', [l.name]);
            if (res.rows.length === 0) {
                await client.query(
                    'INSERT INTO "Ledger" (name, "groupId", "openingBalance", "openingBalanceType", "currentBalance", "isSystem") VALUES ($1, $2, 0, $3, 0, TRUE)',
                    [l.name, groupId, l.type]
                );
                console.log(`Created Ledger: ${l.name}`);
            } else {
                console.log(`Ledger Exists: ${l.name}`);
            }
        }

        console.log('Seeding completed successfully');

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await client.end();
    }
}

seed();
