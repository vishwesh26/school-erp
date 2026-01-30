const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectAttendance() {
  console.log("Inspecting Attendance table...");
  
  // Fetch sample records
  const { data, error } = await supabase
    .from("Attendance")
    .select('*')
    .limit(5);

  if (error) {
    console.error("Error fetching attendance:", error.message);
  } else {
    console.log("Sample records:", JSON.stringify(data, null, 2));
  }

  // Count attendance for a student (pick first student found in attendance)
  if (data && data.length > 0) {
      const studentId = data[0].studentId;
      console.log(`\nAnalyzing attendance for studentId: ${studentId}`);
      
      const { data: records, error: countError } = await supabase
        .from("Attendance")
        .select('present')
        .eq('studentId', studentId);

      if (countError) {
          console.error("Error counting:", countError.message);
      } else {
          const totalDays = records.length;
          const presentDays = records.filter(r => r.present).length;
          console.log(`Total Records: ${totalDays}`);
          console.log(`Present Days: ${presentDays}`);
      }
  }
}

inspectAttendance();
