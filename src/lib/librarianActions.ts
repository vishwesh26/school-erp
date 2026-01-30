"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// DASHBOARD STATS
export const getLibrarianStats = async () => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { count: totalBooks } = await supabase.from('Book').select('*', { count: 'exact', head: true });

    // For available, we sum the 'available_copies' column. 
    // Since Supabase .select() returns data, we can sum it up or use a helper function if we had one.
    // For MVP, if dataset is small, fetch all or use a simpler count if possible.
    // Let's optimize: 'available_copies' > 0
    // Actually, simply counting rows where status = 'AVAILABLE' is the old way.
    // New way: sum available_copies.
    const { data: books } = await supabase.from('Book').select('available_copies');
    const availableBooks = books ? books.reduce((acc, b) => acc + (b.available_copies || 0), 0) : 0;

    const today = new Date().toISOString().split('T')[0];
    const { count: issuedToday } = await supabase.from('BookIssue')
        .select('*', { count: 'exact', head: true })
        .gte('issueDate', `${today}T00:00:00`)
        .lte('issueDate', `${today}T23:59:59`);

    const { count: overdue } = await supabase.from('BookIssue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'OVERDUE');

    return { totalBooks: totalBooks || 0, availableBooks, issuedToday: issuedToday || 0, overdue: overdue || 0 };
};

// BOOKS MANAGEMENT
export const getBooks = async (page: number, search?: string) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    let query = supabase.from('Book').select('*', { count: 'exact' });
    if (search) query = query.ilike('title', `%${search}%`);

    query = query.order('createdAt', { ascending: false });

    const ITEM_PER_PAGE = 10;
    const from = (page - 1) * ITEM_PER_PAGE;
    const to = from + ITEM_PER_PAGE - 1;

    return await query.range(from, to);
};

export const createBook = async (data: any) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const res = await supabase.from('Book').insert(data);
    revalidatePath("/librarian/books");
    revalidatePath("/librarian");
    return res;
};

export const updateBook = async (id: number, data: any) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const res = await supabase.from('Book').update(data).eq('id', id);
    revalidatePath("/librarian/books");
    revalidatePath("/librarian");
    return res;
};

// ACTIONS
export const findStudent = async (query: string) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // Search by name or id (assuming query is passed)
    // Supabase ilike on name or surname
    return await supabase.from('Student')
        .select('*')
        .or(`name.ilike.%${query}%,surname.ilike.%${query}%,id.eq.${query},rollNumber.eq.${query},username.eq.${query}`)
        .limit(5);
};

export const findBookByAccession = async (accNo: string) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    return await supabase.from('Book').select('*').eq('accession_no', accNo).single();
};

export const issueBook = async (studentId: string, bookId: number) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // 1. Check Availability
    const { data: book } = await supabase.from('Book').select('available_copies').eq('id', bookId).single();
    if (!book || book.available_copies < 1) return { success: false, message: "Book not available" };

    // 2. Issue
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days default

    const { error } = await supabase.from('BookIssue').insert({
        bookId,
        studentId,
        dueDate: dueDate.toISOString(),
        status: 'ISSUED'
    });

    if (error) return { success: false, message: error.message };

    // 3. Decrement Copy
    await supabase.rpc('decrement_book_copy', { row_id: bookId });
    // Note: RPC might not exist. Fallback to direct update for MVP:
    await supabase.from('Book').update({ available_copies: book.available_copies - 1 }).eq('id', bookId);

    revalidatePath("/librarian");
    revalidatePath("/librarian/books");
    revalidatePath("/librarian/history");

    return { success: true };
};

export const returnBook = async (issueId: number) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // 1. Get Issue
    const { data: issue } = await supabase.from('BookIssue').select('bookId, dueDate').eq('id', issueId).single();
    if (!issue) return { success: false, message: "Issue record not found" };

    // 2. Calculate Fine (Mock: 1$ per day)
    const now = new Date();
    const due = new Date(issue.dueDate);
    let fine = 0;
    if (now > due) {
        const diffTime = Math.abs(now.getTime() - due.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        fine = diffDays * 1;
    }

    // 3. Update Issue
    const { error } = await supabase.from('BookIssue').update({
        returnDate: now.toISOString(),
        status: 'RETURNED',
        fineAmount: fine
    }).eq('id', issueId);

    if (error) return { success: false, message: error.message };

    // 4. Increment Copy
    const { data: book } = await supabase.from('Book').select('available_copies').eq('id', issue.bookId).single();
    if (book) {
        await supabase.from('Book').update({ available_copies: book.available_copies + 1 }).eq('id', issue.bookId);
    }

    revalidatePath("/librarian");
    revalidatePath("/librarian/books");
    revalidatePath("/librarian/history");

    return { success: true, fine };
};

export const getLibrarianHistory = async (page: number) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const ITEM_PER_PAGE = 10;
    const from = (page - 1) * ITEM_PER_PAGE;
    const to = from + ITEM_PER_PAGE - 1;

    let query = supabase.from('BookIssue')
        .select('*, book:Book(title), student:Student(name, surname)', { count: 'exact' })
        .order('issueDate', { ascending: false });

    return await query.range(from, to);
};

export const getActiveIssuesByBook = async (bookId: number) => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    return await supabase
        .from('BookIssue')
        .select('*, student:Student(name, surname)')
        .eq('bookId', bookId)
        .eq('status', 'ISSUED');
};
