const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkGrade5() {
    console.log("Checking Grade 5 students...");

    // 1. Find Grade ID for level 5
    const { data: grades, error: gError } = await supabase
        .from('Grade')
        .select('*')
        .eq('level', 5);

    if (gError) {
        console.error("Error fetching grade:", gError);
        return;
    }

    if (!grades || grades.length === 0) {
        console.log("Grade 5 not found in Grade table.");
        // List all grades to help
        const { data: allGrades } = await supabase.from('Grade').select('*');
        console.log("Available grades:", allGrades);
        return;
    }

    const grade5 = grades[0];
    console.log("Found Grade 5:", grade5);

    // 2. Count students in this grade
    const { count, error: sError } = await supabase
        .from('Student')
        .select('*', { count: 'exact', head: true })
        .eq('gradeId', grade5.id);

    if (sError) {
        console.error("Error counting students:", sError);
    } else {
        console.log(`Number of students in Grade 5 (ID: ${grade5.id}):`, count);
    }
    // 3. Find any grade with students
    const { data: allStudents } = await supabase.from('Student').select('gradeId');
    if (allStudents && allStudents.length > 0) {
        const gradeCounts: { [key: number]: number } = {};
        allStudents.forEach((s: any) => {
            gradeCounts[s.gradeId] = (gradeCounts[s.gradeId] || 0) + 1;
        });
        console.log("Student counts by Grade ID:", gradeCounts);
    } else {
        console.log("No students found in the entire database.");
    }
}

checkGrade5();
