'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(prevState: any, formData: FormData) {
    console.log("Login action started!");
    try {
        const supabase = createClient()

        let loginEmail = formData.get('email') as string;
        const password = formData.get('password') as string;

        // If it's a username (no @), convert to internal student email
        if (loginEmail && !loginEmail.includes('@')) {
            loginEmail = `${loginEmail.toLowerCase()}@dcpems.internal`;
        }

        console.log("Attempting login for:", loginEmail);

        const { error, data: authData } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: password
        })

        if (error) {
            console.error("Login failed (Supabase error):", error.message);
            return { success: false, error: error.message };
        }

        const role = authData.user?.user_metadata?.role;
        console.log("Logged in user role:", role);

        revalidatePath('/', 'layout')
        redirect(role ? `/${role}` : '/')
    } catch (err: any) {
        if (err.message === "NEXT_REDIRECT") throw err; // Allow redirect to work
        console.error("Unexpected error in login action:", err);
        return { success: false, error: "Unexpected server error" };
    }
}
