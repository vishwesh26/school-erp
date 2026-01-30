"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

type CurrentState = { success: boolean; error: boolean; message?: string };

// --- LEDGER GROUPS ---

export const getLedgerGroups = async () => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data, error } = await supabase.from('LedgerGroup').select('*').order('name');
    return { data, error };
};

export const createLedgerGroup = async (currentState: CurrentState, formData: FormData) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;

    const { error } = await supabase.from('LedgerGroup').insert({ name, category });
    if (error) return { success: false, error: true, message: error.message };

    revalidatePath('/accountant/accounting/ledgers');
    return { success: true, error: false };
};

// --- LEDGERS ---

export const getLedgers = async () => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data, error } = await supabase.from('Ledger').select('*, group:LedgerGroup(name)').order('name');
    return { data, error };
};

export const createLedger = async (currentState: CurrentState, formData: FormData) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const name = formData.get('name') as string;
    const groupId = parseInt(formData.get('groupId') as string);
    const openingBalance = parseFloat(formData.get('openingBalance') as string) || 0;
    const openingBalanceType = formData.get('openingBalanceType') as string; // DEBIT or CREDIT

    // Initial current balance calculation
    // Normalizing: Assets/Expenses (Debit is +), Liabilities/Income (Credit is +)
    // For simplicity, let's keep currentBalance as absolute value and derived on fly? 
    // Or store it. Let's store signed value? Or just update it on voucher entry.
    // Ideally: 
    // If Type == DEBIT, balance is +ve debit. 
    // Let's rely on reporting for live balance or simple accumulation.

    const { error } = await supabase.from('Ledger').insert({
        name,
        groupId,
        openingBalance,
        openingBalanceType,
        currentBalance: openingBalance // Simplified
    });

    if (error) return { success: false, error: true, message: error.message };

    revalidatePath('/accountant/accounting/ledgers');
    return { success: true, error: false };
};

// --- VOUCHERS ---

export const createVoucher = async (data: {
    date: Date;
    type: string;
    narration: string;
    entries: { ledgerId: number; amount: number; type: 'DEBIT' | 'CREDIT' }[]
}) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Validate Double Entry
    const totalDebit = data.entries
        .filter(e => e.type === 'DEBIT')
        .reduce((sum, e) => sum + e.amount, 0);

    const totalCredit = data.entries
        .filter(e => e.type === 'CREDIT')
        .reduce((sum, e) => sum + e.amount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return { success: false, error: true, message: `Mismatch: Debit (${totalDebit}) != Credit (${totalCredit})` };
    }

    // 2. Generate Voucher Number
    const voucherNumber = `${data.type.substring(0, 3)}-${Date.now()}`;

    // 3. Insert Voucher Header
    const { data: voucher, error: vError } = await supabase.from('Voucher').insert({
        voucherNumber,
        date: data.date,
        type: data.type,
        narration: data.narration,
        totalAmount: totalDebit
    }).select('id').single();

    if (vError) return { success: false, error: true, message: vError.message };
    if (!voucher) return { success: false, error: true, message: "Failed to create voucher" };

    // 4. Insert Entries
    const entriesWithId = data.entries.map((e, idx) => ({
        voucherId: voucher.id,
        ledgerId: e.ledgerId,
        amount: e.amount,
        type: e.type,
        // transactionIndex: idx // Schema didn't have this, skipping or adding if needed
    }));

    const { error: eError } = await supabase.from('VoucherEntry').insert(entriesWithId);

    if (eError) {
        // Rollback voucher (Manual delete because no transactions in REST)
        await supabase.from('Voucher').delete().eq('id', voucher.id);
        return { success: false, error: true, message: eError.message };
    }

    // 5. Update Ledger Balances (Optional but good for performance)
    // Logic: For each entry, update currentBalance of ledger.
    // This is complex without atomic transactions. 
    // Only critical for fast retrieval. For now, we can skip and calculate on fly or update simply.
    // Let's skip updating `currentBalance` column for now to avoid concurrency issues without transactions.
    // Reports will calculate balance dynamically.

    revalidatePath('/accountant/accounting');
    return { success: true, error: false, voucherId: voucher.id };
};

// --- REPORTS ---

export const getTrialBalance = async () => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all ledgers and their voucher entries
    // This is expensive for large data, but fine for MVP.
    const { data: ledgers } = await supabase.from('Ledger').select('id, name, openingBalance, openingBalanceType, groupId').order('name');
    const { data: entries } = await supabase.from('VoucherEntry').select('ledgerId, amount, type');

    if (!ledgers) return { data: [] };

    const report = ledgers.map(l => {
        let balance = l.openingBalance || 0;
        // Adjust for opening balance type
        // Let's assume standard: Asset/Exp -> Dr is +ve. Liab/Inc -> Cr is +ve.
        // For Trial Balance, we usually just list Dr sum and Cr sum.

        let drTotal = l.openingBalanceType === 'DEBIT' ? Number(l.openingBalance) : 0;
        let crTotal = l.openingBalanceType === 'CREDIT' ? Number(l.openingBalance) : 0;

        const ledgerEntries = entries?.filter((e: any) => e.ledgerId === l.id) || [];

        ledgerEntries.forEach((e: any) => {
            if (e.type === 'DEBIT') drTotal += Number(e.amount);
            else crTotal += Number(e.amount);
        });

        // Net Balance
        let netDebit = 0;
        let netCredit = 0;
        if (drTotal > crTotal) netDebit = drTotal - crTotal;
        else netCredit = crTotal - drTotal;

        return {
            id: l.id,
            name: l.name,
            debit: netDebit,
            credit: netCredit
        };
    }).filter(r => r.debit > 0 || r.credit > 0);

    return { data: report };
};

export const getDayBook = async (date?: Date) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const targetDate = date || new Date();
    const start = new Date(targetDate); start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate); end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
        .from('Voucher')
        .select(`
            *,
            entries:VoucherEntry(
                amount,
                type,
                ledger:Ledger(name)
            )
        `)
        .gte('date', start.toISOString())
        .lte('date', end.toISOString())
        .order('date', { ascending: true });

    return { data, error };
};

export const getProfitAndLoss = async () => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch ledgers with Income/Expense categories
    const { data: ledgers, error: lError } = await supabase
        .from('Ledger')
        .select('id, name, openingBalance, openingBalanceType, group:LedgerGroup!inner(name, category)');

    if (lError) return { error: lError };

    // Valid categories
    const categories = ['INCOME', 'EXPENSE'];
    const relevantLedgers = ledgers.filter((l: any) => categories.includes(l.group.category));

    // Fetch all voucher entries (optimize later)
    const { data: entries } = await supabase.from('VoucherEntry').select('ledgerId, amount, type');

    const report = {
        income: [] as any[],
        expenses: [] as any[],
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0
    };

    relevantLedgers.forEach((l: any) => {
        const ledgerEntries = entries?.filter((e: any) => e.ledgerId === l.id) || [];

        let drTotal = l.openingBalanceType === 'DEBIT' ? l.openingBalance : 0;
        let crTotal = l.openingBalanceType === 'CREDIT' ? l.openingBalance : 0;

        ledgerEntries.forEach((e: any) => {
            if (e.type === 'DEBIT') drTotal += e.amount;
            else crTotal += e.amount;
        });

        let balance = 0;
        if (l.group.category === 'INCOME') {
            // Income: Credit Balance is Positive
            balance = crTotal - drTotal;
            if (Math.abs(balance) > 0.01) {
                report.income.push({ name: l.name, amount: balance });
                report.totalIncome += balance;
            }
        } else {
            // Expense: Debit Balance is Positive
            balance = drTotal - crTotal;
            if (Math.abs(balance) > 0.01) {
                report.expenses.push({ name: l.name, amount: balance });
                report.totalExpense += balance;
            }
        }
    });

    report.netProfit = report.totalIncome - report.totalExpense;
    return { data: report };
};

export const getBalanceSheet = async () => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Get Net Profit
    const { data: pnl } = await getProfitAndLoss();
    const netProfit = pnl?.netProfit || 0;

    // 2. Fetch Assets, Liabilities, Equity
    const { data: ledgers, error: lError } = await supabase
        .from('Ledger')
        .select('id, name, openingBalance, openingBalanceType, group:LedgerGroup!inner(name, category)');

    if (lError) return { error: lError };

    const { data: entries } = await supabase.from('VoucherEntry').select('ledgerId, amount, type');

    const report = {
        assets: [] as any[],
        liabilities: [] as any[], // Includes Equity for now to balance
        totalAssets: 0,
        totalLiabilities: 0
    };

    const assetCategories = ['ASSET'];
    const liabilityCategories = ['LIABILITY', 'EQUITY', 'CAPITAL']; // Added Capital usually same as Equity

    const relevantLedgers = ledgers.filter((l: any) =>
        assetCategories.includes(l.group.category) || liabilityCategories.includes(l.group.category)
    );

    relevantLedgers.forEach((l: any) => {
        const ledgerEntries = entries?.filter((e: any) => e.ledgerId === l.id) || [];

        let drTotal = l.openingBalanceType === 'DEBIT' ? l.openingBalance : 0;
        let crTotal = l.openingBalanceType === 'CREDIT' ? l.openingBalance : 0;

        ledgerEntries.forEach((e: any) => {
            if (e.type === 'DEBIT') drTotal += e.amount;
            else crTotal += e.amount;
        });

        let balance = 0;
        if (assetCategories.includes(l.group.category)) {
            // Assets: Dr Balance is positive
            balance = drTotal - crTotal;
            if (Math.abs(balance) > 0.01) {
                report.assets.push({ name: l.name, group: l.group.name, amount: balance });
                report.totalAssets += balance;
            }
        } else {
            // Liabilities/Equity: Cr Balance is positive
            balance = crTotal - drTotal;
            if (Math.abs(balance) > 0.01) {
                report.liabilities.push({ name: l.name, group: l.group.name, amount: balance });
                report.totalLiabilities += balance;
            }
        }
    });

    // Add Net Profit to Liabilities side (Reserves & Surplus / Equity)
    // Positive Net Profit increases Equity (Liabilities side in Equation A = L + E)
    report.liabilities.push({ name: 'Net Profit / Loss', group: 'Reserves & Surplus', amount: netProfit });
    report.totalLiabilities += netProfit;

    return { data: report };
};

export const getVouchers = async (limit = 20) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
        .from('Voucher')
        .select(`
            *,
            entries:VoucherEntry(
                amount,
                type,
                ledger:Ledger(name)
            )
        `)
        .order('date', { ascending: false })
        .order('createdAt', { ascending: false })
        .limit(limit);

    return { data, error };
};

export const deleteVoucher = async (id: number) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('Voucher').delete().eq('id', id);

    if (error) return { success: false, message: error.message };

    revalidatePath('/accountant/accounting/vouchers');
    return { success: true };
};
