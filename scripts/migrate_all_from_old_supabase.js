const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const oldSupabase = createClient(
  process.env.OLD_SUPABASE_URL,
  process.env.OLD_SUPABASE_SERVICE_ROLE_KEY
);

const newSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateTable(tableName, pkey = 'id', batchSize = 500) {
  process.stdout.write(`Migrating [${tableName}]... `);
  let from = 0;
  let total = 0;

  while (true) {
    const { data, error } = await oldSupabase
      .from(tableName)
      .select('*')
      .order(pkey, { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) {
      console.log(`\n❌ Error fetching ${tableName} at offset ${from}:`, error.message);
      break;
    }

    if (!data || data.length === 0) {
      break;
    }

    // Upsert into new Supabase
    const { error: insertError } = await newSupabase
      .from(tableName)
      .upsert(data, { onConflict: pkey });

    if (insertError) {
      console.log(`\n❌ Error inserting ${tableName} at offset ${from}:`, insertError.message);
      break;
    }

    total += data.length;
    from += batchSize;

    if (total % 5000 === 0) {
      process.stdout.write(`${total}... `);
    }

    if (data.length < batchSize) {
      break;
    }
  }

  console.log(`✅ Done! Total: ${total}`);
  return total;
}

// Special handler for junction table _SubjectToTeacher which has composite PK (A, B)
async function migrateJunctionTable(tableName) {
  process.stdout.write(`Migrating [${tableName}]... `);
  const { data, error } = await oldSupabase.from(tableName).select('*');
  if (error) {
    console.log(`\n❌ Error fetching ${tableName}:`, error.message);
    return;
  }
  if (!data || data.length === 0) {
    console.log(`✅ Done! (0 records)`);
    return;
  }
  const { error: insertError } = await newSupabase.from(tableName).upsert(data);
  if (insertError) {
    console.log(`\n❌ Error inserting ${tableName}:`, insertError.message);
  } else {
    console.log(`✅ Done! Total: ${data.length}`);
  }
}

async function migrateAuthUsers() {
  console.log('\n--- Syncing Supabase Auth Users ---');
  let page = 1;
  let synced = 0;

  while (true) {
    const { data, error } = await oldSupabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) {
      console.error('Error listing old auth users:', error.message);
      break;
    }
    const users = data?.users || [];
    if (users.length === 0) break;

    for (const u of users) {
      if (!u.email) continue;
      const pwd = u.user_metadata?.temp_password || 'dcpems@123';
      try {
        const { error: createErr } = await newSupabase.auth.admin.createUser({
          id: u.id,
          email: u.email,
          password: pwd,
          email_confirm: true,
          user_metadata: u.user_metadata || {},
        });
        if (!createErr || createErr.message.includes('already exists')) {
          synced++;
        }
      } catch (e) {}
    }

    process.stdout.write(`Synced ${synced} auth users...\r`);
    page++;
    if (users.length < 100) break;
  }
  console.log(`\n✅ Auth users synced: ${synced}`);
}

async function startMigration() {
  console.log('========================================================');
  console.log('DIRECT SUPABASE-TO-SUPABASE MIGRATION');
  console.log('FROM:', process.env.OLD_SUPABASE_URL);
  console.log('TO:  ', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('========================================================\n');

  // Stage 1: Foundation
  await migrateTable('Grade', 'id');
  await migrateTable('AcademicYear', 'id');
  await migrateTable('StudentStatus', 'id');
  await migrateTable('FeeCategory', 'id');
  await migrateTable('LedgerGroup', 'id');

  // Stage 2: Staff & Profiles
  await migrateTable('Admin', 'id');
  await migrateTable('Teacher', 'id');
  await migrateTable('Accountant', 'id');
  await migrateTable('Librarian', 'id');
  await migrateTable('Receptionist', 'id');
  await migrateTable('Parent', 'id');

  // Stage 3: Classes & Subjects
  await migrateTable('Class', 'id');
  await migrateTable('Subject', 'id');
  await migrateJunctionTable('_SubjectToTeacher');

  // Stage 4: Academics
  await migrateTable('Lesson', 'id');
  await migrateTable('Exam', 'id');
  await migrateTable('Assignment', 'id');
  await migrateTable('Result', 'id');
  await migrateTable('StudentHistory', 'id');

  // Stage 5: Fees & Finance
  await migrateTable('StudentFee', 'id');
  await migrateTable('Installment', 'id');
  await migrateTable('Payment', 'id');
  await migrateTable('Expense', 'id');
  await migrateTable('Ledger', 'id');
  await migrateTable('Voucher', 'id');
  await migrateTable('VoucherEntry', 'id');

  // Stage 6: Operations & Library
  await migrateTable('Announcement', 'id');
  await migrateTable('Event', 'id');
  await migrateTable('Book', 'id');
  await migrateTable('BookIssue', 'id');
  await migrateTable('AdmissionInquiry', 'id');

  // Stage 7: Attendance (Large Table ~144k rows)
  console.log('\n--- Migrating Attendance (144k+ rows) ---');
  await migrateTable('Attendance', 'id', 1000);

  // Stage 8: Sync Auth Users
  await migrateAuthUsers();

  console.log('\n========================================================');
  console.log('🎉 ALL TABLES & AUTH MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('========================================================');
}

startMigration().catch(console.error);
