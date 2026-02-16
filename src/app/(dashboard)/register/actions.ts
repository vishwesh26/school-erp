"use server";

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { studentRegistrationSchema, StudentRegistrationSchema } from "@/lib/formValidationSchemas";
import { sendWelcomeEmail } from "@/lib/mail";

export async function registerStudent(prevState: any, formData: FormData) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Convert FormData to object for Zod (handling file separately if needed, but actions receive FormData)
    const rawData: Record<string, any> = {};
    formData.forEach((value, key) => {
        rawData[key] = value;
    });

    // Handle keys that might be missing or need coercion
    // image handling: formData.get('img') -> File
    const imgFile = formData.get("img") as File;

    // Validate
    const validatedFields = studentRegistrationSchema.safeParse({
        ...rawData,
        grade: Number(rawData.grade),
        img: (imgFile && imgFile.size > 0) ? imgFile : undefined,
    });

    if (!validatedFields.success) {
        return { success: false, errors: validatedFields.error.flatten().fieldErrors };
    }

    const { data } = validatedFields;

    // 1. Upload Image (if exists)
    let imgUrl = "";
    if (data.img) {
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("avatars") // Assuming bucket exists
            .upload(`students/${Date.now()}_${data.img.name}`, data.img);

        if (uploadError) {
            console.error("Image upload failed:", uploadError);
            // Proceed without image or return error? Proceeding.
        } else {
            imgUrl = supabase.storage.from("avatars").getPublicUrl(uploadData.path).data.publicUrl;
        }
    }

    // 2. Handle Parent (Create or Reuse)
    let parentId = "";

    // Check if Parent already exists by Email or Phone
    const { data: existingParent } = await supabase
        .from("Parent")
        .select("id")
        .or(`email.eq.${data.parentEmail},phone.eq.${data.parentPhone}`)
        .limit(1)
        .single();

    if (existingParent) {
        parentId = existingParent.id;
        console.log("Reusing existing parent:", parentId);
    } else {
        // Create New Parent
        const newParentId = randomUUID();
        const { error: parentError } = await supabase
            .from("Parent")
            .insert({
                id: newParentId,
                name: data.parentName,
                surname: data.parentSurname,
                email: data.parentEmail,
                phone: data.parentPhone,
                address: data.parentAddress,
                username: `parent_${Date.now()}`,
            });

        if (parentError) {
            return { success: false, message: "Failed to create parent record: " + parentError.message, errors: {} };
        }
        parentId = newParentId;
    }

    // 3. Find Grade and Class (for new students only, but needed for lookup)
    let { data: gradeData, error: gradeError } = await supabase
        .from("Grade")
        .select("id, level")
        .eq("level", data.grade)
        .single();

    // If Grade doesn't exist, create it
    if (gradeError || !gradeData) {
        const { data: newGrade, error: createGradeError } = await supabase
            .from("Grade")
            .insert({ level: data.grade })
            .select("id, level")
            .single();

        if (createGradeError || !newGrade) {
            return { success: false, message: "Failed to create new Grade: " + createGradeError?.message, errors: {} };
        }
        gradeData = newGrade;
    }

    // Check if student already exists (Match by email AND name to distinguish siblings)
    const { data: existingStudent } = await supabase
        .from('Student')
        .select('id, rollNumber, username, classId')
        .eq('email', data.email)
        .eq('name', data.name)
        .eq('surname', data.surname)
        .limit(1)
        .single();

    let rollNumber = "";
    let username = "";
    let finalClassId = 0;
    let isNewRegistration = !existingStudent;

    if (existingStudent) {
        rollNumber = existingStudent.rollNumber;
        username = existingStudent.username;
        finalClassId = existingStudent.classId;
        console.log("Reusing existing student credentials:", { rollNumber, username });
    } else {
        // Generate NEW credentials
        let { data: classesData, error: classError } = await supabase
            .from("Class")
            .select("id, name")
            .eq("gradeId", gradeData.id);

        if (classError || !classesData || classesData.length === 0) {
            const { data: classA } = await supabase
                .from("Class")
                .insert({ name: `${gradeData.level}A`, capacity: 20, gradeId: gradeData.id })
                .select("id, name")
                .single();

            const { data: classB } = await supabase
                .from("Class")
                .insert({ name: `${gradeData.level}B`, capacity: 20, gradeId: gradeData.id })
                .select("id, name")
                .single();

            classesData = [];
            if (classA) classesData.push(classA);
            if (classB) classesData.push(classB);
        }

        const randomClass = classesData[Math.floor(Math.random() * classesData.length)];
        finalClassId = randomClass.id;

        const { count: studentCount } = await supabase
            .from("Student")
            .select("*", { count: "exact", head: true })
            .eq("classId", randomClass.id);

        rollNumber = ((studentCount || 0) + 1).toString().padStart(3, '0');
        username = `${randomClass.name}-${rollNumber}`;
    }

    // Generate strictly random password (8 chars) - always generated but only used for new users
    const password = randomUUID().slice(0, 8);

    // 4. Create or Recover Auth User for Student
    let authUserId = "";
    // We use a unique internal email for Supabase Auth because Supabase 
    // requires unique emails, but students might share a parent's email.
    const authEmail = `${username.toLowerCase()}@dcpems.internal`;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: authEmail,
        password: password,
        email_confirm: true,
        user_metadata: { role: "student", actual_email: data.email }
    });

    if (authError) {
        if (authError.message.toLowerCase().includes("already") || authError.status === 422) {
            // Recover: Find existing user id
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
            if (listError) return { success: false, message: "Recovery failed: " + listError.message, errors: {} };

            const existingUser = users.find(u => u.email === authEmail);
            if (existingUser) {
                authUserId = existingUser.id;
                // Force update password to match the one we'll send in the email
                await supabase.auth.admin.updateUserById(authUserId, { password: password });
                console.log("Updated/Synced password for existing user:", authUserId);
            } else {
                return { success: false, message: "User exists in Auth but not found in list: " + authError.message, errors: {} };
            }
        } else {
            return { success: false, message: "Registration failed (Auth): " + authError?.message, errors: {} };
        }
    } else if (authData.user) {
        authUserId = authData.user.id;
    }

    // 5. Create or Update Student Record
    const studentPayload = {
        id: authUserId,
        username: username,
        rollNumber: rollNumber,
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        img: imgUrl,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday.toISOString(),
        gradeId: gradeData.id,
        classId: finalClassId,
        parentId: parentId,
        aadharNo: data.aadharNo,
        stateStudentId: data.stateStudentId,
        pen: data.pen,
        apaarId: data.apaarId
    };

    let studentOps;
    if (existingStudent) {
        studentOps = await supabase.from("Student").update(studentPayload).eq('id', existingStudent.id);
    } else {
        studentOps = await supabase.from("Student").insert(studentPayload);
    }

    if (studentOps.error) {
        return { success: false, message: "Failed to save student profile: " + studentOps.error.message, errors: {} };
    }


    // 6. Send Welcome Email (ONLY for new registrations)
    if (isNewRegistration) {
        try {
            // Get class name for email
            const { data: cls } = await supabase.from('Class').select('name').eq('id', finalClassId).single();
            await sendWelcomeEmail(
                data.email,
                data.name,
                password,
                "student",
                username,
                rollNumber,
                `${cls?.name || 'Class'} (Grade ${gradeData.level})`
            );
        } catch (mailErr) {
            console.error("Failed to send welcome email:", mailErr);
            // Non-blocking
        }
    }
    return { success: true, message: isNewRegistration ? "Registration successful! Welcome email sent." : "Profile updated successfully.", errors: {} };
}

export async function registerUser(prevState: any, formData: FormData) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const rawData: Record<string, any> = {};
    formData.forEach((value, key) => {
        rawData[key] = value;
    });

    const role = rawData.role as string;

    // For Student, we use the existing specialized logic if needed, 
    // or we can generalize. Let's try to handle Admin and Accountant first as requested.

    if (role === "admin" || role === "accountant" || role === "teacher" || role === "librarian" || role === "reception") {
        // Simple User Creation
        const { email, name, surname, phone, address } = rawData;

        // Auto-generate password
        const password = randomUUID().slice(0, 8);

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role }
        });

        if (authError) return { success: false, message: authError.message, errors: {} };

        const userId = authData.user.id;

        // 2. Insert into corresponding table
        let table = "";
        if (role === "admin") table = "Admin";
        else if (role === "accountant") table = "Accountant";
        else if (role === "teacher") table = "Teacher";
        else if (role === "librarian") table = "Librarian";
        else if (role === "reception") table = "Receptionist";

        if (table) {
            const payload: any = { id: userId };

            const generatedUsername = email.split("@")[0] + "_" + Date.now().toString().slice(-4);
            payload.username = generatedUsername;

            if (role !== "admin") {
                payload.name = name;
                payload.surname = surname;
                payload.email = email;
                payload.phone = phone;
                payload.address = address;
            }

            if (role === "teacher" || role === "accountant" || role === "librarian" || role === "reception") {
                payload.bloodType = "O";
                payload.sex = "MALE";
                payload.birthday = new Date().toISOString();
            }

            const { error: dbError } = await supabase.from(table).insert(payload);
            if (dbError) {
                console.error(`Failed to insert into ${table}:`, dbError);
                return { success: false, message: `Account created but failed to save profile to ${table}: ${dbError.message}`, errors: {} };
            }

            // 3. Send Welcome Email to Staff
            try {
                await sendWelcomeEmail(
                    email,
                    name || generatedUsername,
                    password,
                    role,
                    generatedUsername
                );
            } catch (mailErr) {
                console.error("Failed to send welcome email to staff:", mailErr);
            }
        }

        return { success: true, message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully! Login details sent to your email.`, errors: {} };
    }

    // Default to student registration if role is student
    if (role === "student") {
        return registerStudent(prevState, formData);
    }

    return { success: false, message: "Invalid role selected", errors: {} };
}
