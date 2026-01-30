"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { StudentPromotionSchema } from "./formValidationSchemas";

export const getAcademicYears = async () => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data, error } = await supabase
        .from('AcademicYear')
        .select('*')
        .order('startDate', { ascending: false });
    return { data, error };
};

export const getCurrentAcademicYear = async () => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data, error } = await supabase
        .from('AcademicYear')
        .select('*')
        .eq('isCurrent', true)
        .single();
    return { data, error };
};

export const getStudentsForPromotion = async (academicYearId: number, classId?: number) => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    let query = supabase
        .from('StudentHistory')
        .select(`
            id,
            status,
            remarks,
            gradeId,
            classId,
            Student (
                id,
                name,
                surname,
                rollNumber,
                username
            ),
            Grade (
                id,
                level
            ),
            Class (
                id,
                name
            )
        `)
        .eq('academicYearId', academicYearId);

    if (classId) {
        query = query.eq('classId', classId);
    }

    const { data, error } = await query;
    return { data, error };
};

export const promoteStudents = async (data: StudentPromotionSchema) => {
    // We use service role key for admin auth updates during promotion
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const { previousYearId, nextYearId, students } = data;

        for (const update of students) {
            // 1. Update previous year record status
            const { error: updatePrevError } = await supabase
                .from('StudentHistory')
                .update({
                    status: update.status,
                    remarks: update.remarks
                })
                .eq('studentId', update.studentId)
                .eq('academicYearId', previousYearId);

            if (updatePrevError) throw updatePrevError;

            // 2. Create next year record if applicable
            if (update.status === 'Promoted' || update.status === 'Repeat') {
                const { error: insertError } = await supabase
                    .from('StudentHistory')
                    .upsert({
                        studentId: update.studentId,
                        academicYearId: nextYearId,
                        gradeId: update.nextGradeId,
                        classId: update.nextClassId,
                        rollNumber: update.nextRollNumber,
                        username: update.nextUsername,
                        status: 'Active'
                    }, { onConflict: 'studentId,academicYearId' });

                if (insertError) throw insertError;

                // 3. Update the main Student table to reflect current state
                const { error: studentUpdateError } = await supabase
                    .from('Student')
                    .update({
                        gradeId: update.nextGradeId,
                        classId: update.nextClassId,
                        rollNumber: update.nextRollNumber,
                        username: update.nextUsername
                    })
                    .eq('id', update.studentId);

                if (studentUpdateError) throw studentUpdateError;

                // 4. Update the student's email in Supabase Auth if it's the internal dummy email
                // This ensures they can login with their new roll-based username
                if (update.nextUsername) {
                    const nextEmail = `${update.nextUsername.toLowerCase()}@dcpems.internal`;
                    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(update.studentId, {
                        email: nextEmail,
                        email_confirm: true
                    });
                    if (authUpdateError) {
                        console.error(`Failed to update auth email for ${update.studentId}:`, authUpdateError.message);
                        // We continue because the DB is updated, but this should be investigated if it fails
                    }
                }
            } else if (update.status === 'Passed Out' || update.status === 'Transferred') {
                // Set student as inactive in the main table if needed
                // For now just nullify their class/grade to show they aren't in current session
                await supabase
                    .from('Student')
                    .update({
                        gradeId: null,
                        classId: null
                    })
                    .eq('id', update.studentId);
            }
        }

        revalidatePath("/list/promotion");
        return { success: true, error: false };
    } catch (err) {
        console.error("Promotion Error:", err);
        return { success: false, error: true };
    }
};

export const createAcademicYear = async (data: { name: string, startDate: string, endDate: string, isCurrent: boolean }) => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    if (data.isCurrent) {
        // Set all others to false
        await supabase.from('AcademicYear').update({ isCurrent: false }).neq('id', 0);
    }

    const { data: year, error } = await supabase
        .from('AcademicYear')
        .insert(data)
        .select()
        .single();

    revalidatePath("/list/promotion");
    return { data: year, error };
};
