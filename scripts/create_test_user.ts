const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or Service Key in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    const email = "user@test.com";
    const password = "user123";
    const role = "admin";

    console.log(`Creating user: ${email}...`);

    // 1. Create User in Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role },
    });

    let userId;

    if (authError) {
        console.log("Supabase Auth Error:", authError.message);
        if (authError.message.includes("already been registered")) {
            console.log("User exists, fetching details...");
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
            if (listError) {
                console.error("Failed to list users:", listError);
                return;
            }
            const user = users.find((u: any) => u.email === email);
            if (user) {
                userId = user.id;
                console.log("Found existing ID:", userId);
                // Update metadata just in case
                const { error: updateError } = await supabase.auth.admin.updateUserById(
                    userId,
                    { user_metadata: { role: "admin" } }
                );
                if (updateError) {
                    console.error("Failed to update user metadata:", updateError);
                } else {
                    console.log("Updated user metadata to role: admin");
                }
            } else {
                console.error("Could not find user in list despite error.");
                return;
            }
        } else {
            return;
        }
    } else {
        userId = authData.user?.id;
        console.log(`Supabase User Created. ID: ${userId}`);
    }

    // 2. Create User in Admin Table
    // Check if admin exists
    const { data: existing, error: existingError } = await supabase
        .from("Admin")
        .select("id")
        .eq("id", userId)
        .single();

    if (!existing && (!existingError || existingError.code === "PGRST116")) { // PGRST116 is 'not found'
        const { error: insertError } = await supabase
            .from("Admin")
            .insert({
                id: userId,
                username: "admin_test",
            });

        if (insertError) {
            console.error("Error creating Admin record:", insertError);
        } else {
            console.log("Supabase Admin record created.");
        }
    } else {
        console.log("Supabase Admin record already exists or error checking:", existingError?.message);
    }

    // Check role
    const { data: { user } } = await supabase.auth.getUser(userId); // Use admin API
    const userAdmin = await supabase.auth.admin.getUserById(userId);
    console.log("User Role:", userAdmin.data.user?.user_metadata?.role);

    console.log("✅ Success! You can now login with user@test.com / user123");
}

main()
    .catch((e) => console.error(e));
