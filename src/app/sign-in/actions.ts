'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function login(prevState: any, formData: FormData) {
    console.log("Login action started!");
    try {
        const supabase = createClient();
        const rawInput = (formData.get('email') as string || "").trim();
        const password = (formData.get('password') as string || "").trim();

        if (!rawInput || !password) {
            return { success: false, error: "Please enter both Email/Username and Password." };
        }

        // Build list of potential auth emails to attempt
        const candidateEmails: string[] = [];

        // 1. Raw input as entered & lowercased
        candidateEmails.push(rawInput);
        candidateEmails.push(rawInput.toLowerCase());

        // 2. Default internal email format if no @ in input
        if (!rawInput.includes('@')) {
            candidateEmails.push(`${rawInput.toLowerCase()}@dcpems.internal`);
        }

        // 3. Perform database lookups across user tables to resolve username/rollNumber/email
        const adminSupabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const tables = ['Student', 'Teacher', 'Parent', 'Admin', 'Librarian', 'Accountant', 'Receptionist'];
        for (const table of tables) {
            try {
                const query = adminSupabase.from(table).select('email, username');
                if (table === 'Student') {
                    query.or(`username.ilike.${rawInput},email.ilike.${rawInput},rollNumber.ilike.${rawInput}`);
                } else {
                    query.or(`username.ilike.${rawInput},email.ilike.${rawInput}`);
                }

                const { data } = await query.limit(1);

                if (data && data.length > 0) {
                    if (data[0].email) candidateEmails.push(data[0].email);
                    if (data[0].username) candidateEmails.push(`${data[0].username.toLowerCase()}@dcpems.internal`);
                }
            } catch (tblErr) {
                // Ignore individual table lookup error
            }
        }

        // Unique candidates
        const uniqueEmails = Array.from(new Set(candidateEmails.filter(Boolean)));

        let authData: any = null;
        let lastError: any = null;

        // Try authenticating with candidate emails
        for (const email of uniqueEmails) {
            console.log("Attempting login with candidate email:", email);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (!error && data?.user) {
                authData = data;
                break;
            } else if (error) {
                lastError = error;
            }
        }

        if (!authData || !authData.user) {
            console.error("Login failed for input:", rawInput, "Error:", lastError?.message);
            return {
                success: false,
                error: lastError?.message || "Invalid Email/Username or Password."
            };
        }

        const role = authData.user?.user_metadata?.role;
        console.log("Successfully logged in user role:", role);

        revalidatePath('/', 'layout');
        redirect(role ? `/${role}` : '/');
    } catch (err: any) {
        // Next.js redirect exception handling
        if (
            err?.message === "NEXT_REDIRECT" ||
            (typeof err?.digest === 'string' && err.digest.includes("NEXT_REDIRECT"))
        ) {
            throw err;
        }
        console.error("Unexpected error in login action:", err);
        return { success: false, error: err?.message || "Unexpected server error during login." };
    }
}
