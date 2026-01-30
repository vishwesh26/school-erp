const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testFetch() {
  console.log("Testing student fetch with all fields...");
  
  // Try to fetch just one student to see if columns exist
  const { data, error } = await supabase
    .from("Student")
    .select(`
      id, name, surname, rollNumber, birthday, address,
      motherName, aadharNo, placeOfBirth, taluka, district,
      nationality, religion, caste, isST, classAdmitted,
      lastDateAttendance, examTaken, examResult, isFailed,
      qualifiedPromotion, duesPaidUpTo, feeConcession,
      workingDays, presentDays, isNcc, extraCurricular,
      conduct, dateApplication, dateIssue, reasonLeaving,
      remarks, stateStudentId, pen, apaarId
    `)
    .limit(1);

  if (error) {
    console.error("Fetch failed!", error.message);
    if (error.message.includes("column")) {
      console.log("CONFIRMED: Missing columns. User likely hasn't run the SQL script.");
    }
  } else {
    console.log("Fetch successful! Columns exist.");
    console.log("Sample student name:", data[0]?.name);
  }
}

testFetch();
