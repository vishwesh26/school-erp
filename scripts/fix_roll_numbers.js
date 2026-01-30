const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRollNumbers() {
  const { data: students, error } = await supabase
    .from('Student')
    .select('id, username, rollNumber');

  if (error) {
    console.error("Error fetching students:", error);
    return;
  }

  console.log(`Found ${students.length} students.`);

  for (const student of students) {
    // If username looks like a generated roll number (SCH-...) and rollNumber is different or null
    if (student.username && student.username.startsWith('SCH-') && student.rollNumber !== student.username) {
      console.log(`Updating student ${student.id}: ${student.rollNumber} -> ${student.username}`);
      const { error: updateError } = await supabase
        .from('Student')
        .update({ rollNumber: student.username })
        .eq('id', student.id);
      
      if (updateError) {
        console.error(`Failed to update student ${student.id}:`, updateError);
      }
    }
  }
}

fixRollNumbers();
