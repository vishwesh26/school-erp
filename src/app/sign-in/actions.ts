'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

interface CandidateUser {
    email: string;
    studentId?: string;
    rollNumber?: string;
    birthday?: string;
    teacherId?: string;
    staffId?: string;
    role?: string;
    phone?: string;
    username?: string;
}

export async function login(prevState: any, formData: FormData) {
    try {
        const supabase = createClient();
        const rawInput = (formData.get('email') as string || "").trim();
        const rawPassword = (formData.get('password') as string || "").trim();

        if (!rawInput || !rawPassword) {
            return { success: false, error: "Please enter both Email/Username/Roll No and Password." };
        }

        const cleanInput = rawInput.trim();
        const lowerInput = cleanInput.toLowerCase();
        const digitsOnly = cleanInput.replace(/\D/g, '');

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pazdautizflpnwgcmrty.supabase.co';
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            console.error("Missing SUPABASE_SERVICE_ROLE_KEY on server. Please add .env to your Hostinger deployment.");
            return {
                success: false,
                error: "Hostinger deployment is missing environment variables. Please upload your .env file to Hostinger or configure SUPABASE_SERVICE_ROLE_KEY."
            };
        }

        const adminSupabase = createAdminClient(
            supabaseUrl,
            serviceRoleKey
        );

        const candidateList: CandidateUser[] = [];

        // Helper to register student candidates with actual auth email from Supabase Auth
        const registerStudentCandidates = async (students: any[]) => {
            await Promise.all(
                (students || []).slice(0, 10).map(async (s) => {
                    const defaultInternalEmail = s.username ? `${s.username.toLowerCase()}@dcpems.internal` : null;
                    let actualAuthEmail: string | null = null;

                    try {
                        const { data: userRes } = await adminSupabase.auth.admin.getUserById(s.id);
                        if (userRes?.user?.email) {
                            actualAuthEmail = userRes.user.email;
                        }
                    } catch (e) {}

                    if (actualAuthEmail) {
                        candidateList.push({
                            email: actualAuthEmail,
                            studentId: s.id,
                            rollNumber: s.rollNumber,
                            birthday: s.birthday,
                        });
                    }

                    if (defaultInternalEmail && defaultInternalEmail !== actualAuthEmail?.toLowerCase()) {
                        candidateList.push({
                            email: defaultInternalEmail,
                            studentId: s.id,
                            rollNumber: s.rollNumber,
                            birthday: s.birthday,
                        });
                    }
                })
            );
        };

        // 1. Email or internal email candidate
        if (cleanInput.includes('@')) {
            const emailVariants = new Set<string>();
            emailVariants.add(cleanInput);
            emailVariants.add(lowerInput);

            // Handle gmail dot normalization (e.g. user.name@gmail.com -> username@gmail.com)
            if (lowerInput.endsWith('@gmail.com')) {
                const parts = lowerInput.split('@');
                const noDots = parts[0].replace(/\./g, '') + '@gmail.com';
                emailVariants.add(noDots);
            }

            const emailFilter = Array.from(emailVariants).map(e => `email.ilike.${e}`).join(',');

            // Check if entered email matches Student.email
            try {
                const { data: stByEmail } = await adminSupabase
                    .from('Student')
                    .select('id, username, rollNumber, birthday, email, parentId')
                    .or(emailFilter)
                    .limit(10);

                await registerStudentCandidates(stByEmail || []);

                // Sibling resolution: if student has a parent, also register sibling students
                for (const s of (stByEmail || [])) {
                    if (s.parentId) {
                        const { data: siblings } = await adminSupabase
                            .from('Student')
                            .select('id, username, rollNumber, birthday, email')
                            .eq('parentId', s.parentId)
                            .neq('id', s.id);
                        await registerStudentCandidates(siblings || []);
                    }
                }
            } catch (err) {}

            // Check if entered email belongs to a Parent
            try {
                const { data: parentByEmail } = await adminSupabase
                    .from('Parent')
                    .select('id, email, students:Student(id, username, rollNumber, birthday)')
                    .or(emailFilter)
                    .limit(5);

                const parentStudents = (parentByEmail || []).flatMap(p => p.students || []);
                await registerStudentCandidates(parentStudents);

                (parentByEmail || []).forEach(p => {
                    if (p.email) candidateList.push({ email: p.email });
                });
            } catch (err) {}

            // Fallback for staff / teachers / direct auth users whose login email IS their real email
            candidateList.push({ email: cleanInput });
            if (cleanInput !== lowerInput) {
                candidateList.push({ email: lowerInput });
            }
        } else {
            // Default internal email format if no @ in input
            candidateList.push({ email: `${lowerInput}@dcpems.internal` });
            candidateList.push({ email: cleanInput });
        }

        // 3. Class + Roll pattern (e.g. "1E-001", "3B-004", "NurseryA-005", "Nursery B 3", "Class 3B Roll 4")
        const classRollMatch = cleanInput.match(/^(?:Class\s*)?([0-9]{1,2}\s*[A-Za-z]+|Nursery\s*[A-Za-z]?|LKG\s*[A-Za-z]?|UKG\s*[A-Za-z]?)[\s\-_,.:]*(?:Roll|No)?[\s\-_.:]*([0-9]+)$/i);
        if (classRollMatch) {
            const rawClass = classRollMatch[1].replace(/\s+/g, '');
            const rawRollInt = parseInt(classRollMatch[2], 10);
            if (!isNaN(rawRollInt)) {
                const rollVariants = [
                    rawRollInt.toString(),
                    rawRollInt.toString().padStart(2, '0'),
                    rawRollInt.toString().padStart(3, '0')
                ];

                try {
                    const { data: classRows } = await adminSupabase
                        .from('Class')
                        .select('id, name')
                        .ilike('name', rawClass);

                    if (classRows && classRows.length > 0) {
                        const classIds = classRows.map(c => c.id);
                        const { data: matchedStudents } = await adminSupabase
                            .from('Student')
                            .select('id, username, rollNumber, birthday, email')
                            .in('classId', classIds)
                            .in('rollNumber', rollVariants);

                        await registerStudentCandidates(matchedStudents || []);
                    }
                } catch (err) {}
            }
        }

        // 4. Student lookup by username, rollNumber, phone, aadharNo, stateStudentId
        try {
            const studentFilters: string[] = [];
            studentFilters.push(`username.ilike.${cleanInput}`);
            studentFilters.push(`username.ilike.${cleanInput.replace(/\s+/g, '-')}`);

            if (digitsOnly.length > 0) {
                if (digitsOnly.length <= 4) {
                    const num = parseInt(digitsOnly, 10);
                    if (!isNaN(num)) {
                        studentFilters.push(`rollNumber.eq.${digitsOnly}`);
                        studentFilters.push(`rollNumber.eq.${num.toString().padStart(3, '0')}`);
                        studentFilters.push(`rollNumber.eq.${num.toString()}`);
                    }
                }
                if (digitsOnly.length >= 10) {
                    const tenDigits = digitsOnly.slice(-10);
                    studentFilters.push(`phone.ilike.%${tenDigits}%`);
                    studentFilters.push(`aadharNo.eq.${digitsOnly}`);
                }
            }

            const uniqueFilters = Array.from(new Set(studentFilters));
            const { data: directStudents } = await adminSupabase
                .from('Student')
                .select('id, username, rollNumber, birthday, email')
                .or(uniqueFilters.join(','))
                .limit(10);

            await registerStudentCandidates(directStudents || []);
        } catch (err) {}

        // 5. Name-based lookup for Student
        const words = cleanInput.split(/\s+/).filter(Boolean);
        if (words.length >= 2 && !cleanInput.includes('@')) {
            try {
                const first = words[0];
                const last = words[words.length - 1];
                const { data: nameStudents } = await adminSupabase
                    .from('Student')
                    .select('id, username, rollNumber, birthday, email')
                    .or(`and(name.ilike.%${first}%,surname.ilike.%${last}%),and(name.ilike.%${last}%,surname.ilike.%${first}%)`)
                    .limit(10);

                await registerStudentCandidates(nameStudents || []);
            } catch (err) {}
        }

        // 6. Lookups for Teacher, Parent, Librarian, Accountant, Receptionist, Admin
        const staffTables = [
            { table: 'Teacher', role: 'teacher' },
            { table: 'Admin', role: 'admin' },
            { table: 'Accountant', role: 'accountant' },
            { table: 'Librarian', role: 'librarian' },
            { table: 'Receptionist', role: 'receptionist' },
            { table: 'Parent', role: 'parent' }
        ];

        for (const { table, role } of staffTables) {
            try {
                const filters: string[] = [];
                filters.push(`username.ilike.${cleanInput}`);
                filters.push(`email.ilike.${cleanInput}`);
                if (digitsOnly.length >= 10) {
                    filters.push(`phone.ilike.%${digitsOnly.slice(-10)}%`);
                }

                // If user entered name/words and not an email
                if (words.length >= 2 && !cleanInput.includes('@')) {
                    const first = words[0];
                    const last = words[words.length - 1];
                    filters.push(`and(name.ilike.%${first}%,surname.ilike.%${last}%)`);
                    filters.push(`and(name.ilike.%${last}%,surname.ilike.%${first}%)`);
                } else if (words.length === 1 && words[0].length >= 3 && !cleanInput.includes('@')) {
                    filters.push(`name.ilike.%${words[0]}%`);
                    filters.push(`surname.ilike.%${words[0]}%`);
                }

                // Query with adminSupabase, or fallback to server supabase client
                let staffRows: any[] | null = null;
                try {
                    const { data } = await adminSupabase
                        .from(table)
                        .select('id, email, username, phone, birthday, name, surname')
                        .or(filters.join(','))
                        .limit(5);
                    staffRows = data;
                } catch (e) {}

                if (!staffRows || staffRows.length === 0) {
                    try {
                        const { data } = await supabase
                            .from(table)
                            .select('id, email, username, phone, birthday, name, surname')
                            .or(filters.join(','))
                            .limit(5);
                        staffRows = data;
                    } catch (e) {}
                }

                (staffRows || []).forEach(r => {
                    const tId = role === 'teacher' ? r.id : undefined;
                    if (r.email) {
                        candidateList.push({
                            email: r.email,
                            teacherId: tId,
                            staffId: r.id,
                            role,
                            phone: r.phone,
                            username: r.username,
                            birthday: r.birthday,
                        });
                    }
                    if (r.username) {
                        candidateList.push({
                            email: `${r.username.toLowerCase()}@dcpems.internal`,
                            teacherId: tId,
                            staffId: r.id,
                            role,
                            phone: r.phone,
                            username: r.username,
                            birthday: r.birthday,
                        });
                    }
                });
            } catch (err) {}
        }

        // Deduplicate candidates while merging and preserving metadata
        const candidateMap = new Map<string, CandidateUser>();
        for (const c of candidateList) {
            const key = (c.email || '').toLowerCase().trim();
            if (!key) continue;
            const existing = candidateMap.get(key);
            if (existing) {
                if (!existing.studentId && c.studentId) existing.studentId = c.studentId;
                if (!existing.teacherId && c.teacherId) existing.teacherId = c.teacherId;
                if (!existing.staffId && c.staffId) existing.staffId = c.staffId;
                if (!existing.rollNumber && c.rollNumber) existing.rollNumber = c.rollNumber;
                if (!existing.birthday && c.birthday) existing.birthday = c.birthday;
                if (!existing.phone && c.phone) existing.phone = c.phone;
                if (!existing.username && c.username) existing.username = c.username;
                if (!existing.role && c.role) existing.role = c.role;
            } else {
                candidateMap.set(key, { ...c });
            }
        }
        const uniqueCandidates: CandidateUser[] = Array.from(candidateMap.values());

        let authData: any = null;
        let lastError: any = null;

        // Try authenticating with candidate emails
        for (const cand of uniqueCandidates) {
            // Attempt 1: Direct sign-in with entered password
            const { data, error } = await supabase.auth.signInWithPassword({
                email: cand.email,
                password: rawPassword,
            });

            if (!error && data?.user) {
                authData = data;
                break;
            } else if (error) {
                lastError = error;
            }

            // Attempt 1b: Seamless legacy password sync - If failed on new DB, check if old Supabase matches
            const oldUrl = process.env.OLD_SUPABASE_URL;
            const oldKey = process.env.OLD_SUPABASE_SERVICE_ROLE_KEY;
            if (oldUrl && oldKey && oldUrl !== supabaseUrl) {
                try {
                    const oldSupabase = createAdminClient(oldUrl, oldKey);
                    const { data: oldAuth, error: oldAuthErr } = await oldSupabase.auth.signInWithPassword({
                        email: cand.email,
                        password: rawPassword,
                    });
                    if (!oldAuthErr && oldAuth?.user) {
                        try {
                            await adminSupabase.auth.admin.updateUserById(oldAuth.user.id, {
                                password: rawPassword,
                                email_confirm: true,
                            });
                        } catch (uErr) {
                            try {
                                await adminSupabase.auth.admin.createUser({
                                    id: oldAuth.user.id,
                                    email: cand.email,
                                    password: rawPassword,
                                    email_confirm: true,
                                    user_metadata: oldAuth.user.user_metadata || {},
                                });
                            } catch (cErr) {}
                        }
                        const retryAuth = await supabase.auth.signInWithPassword({
                            email: cand.email,
                            password: rawPassword,
                        });
                        if (!retryAuth.error && retryAuth.data?.user) {
                            authData = retryAuth.data;
                            break;
                        }
                    }
                } catch (legacySyncErr) {
                    console.warn("Legacy password sync check:", legacySyncErr);
                }
            }

            // Attempt 2: If teacher candidate and direct password failed, test adaptive teacher password patterns
            if (cand.teacherId || cand.role === 'teacher') {
                try {
                    let authUser: any = null;
                    if (cand.teacherId) {
                        try {
                            const { data: authUserRes } = await adminSupabase.auth.admin.getUserById(cand.teacherId);
                            authUser = authUserRes?.user;
                        } catch (e) {}
                    }

                    const currentAuthPwd = authUser?.user_metadata?.temp_password;

                    // Build list of valid acceptable teacher passwords
                    const acceptablePasswords = new Set<string>();
                    acceptablePasswords.add("dcpems@123");
                    acceptablePasswords.add("dcpems123");
                    acceptablePasswords.add("Dcpems@123");
                    acceptablePasswords.add("teacher@123");
                    acceptablePasswords.add("teacher123");
                    acceptablePasswords.add("pass@123");

                    if (currentAuthPwd) {
                        acceptablePasswords.add(currentAuthPwd);
                        acceptablePasswords.add(currentAuthPwd.toLowerCase());
                    }

                    if (cand.phone) {
                        const cleanPhone = cand.phone.replace(/\D/g, '');
                        if (cleanPhone.length >= 10) {
                            acceptablePasswords.add(cleanPhone.slice(-10));
                            acceptablePasswords.add(cleanPhone);
                        }
                    }

                    if (cand.username) {
                        acceptablePasswords.add(cand.username);
                        acceptablePasswords.add(cand.username.toLowerCase());
                    }

                    if (cand.birthday) {
                        try {
                            const d = new Date(cand.birthday);
                            const dd = String(d.getDate()).padStart(2, '0');
                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                            const yyyy = d.getFullYear();
                            acceptablePasswords.add(`${dd}${mm}${yyyy}`);
                        } catch (e) {}
                    }

                    const userEnteredLower = rawPassword.toLowerCase();
                    const isMatch = Array.from(acceptablePasswords).some(
                        p => p && p.toLowerCase() === userEnteredLower
                    );

                    if (isMatch) {
                        const targetEmail = cand.email;
                        const teacherId = cand.teacherId;

                        if (authUser) {
                            await adminSupabase.auth.admin.updateUserById(authUser.id, {
                                password: rawPassword,
                                email_confirm: true,
                                user_metadata: {
                                    ...authUser.user_metadata,
                                    role: 'teacher',
                                    temp_password: rawPassword,
                                },
                            });
                        } else if (teacherId) {
                            try {
                                await adminSupabase.auth.admin.createUser({
                                    id: teacherId,
                                    email: targetEmail,
                                    password: rawPassword,
                                    email_confirm: true,
                                    user_metadata: {
                                        role: 'teacher',
                                        temp_password: rawPassword,
                                    },
                                });
                            } catch (createErr: any) {
                                if (createErr?.message?.includes("already been registered")) {
                                    const { data: { users } } = await adminSupabase.auth.admin.listUsers();
                                    const existing = (users || []).find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());
                                    if (existing) {
                                        await adminSupabase.auth.admin.updateUserById(existing.id, {
                                            password: rawPassword,
                                            email_confirm: true,
                                            user_metadata: { role: 'teacher', temp_password: rawPassword }
                                        });
                                    }
                                }
                            }
                        }

                        const retryAuth = await supabase.auth.signInWithPassword({
                            email: targetEmail,
                            password: rawPassword,
                        });

                        if (!retryAuth.error && retryAuth.data?.user) {
                            authData = retryAuth.data;
                            break;
                        }
                    }
                } catch (tErr) {
                    console.warn("Error in teacher adaptive authentication:", tErr);
                }
            }

            // Attempt 2b: If other staff candidate (admin, accountant, librarian, receptionist) and direct password failed
            if (cand.staffId && cand.role && cand.role !== 'student' && cand.role !== 'teacher') {
                try {
                    const acceptableStaffPasswords = new Set<string>();
                    acceptableStaffPasswords.add("dcpems@123");
                    acceptableStaffPasswords.add("dcpems123");
                    acceptableStaffPasswords.add("Dcpems@123");
                    if (cand.phone) {
                        const cleanPhone = cand.phone.replace(/\D/g, '');
                        if (cleanPhone.length >= 10) acceptableStaffPasswords.add(cleanPhone.slice(-10));
                    }
                    if (cand.username) acceptableStaffPasswords.add(cand.username.toLowerCase());

                    const isStaffMatch = Array.from(acceptableStaffPasswords).some(
                        p => p && p.toLowerCase() === rawPassword.toLowerCase()
                    );

                    if (isStaffMatch) {
                        await adminSupabase.auth.admin.updateUserById(cand.staffId, {
                            password: rawPassword,
                            email_confirm: true,
                            user_metadata: { role: cand.role, temp_password: rawPassword }
                        });
                        const retryAuth = await supabase.auth.signInWithPassword({
                            email: cand.email,
                            password: rawPassword,
                        });
                        if (!retryAuth.error && retryAuth.data?.user) {
                            authData = retryAuth.data;
                            break;
                        }
                    }
                } catch (staffErr) {
                    console.warn("Staff adaptive login error:", staffErr);
                }
            }

            // Attempt 3: If student candidate and direct password failed, test adaptive student password patterns
            if (cand.studentId) {
                try {
                    const { data: authUserRes } = await adminSupabase.auth.admin.getUserById(cand.studentId);
                    const authUser = authUserRes?.user;
                    const currentAuthPwd = authUser?.user_metadata?.temp_password;

                    // Build list of valid acceptable student passwords
                    const acceptablePasswords = new Set<string>();
                    acceptablePasswords.add("dcpems@123");

                    if (currentAuthPwd) {
                        acceptablePasswords.add(currentAuthPwd);
                        acceptablePasswords.add(currentAuthPwd.toLowerCase());
                    }

                    if (cand.rollNumber) {
                        const rawRoll = cand.rollNumber;
                        const num = parseInt(rawRoll, 10);
                        acceptablePasswords.add(`pass@${rawRoll}`);
                        acceptablePasswords.add(`pass@${rawRoll}`.toLowerCase());
                        acceptablePasswords.add(rawRoll);
                        if (!isNaN(num)) {
                            acceptablePasswords.add(`pass@${num}`);
                            acceptablePasswords.add(`pass@${num.toString().padStart(3, '0')}`);
                            acceptablePasswords.add(`pass@${num.toString().padStart(2, '0')}`);
                            acceptablePasswords.add(num.toString());
                        }
                    }

                    if (cand.birthday) {
                        try {
                            const d = new Date(cand.birthday);
                            const dd = String(d.getDate()).padStart(2, '0');
                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                            const yyyy = d.getFullYear();
                            acceptablePasswords.add(`${dd}${mm}${yyyy}`);
                        } catch (e) {}
                    }

                    const userEnteredLower = rawPassword.toLowerCase();
                    const isMatch = Array.from(acceptablePasswords).some(
                        p => p && p.toLowerCase() === userEnteredLower
                    );

                    if (isMatch) {
                        // Determine the preferred email to update in auth
                        const targetAuthEmail = cand.email.endsWith('@dcpems.internal') ? cand.email : (authUser?.email || cand.email);

                        // Preserve official roll password in metadata so it is not overwritten by dcpems@123
                        let preservedTempPassword = currentAuthPwd;
                        if (!preservedTempPassword && cand.rollNumber) {
                            const r = cand.rollNumber.length < 3 && /^\d+$/.test(cand.rollNumber) ? cand.rollNumber.padStart(3, '0') : cand.rollNumber;
                            preservedTempPassword = `pass@${r}`;
                        }
                        if (!preservedTempPassword) {
                            preservedTempPassword = rawPassword;
                        }

                        // Password is valid for this student! Sync to Supabase Auth and login
                        await adminSupabase.auth.admin.updateUserById(cand.studentId, {
                            email: targetAuthEmail,
                            email_confirm: true,
                            password: rawPassword,
                            user_metadata: {
                                role: 'student',
                                temp_password: preservedTempPassword,
                            },
                        });

                        // Try authenticating with the confirmed auth emails for this student
                        const emailsToTry = Array.from(new Set([targetAuthEmail, authUser?.email].filter(Boolean) as string[]));

                        for (const tryEmail of emailsToTry) {
                            const retryAuth = await supabase.auth.signInWithPassword({
                                email: tryEmail,
                                password: rawPassword,
                            });

                            if (!retryAuth.error && retryAuth.data?.user) {
                                authData = retryAuth.data;
                                break;
                            }
                        }

                        if (authData?.user) {
                            break;
                        }
                    }
                } catch (candErr) {
                    console.warn("Error checking adaptive student password:", candErr);
                }
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

