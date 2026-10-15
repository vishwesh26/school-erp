const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testInsert() {
  const payload = {
    title: 'Test Temp Assignment',
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    lessonId: null,
    classId: 16,
    subjectId: 9,
    teacherId: null,
    description: 'Testing insert capability',
    pdfUrl: null
  };

  const { data, error } = await supabase.from('Assignment').insert(payload).select();
  console.log("Insert result:", { data, error });
  if (data && data[0]) {
    await supabase.from('Assignment').delete().eq('id', data[0].id);
    console.log("Cleaned up test record.");
  }
}

testInsert();
