const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateRollNumbers() {
  console.log("Starting Roll Number Migration...");

  // 1. Fetch all students with their class info
  const { data: students, error: sError } = await supabase
    .from('Student')
    .select('id, name, surname, rollNumber, username, classId, class:Class(name)');

  if (sError) {
    console.error("Error fetching students:", sError);
    return;
  }

  console.log(`Found ${students.length} students to process.`);

  for (const student of students) {
    let newRollNumber = student.rollNumber;
    
    // Try to extract 3-digit sequence from existing roll number (e.g., SCH-25-07-A-012 -> 012)
    const match = student.rollNumber?.match(/(\d{3})$/);
    if (match) {
        newRollNumber = match[1];
    } else if (student.rollNumber && student.rollNumber.length > 0) {
        // Fallback for non-standard roll numbers (e.g. "S1001" -> "001")
        const numOnly = student.rollNumber.replace(/\D/g, "");
        if (numOnly.length >= 3) {
            newRollNumber = numOnly.slice(-3);
        } else {
            newRollNumber = numOnly.padStart(3, '0');
        }
    } else {
        newRollNumber = "000"; // Should not happen with valid data
    }

    const className = student.class?.name || "Unknown";
    const newUsername = `${className}-${newRollNumber}`;

    console.log(`Updating Student ${student.name} ${student.surname}:`);
    console.log(`  Old RollNo: ${student.rollNumber} -> New RollNo: ${newRollNumber}`);
    console.log(`  Old Username: ${student.username} -> New Username: ${newUsername}`);

    const { error: updateError } = await supabase
      .from('Student')
      .update({
        rollNumber: newRollNumber,
        username: newUsername
      })
      .eq('id', student.id);

    if (updateError) {
      console.error(`  [ERROR] Failed to update student ${student.id}:`, updateError.message);
    }
  }

  console.log("Migration Complete.");
}

migrateRollNumbers();
