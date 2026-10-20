const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function syncAllTeachersInOldDb() {
  const sb = createClient(process.env.OLD_SUPABASE_URL, process.env.OLD_SUPABASE_SERVICE_ROLE_KEY);

  const { data: teachers, error: tErr } = await sb.from('Teacher').select('id, username, email, phone, name, surname');
  if (tErr) {
    console.error('Teacher fetch error:', tErr);
    return;
  }
  console.log(`Total teachers in Teacher table: ${teachers.length}`);

  let updated = 0;
  let created = 0;
  let errors = 0;

  for (const t of teachers) {
    const email = t.email || `${t.username.toLowerCase()}@dcpems.internal`;
    const defaultPassword = 'dcpems@123';

    try {
      const { data: { user }, error: gErr } = await sb.auth.admin.getUserById(t.id);
      if (user) {
        // User exists, update password and metadata
        const { error: uErr } = await sb.auth.admin.updateUserById(t.id, {
          password: defaultPassword,
          email_confirm: true,
          user_metadata: {
            role: 'teacher',
            temp_password: defaultPassword
          }
        });
        if (uErr) {
          console.warn(`Failed to update teacher ${t.id} (${email}):`, uErr.message);
          errors++;
        } else {
          updated++;
        }
      } else {
        // User does not exist, create auth user with same ID
        const { data: cData, error: cErr } = await sb.auth.admin.createUser({
          id: t.id,
          email: email,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: {
            role: 'teacher',
            temp_password: defaultPassword
          }
        });
        if (cErr) {
          console.warn(`Failed to create teacher auth ${t.id} (${email}):`, cErr.message);
          errors++;
        } else {
          created++;
        }
      }
    } catch (e) {
      console.error(`Exception on teacher ${t.id}:`, e.message);
      errors++;
    }
  }

  console.log({ total: teachers.length, updated, created, errors });
}

syncAllTeachersInOldDb().catch(console.error);
