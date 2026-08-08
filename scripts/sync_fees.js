const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndSyncFees() {
  console.log("Checking Students and Fee Categories...");

  // 1. Fetch all students
  const { data: students, error: sErr } = await supabase.from('Student').select('id, name, surname, gradeId, classId');
  if (sErr) {
    console.error("Error fetching students:", sErr);
    return;
  }
  console.log(`Total Students found: ${students.length}`);

  // 2. Fetch all FeeCategories
  const { data: categories, error: cErr } = await supabase.from('FeeCategory').select('*');
  if (cErr) {
    console.error("Error fetching categories:", cErr);
    return;
  }
  console.log(`Total Fee Categories found: ${categories.length}`);

  // 3. Fetch all existing StudentFee records
  const { data: existingFees, error: fErr } = await supabase.from('StudentFee').select('studentId, feeCategoryId');
  if (fErr) {
    console.error("Error fetching existing fees:", fErr);
    return;
  }
  console.log(`Total StudentFee records currently: ${existingFees.length}`);

  const existingMap = new Set(existingFees.map(f => `${f.studentId}_${f.feeCategoryId}`));

  let insertedCount = 0;
  for (const student of students) {
    // Categories relevant for this student (matching gradeId or global gradeId is null)
    const matchingCategories = categories.filter(c => c.gradeId === null || c.gradeId === student.gradeId);
    
    for (const category of matchingCategories) {
      const key = `${student.id}_${category.id}`;
      if (!existingMap.has(key)) {
        console.log(`Adding missing fee record for student ${student.name} ${student.surname} (ID: ${student.id}) in category "${category.name}"`);
        
        const pendingAmount = Number(category.baseAmount);
        const { error: insertErr } = await supabase.from('StudentFee').insert({
          studentId: student.id,
          feeCategoryId: category.id,
          totalAmount: category.baseAmount,
          discount: 0,
          paidAmount: 0,
          pendingAmount: pendingAmount,
          status: 'PENDING',
          dueDate: new Date().toISOString()
        });

        if (insertErr) {
          console.error(`Failed to insert fee for student ${student.id}:`, insertErr);
        } else {
          insertedCount++;
        }
      }
    }
  }

  console.log(`Sync Complete. Added ${insertedCount} missing StudentFee records.`);
}

checkAndSyncFees();
