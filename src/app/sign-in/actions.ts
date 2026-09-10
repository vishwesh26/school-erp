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

        // Handle common spelling/transliteration variations (e.g. Dikshit -> Dixit, Sraddha -> Shraddha)
        const lowerInput = rawInput.toLowerCase();
        const normalized = lowerInput
            .replace(/dikshit/g, 'dixit')
            .replace(/sraddha/g, 'shraddha')
            .replace(/shradha/g, 'shraddha');

        const searchTerms = Array.from(new Set([rawInput, lowerInput, normalized]));

        // 3. Perform database lookups across user tables to resolve username/rollNumber/email/phone/name
        const adminSupabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const tables = ['Student', 'Teacher', 'Parent', 'Admin', 'Librarian', 'Accountant', 'Receptionist'];

        for (const term of searchTerms) {
            for (const table of tables) {
                try {
                    // Direct field match
                    let orFilter = `username.ilike."${term}",email.ilike."${term}"`;
                    if (table === 'Student') {
                        orFilter += `,rollNumber.ilike."${term}",phone.ilike."${term}"`;
                    } else if (table === 'Teacher' || table === 'Parent') {
                        orFilter += `,phone.ilike."${term}"`;
                    }

                    const { data: directData } = await adminSupabase
                        .from(table)
                        .select('email, username')
                        .or(orFilter)
                        .limit(2);

                    if (directData && directData.length > 0) {
                        for (const row of directData) {
                            if (row.email) candidateEmails.push(row.email);
                            if (row.username) candidateEmails.push(`${row.username.toLowerCase()}@dcpems.internal`);
                        }
                    }

                    // Name-based lookups for Teacher, Student, Parent
                    if (table === 'Teacher' || table === 'Student' || table === 'Parent') {
                        const words = term.split(/\s+/).filter(Boolean);
                        if (words.length >= 2) {
                            const first = words[0];
                            const last = words[words.length - 1];
                            const { data: nameData } = await adminSupabase
                                .from(table)
                                .select('email, username')
                                .or(`and(name.ilike.%${first}%,surname.ilike.%${last}%),and(name.ilike.%${last}%,surname.ilike.%${first}%)`)
                                .limit(2);

                            if (nameData && nameData.length > 0) {
                                for (const row of nameData) {
                                    if (row.email) candidateEmails.push(row.email);
                                    if (row.username) candidateEmails.push(`${row.username.toLowerCase()}@dcpems.internal`);
                                }
                            }
                        } else if (words.length === 1 && words[0].length >= 3) {
                            const word = words[0];
                            const { data: singleData } = await adminSupabase
                                .from(table)
                                .select('email, username')
                                .or(`name.ilike.%${word}%,surname.ilike.%${word}%`)
                                .limit(2);

                            if (singleData && singleData.length > 0) {
                                for (const row of singleData) {
                                    if (row.email) candidateEmails.push(row.email);
                                    if (row.username) candidateEmails.push(`${row.username.toLowerCase()}@dcpems.internal`);
                                }
                            }
                        }
                    }
                } catch (tblErr) {
                    // Ignore individual table lookup error
                }
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
