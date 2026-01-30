"use server";

import { createClient } from "@supabase/supabase-js";
import { FeeCategorySchema, StudentFeeSchema, ExpenseSchema, BulkFeeSchema } from "./formValidationSchemas";
import { revalidatePath } from "next/cache";
import { createVoucher } from "./accountingActions";

type CurrentState = { success: boolean; error: boolean };

export const getAccountantStats = async () => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    // Total Fees Collected Today
    const { data: paymentsToday } = await supabase.from('Payment')
        .select('amount')
        .gte('paymentDate', today);
    const totalToday = (paymentsToday as { amount: number }[] | null)?.reduce((sum: number, p) => sum + Number(p.amount), 0) || 0;

    // Total Fees Collected This Month
    const { data: paymentsMonth } = await supabase.from('Payment')
        .select('amount')
        .gte('paymentDate', firstDayOfMonth);
    const totalMonth = (paymentsMonth as { amount: number }[] | null)?.reduce((sum: number, p) => sum + Number(p.amount), 0) || 0;

    // Total Pending Fees
    const { data: pendingFees } = await supabase.from('StudentFee')
        .select('pendingAmount');
    const totalPending = (pendingFees as { pendingAmount: number }[] | null)?.reduce((sum: number, f) => sum + Number(f.pendingAmount), 0) || 0;

    // Students with Due Fees
    const { count: dueCount } = await supabase.from('StudentFee')
        .select('*', { count: 'exact', head: true })
        .gt('pendingAmount', 0);

    // Total Expenses This Month (Monthly)
    const { data: expensesMonth } = await supabase.from('Expense')
        .select('amount')
        .gte('date', firstDayOfMonth);
    const totalExpenses = (expensesMonth as { amount: number }[] | null)?.reduce((sum: number, e) => sum + Number(e.amount), 0) || 0;

    return {
        totalToday,
        totalMonth,
        totalPending,
        dueCount: dueCount || 0,
        totalExpenses
    };
};

export const getStudentFees = async (page: number, filters?: { search?: string, gradeId?: string | number, classId?: string | number, status?: string, studentId?: string }) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ITEM_PER_PAGE = 10;

    // Use !inner for student to allow filtering by its columns
    let query = supabase.from('StudentFee')
        .select('*, student:Student!inner(name, surname, rollNumber, classId, gradeId, class:Class(name)), feeCategory:FeeCategory(name)', { count: 'exact' });

    if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,surname.ilike.%${filters.search}%,rollNumber.ilike.%${filters.search}%`, { foreignTable: 'student' });
    }

    if (filters?.gradeId) {
        query = query.eq('student.gradeId', filters.gradeId);
    }

    if (filters?.classId) {
        query = query.eq('student.classId', filters.classId);
    }

    if (filters?.status) {
        query = query.eq('status', filters.status);
    }

    if (filters?.studentId) {
        query = query.eq('studentId', filters.studentId);
    }

    const { data, count, error } = await query
        .range((page - 1) * ITEM_PER_PAGE, page * ITEM_PER_PAGE - 1)
        .order('id', { ascending: false }); // Order by newest fee records first for accountant

    return { data, count, error };
};

export const getStudentsWithFeeSummary = async (classId: string | number, page: number, search?: string, statusFilter?: string) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ITEM_PER_PAGE = 10;

    // 1. Fetch Students (No range yet if we need to filter by derived status)
    let studentQuery = supabase.from('Student')
        .select('*')
        .eq('classId', classId);

    if (search) {
        studentQuery = studentQuery.or(`name.ilike.%${search}%,surname.ilike.%${search}%,rollNumber.ilike.%${search}%`);
    }

    const { data: allStudents, error: sError } = await studentQuery
        .order('name', { ascending: true });

    if (sError || !allStudents) return { data: [], count: 0, error: sError };

    // 2. Fetch all fees for these students to aggregate
    const studentIds = allStudents.map(s => s.id);
    const { data: fees } = await supabase.from('StudentFee')
        .select('studentId, totalAmount, paidAmount, pendingAmount, status, discount')
        .in('studentId', studentIds);

    // 3. Aggregate
    let summarizedData = allStudents.map(student => {
        const studentFees = fees?.filter(f => f.studentId === student.id) || [];
        const totalAmount = studentFees.reduce((sum, f) => sum + Number(f.totalAmount), 0);
        const discount = studentFees.reduce((sum, f) => sum + Number(f.discount || 0), 0);
        const totalNet = totalAmount - discount;
        const paidAmount = studentFees.reduce((sum, f) => sum + Number(f.paidAmount), 0);
        const pendingAmount = studentFees.reduce((sum, f) => sum + Number(f.pendingAmount), 0);

        let status = 'PAID';
        if (pendingAmount > 0) {
            status = paidAmount > 0 ? 'PARTIAL' : 'PENDING';
        }

        return {
            ...student,
            totalAmount: totalNet,
            paidAmount,
            pendingAmount,
            status
        };
    });

    // 4. Apply status filter if provided
    if (statusFilter) {
        summarizedData = summarizedData.filter(s => s.status === statusFilter);
    }

    const totalCount = summarizedData.length;
    const paginatedData = summarizedData.slice((page - 1) * ITEM_PER_PAGE, page * ITEM_PER_PAGE);

    return { data: paginatedData, count: totalCount, error: null };
};

export const getActiveCategoriesForClass = async (classId: string | number) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Get the gradeId of the class
    const { data: cls } = await supabase.from('Class').select('gradeId').eq('id', classId).single();
    if (!cls) return [];

    // 2. Find all FeeCategories for this grade OR global categories (gradeId is null)
    const { data: categories } = await supabase.from('FeeCategory')
        .select('*')
        .or(`gradeId.eq.${cls.gradeId},gradeId.is.null`)
        .order('name', { ascending: true });

    return categories || [];
};

export const getStudentsByFeeCategory = async (classId: string | number, categoryId: string | number, page: number, search?: string, statusFilter?: string) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ITEM_PER_PAGE = 10;

    // 1. Fetch ALL students in the class
    let studentQuery = supabase.from('Student')
        .select('id, name, surname, rollNumber')
        .eq('classId', classId);

    if (search) {
        studentQuery = studentQuery.or(`name.ilike.%${search}%,surname.ilike.%${search}%,rollNumber.ilike.%${search}%`);
    }

    const { data: allStudents, count: totalCount } = await studentQuery
        .order('name', { ascending: true })
        .range((page - 1) * ITEM_PER_PAGE, page * ITEM_PER_PAGE - 1);

    if (!allStudents) return { data: [], count: 0, error: null };

    // 2. Fetch existing StudentFee records for these students and this category
    const studentIds = allStudents.map(s => s.id);
    const { data: fees } = await supabase.from('StudentFee')
        .select('*')
        .in('studentId', studentIds)
        .eq('feeCategoryId', categoryId);

    // 3. Map students to their fee status or default to PENDING
    let data = allStudents.map(student => {
        const fee = fees?.find(f => f.studentId === student.id);
        return {
            id: fee?.id || `new-${student.id}`,
            studentId: student.id,
            status: fee?.status || 'PENDING',
            student: {
                name: student.name,
                surname: student.surname,
                rollNumber: student.rollNumber
            }
        };
    });

    // 4. Client-side status filter (since we joined in memory for simplicity)
    if (statusFilter) {
        data = data.filter(d => d.status === statusFilter);
    }

    return { data, count: totalCount, error: null };
};

export const getFeeFilterData = async () => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: grades } = await supabase.from('Grade').select('*').order('level', { ascending: true });
    const { data: classes } = await supabase.from('Class').select('*, grade:Grade(level)').order('name', { ascending: true });

    return { grades, classes };
};

export const getStudentFeeById = async (id: number) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.from('StudentFee')
        .select('*, student:Student(*), feeCategory:FeeCategory(*)')
        .eq('id', id)
        .single();

    return { data, error };
};

export const recordPayment = async (data: any) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const receiptNumber = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. Insert Payment
    const { error: pError } = await supabase.from('Payment').insert({
        studentFeeId: data.studentFeeId,
        amount: data.amount,
        paymentMode: data.paymentMode,
        remarks: data.remarks,
        receiptNumber,
        paymentDate: new Date().toISOString()
    });

    if (pError) {
        console.error("Payment Insert Error:", pError);
        return { success: false, error: true, message: pError.message };
    }

    // 2. Calculate New Totals
    const { data: fee } = await supabase.from('StudentFee').select('paidAmount, totalAmount, discount').eq('id', data.studentFeeId).single();
    if (!fee) return { success: false, message: "Fee record not found" };

    const newPaidAmount = Number(fee.paidAmount) + Number(data.amount);
    const newPendingAmount = Number(fee.totalAmount) - Number(fee.discount) - newPaidAmount;
    let newStatus = 'PARTIAL';
    if (newPendingAmount <= 0) newStatus = 'PAID';

    // 3. Update StudentFee
    const { error: fError } = await supabase.from('StudentFee').update({
        paidAmount: newPaidAmount,
        pendingAmount: newPendingAmount,
        status: newStatus
    }).eq('id', data.studentFeeId);

    if (fError) {
        console.error("StudentFee Update Error:", fError);
        return { success: false, error: true, message: fError.message };
    }

    // 4. Update Installments status based on cumulative paid amount
    const { data: allInstallments } = await supabase
        .from('Installment')
        .select('*')
        .eq('studentFeeId', data.studentFeeId)
        .order('installmentOrder', { ascending: true });

    if (allInstallments && allInstallments.length > 0) {
        let cumulativePaid = newPaidAmount;
        const updates = [];

        for (const inst of allInstallments) {
            const instAmount = Number(inst.amount);
            if (cumulativePaid >= instAmount) {
                if (inst.status !== 'PAID') {
                    updates.push(supabase.from('Installment').update({ status: 'PAID' }).eq('id', inst.id));
                }
                cumulativePaid -= instAmount;
            } else {
                // If not fully covered, it should be PENDING
                if (inst.status !== 'PENDING') {
                    updates.push(supabase.from('Installment').update({ status: 'PENDING' }).eq('id', inst.id));
                }
                break;
            }
        }

        if (updates.length > 0) {
            await Promise.all(updates);
        }
    }

    // 5. Post Accounting Voucher (Integration)
    const { data: cashLedger } = await supabase.from('Ledger').select('id').eq('name', 'Cash').single();
    const { data: bankLedger } = await supabase.from('Ledger').select('id').eq('name', 'Bank Account').single();
    const { data: feesLedger } = await supabase.from('Ledger').select('id').eq('name', 'Student Fees').single();

    if (feesLedger && (cashLedger || bankLedger)) {
        const debitLedgerId = (data.paymentMode === 'CASH' ? cashLedger?.id : bankLedger?.id) || cashLedger?.id;

        if (debitLedgerId) {
            await createVoucher({
                date: new Date(),
                type: 'RECEIPT',
                narration: `Fees received from student`,
                entries: [
                    { ledgerId: debitLedgerId, amount: Number(data.amount), type: 'DEBIT' },
                    { ledgerId: feesLedger.id, amount: Number(data.amount), type: 'CREDIT' }
                ]
            });
        }
    }

    revalidatePath("/student/fees");
    revalidatePath("/accountant/fees");

    return { success: true, error: false, receiptNumber };
};

export const getFeeCategories = async () => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.from('FeeCategory')
        .select('*, grade:Grade(level)')
        .order('name', { ascending: true });

    return { data, error };
};

export const createFeeCategory = async (currentState: CurrentState, data: FeeCategorySchema) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { id, ...insertData } = data;
    const { error } = await supabase.from('FeeCategory').insert(insertData);
    if (error) {
        console.error("Create FeeCategory Error:", error);
        return { success: false, error: true };
    }
    revalidatePath("/list/finance/categories");
    return { success: true, error: false };
};

export const updateFeeCategory = async (currentState: CurrentState, data: FeeCategorySchema) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { id, ...updateData } = data;
    const { error } = await supabase.from('FeeCategory').update(updateData).eq('id', id);
    if (error) return { success: false, error: true };
    revalidatePath("/list/finance/categories");
    return { success: true, error: false };
};

export const deleteFeeCategory = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await supabase.from('FeeCategory').delete().eq('id', id);
    if (error) return { success: false, error: true };
    revalidatePath("/list/finance/categories");
    return { success: true, error: false };
};

export const createStudentFee = async (currentState: CurrentState, data: StudentFeeSchema) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { id, ...insertData } = data;
    const pendingAmount = Number(data.totalAmount) - Number(data.discount || 0);
    const { error } = await supabase.from('StudentFee').insert({
        ...insertData,
        pendingAmount,
        paidAmount: 0,
        status: 'PENDING'
    });
    if (error) {
        console.error("Create StudentFee Error:", error);
        return { success: false, error: true };
    }
    return { success: true, error: false };
};

export const updateStudentFee = async (currentState: CurrentState, data: StudentFeeSchema) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { id, ...updateData } = data;

    // Recalculate pending based on current paid
    const { data: current } = await supabase.from('StudentFee').select('paidAmount').eq('id', id).single();
    if (!current) return { success: false, error: true };

    const paidAmount = current.paidAmount || 0;
    const pendingAmount = Number(data.totalAmount) - Number(data.discount || 0) - Number(paidAmount);
    let status = 'PARTIAL';
    if (pendingAmount <= 0) status = 'PAID';
    if (Number(paidAmount) === 0) status = 'PENDING';

    const { error } = await supabase.from('StudentFee').update({
        ...updateData,
        pendingAmount,
        status
    }).eq('id', id);
    if (error) return { success: false, error: true };
    return { success: true, error: false };
};

export const deleteStudentFee = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await supabase.from('StudentFee').delete().eq('id', id);
    if (error) return { success: false, error: true };
    return { success: true, error: false };
};

export const getExpenses = async (page: number, search?: string) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ITEM_PER_PAGE = 10;
    let query = supabase.from('Expense').select('*', { count: 'exact' });

    if (search) {
        query = query.ilike('title', `%${search}%`);
    }

    const { data, count, error } = await query
        .range((page - 1) * ITEM_PER_PAGE, page * ITEM_PER_PAGE - 1)
        .order('date', { ascending: false });

    return { data, count, error };
};

export const createExpense = async (currentState: CurrentState, data: ExpenseSchema) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { id, ...insertData } = data;
    const { error } = await supabase.from('Expense').insert(insertData);
    if (error) {
        console.error("Create Expense Error:", error);
        return { success: false, error: true };
    }

    // Post Accounting Voucher
    const { data: expLedger } = await supabase.from('Ledger').select('id').eq('name', 'Indirect Expenses').single(); // Simplified mapping
    const { data: cashLedger } = await supabase.from('Ledger').select('id').eq('name', 'Cash').single();

    if (expLedger && cashLedger) {
        await createVoucher({
            date: new Date(data.date),
            type: 'PAYMENT',
            narration: `Expense: ${data.title}`,
            entries: [
                { ledgerId: expLedger.id, amount: Number(data.amount), type: 'DEBIT' },
                { ledgerId: cashLedger.id, amount: Number(data.amount), type: 'CREDIT' }
            ]
        });
    }

    return { success: true, error: false };
};

export const updateExpense = async (currentState: CurrentState, data: ExpenseSchema) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { id, ...updateData } = data;
    const { error } = await supabase.from('Expense').update(updateData).eq('id', id);
    if (error) return { success: false, error: true };
    return { success: true, error: false };
};

export const deleteExpense = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await supabase.from('Expense').delete().eq('id', id);
    if (error) return { success: false, error: true };
    return { success: true, error: false };
};

export const bulkAssignFeeToGrade = async (currentState: CurrentState, data: BulkFeeSchema) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Get all students in the grade
    const fs = require('fs');
    fs.appendFileSync('debug_bulk_action.txt', JSON.stringify({
        timestamp: new Date(),
        gradeId: data.gradeId,
        installments: data.installments,
        count: data.installments ? data.installments.length : 0
    }) + '\n');

    const { data: students, error: sError } = await supabase
        .from('Student')
        .select('id')
        .eq('gradeId', data.gradeId);

    if (sError) {
        console.error("Bulk Assign - Fetch Students Error:", sError);
        return { success: false, error: true };
    }
    if (!students || students.length === 0) {
        console.error("Bulk Assign - No students found for gradeId:", data.gradeId);
        return { success: false, error: true };
    }

    // 2. Prepare bulk insert data
    const pendingAmount = Number(data.totalAmount) - Number(data.discount || 0);
    const insertData = students.map(student => ({
        studentId: student.id,
        feeCategoryId: data.feeCategoryId,
        totalAmount: data.totalAmount,
        discount: data.discount,
        dueDate: data.dueDate,
        pendingAmount,
        paidAmount: 0,
        status: 'PENDING'
    }));

    // 3. Insert and get IDs
    const { data: insertedFees, error: iError } = await supabase
        .from('StudentFee')
        .insert(insertData)
        .select('id, studentId');

    if (iError) {
        console.error("Bulk Assign - Insert Fees Error:", iError);
        return { success: false, error: true };
    }

    // 4. Insert Installments if present
    if (data.installments && data.installments.length > 0 && insertedFees) {
        const allInstallments: any[] = [];

        insertedFees.forEach(fee => {
            data.installments?.forEach((inst: any) => {
                allInstallments.push({
                    studentFeeId: fee.id,
                    amount: inst.amount,
                    dueDate: inst.dueDate,
                    installmentOrder: inst.installmentOrder,
                    status: 'PENDING'
                });
            });
        });

        if (allInstallments.length > 0) {
            const { error: instError } = await supabase.from('Installment').insert(allInstallments);
            if (instError) {
                console.error("Bulk Assign - Insert Installments Error:", instError);
                // Note: Fees are created but installments failed. 
                // In real world, we might want transaction, but Supabase HTTP client doesn't support easy transactions across multi-step without RPC.
                // We'll return error but success=true technically for fee creation.
                // Or we can return error.
                return { success: false, error: true };
            }
        }
    }

    return { success: true, error: false };
};

export const bulkUpdateFees = async (
    categoryId: number,
    studentUpdates: { studentId: string; status: 'PAID' | 'PARTIAL' | 'PENDING' }[]
) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // Fetch Category Info once
        const { data: category } = await supabase.from('FeeCategory').select('*').eq('id', categoryId).single();
        if (!category) return { success: false, message: "Category not found" };

        const updates = studentUpdates.map(async (update) => {
            // Find existing
            const { data: fee } = await supabase
                .from('StudentFee')
                .select('id, totalAmount, discount, paidAmount')
                .eq('studentId', update.studentId)
                .eq('feeCategoryId', categoryId)
                .single();

            const netAmount = Number(category.baseAmount) - 0; // Assuming 0 discount if new record created via bulk update

            if (fee) {
                let paidAmount = fee.paidAmount;
                const currentNet = Number(fee.totalAmount) - Number(fee.discount || 0);

                if (update.status === 'PAID') {
                    paidAmount = currentNet;
                } else if (update.status === 'PENDING') {
                    paidAmount = 0;
                }

                return supabase.from('StudentFee').update({
                    status: update.status,
                    paidAmount: paidAmount,
                    pendingAmount: currentNet - paidAmount
                }).eq('id', fee.id);
            } else {
                // CREATE NEW RECORD if marking as PAID or keeping status
                let paidAmount = 0;
                if (update.status === 'PAID') {
                    paidAmount = netAmount;
                }

                return supabase.from('StudentFee').insert({
                    studentId: update.studentId,
                    feeCategoryId: categoryId,
                    totalAmount: category.baseAmount,
                    discount: 0,
                    paidAmount: paidAmount,
                    pendingAmount: netAmount - paidAmount,
                    status: update.status,
                    dueDate: new Date().toISOString() // Default to today
                });
            }
        });

        await Promise.all(updates);

        revalidatePath("/list/finance");
        return { success: true };
    } catch (err) {
        console.error("Bulk Fee Update Error:", err);
        return { success: false, error: true };
    }
};
