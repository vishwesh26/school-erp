const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function syncAllStaff() {
  const sb = createClient(process.env.OLD_SUPABASE_URL, process.env.OLD_SUPABASE_SERVICE_ROLE_KEY);
  const defaultPassword = 'dcpems@123';

  const staffConfigs = [
    { table: 'Teacher', role: 'teacher' },
    { table: 'Admin', role: 'admin' },
    { table: 'Accountant', role: 'accountant' },
    { table: 'Librarian', role: 'librarian' },
    { table: 'Receptionist', role: 'receptionist' }
  ];

  console.log('=== SYNCING ALL STAFF AUTH CREDENTIALS ===');

  for (const cfg of staffConfigs) {
    const { data: rows, error } = await sb.from(cfg.table).select('*');
    if (error) {
      console.error(`Error fetching ${cfg.table}:`, error.message);
      continue;
    }

    console.log(`\nSyncing ${rows.length} ${cfg.table} records...`);
    let updated = 0;
    let created = 0;

    for (const r of rows) {
      const email = r.email || `${r.username.toLowerCase()}@dcpems.internal`;

      try {
        const { data: { user } } = await sb.auth.admin.getUserById(r.id);
        if (user) {
          await sb.auth.admin.updateUserById(r.id, {
            email_confirm: true,
            user_metadata: {
              ...user.user_metadata,
              role: cfg.role,
              temp_password: user.user_metadata?.temp_password || defaultPassword
            }
          });
          // Also ensure password is dcpems@123 if not set
          if (!user.user_metadata?.temp_password) {
            await sb.auth.admin.updateUserById(r.id, {
              password: defaultPassword,
              user_metadata: {
                ...user.user_metadata,
                role: cfg.role,
                temp_password: defaultPassword
              }
            });
          }
          updated++;
        } else {
          // Check by email
          const { data: { users } } = await sb.auth.admin.listUsers();
          const existingByEmail = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

          if (existingByEmail) {
            await sb.auth.admin.updateUserById(existingByEmail.id, {
              password: defaultPassword,
              email_confirm: true,
              user_metadata: { role: cfg.role, temp_password: defaultPassword }
            });
            updated++;
          } else {
            await sb.auth.admin.createUser({
              id: r.id,
              email: email,
              password: defaultPassword,
              email_confirm: true,
              user_metadata: { role: cfg.role, temp_password: defaultPassword }
            });
            created++;
          }
        }
      } catch (err) {
        console.warn(`Error on ${cfg.table} ${r.id}:`, err.message);
      }
    }

    console.log(`${cfg.table} Result: Updated=${updated}, Created=${created}`);
  }

  console.log('\n=== STAFF AUTH SYNC COMPLETED ===');
}

syncAllStaff().catch(console.error);
