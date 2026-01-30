import FormContainer from "@/components/FormContainer";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const SettingsPage = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/sign-in");
    }

    const role = user.user_metadata?.role;
    const userId = user.id;

    // We reuse the existing Edit Form Logic
    // We need to fetch the data to pre-fill the form, but FormContainer handles fetching related data.
    // We just need to pass the correct table, type="update", and the data itself (or let FormContainer fetch? No, FormContainer expects data prop or id).
    // Actually FormContainer takes 'data' for pre-filling. It doesn't fetch the record itself usually, just related data.
    // So we fetch record here.

    let userData;
    if (role) {
        // capitalize first letter for table name
        const table = role.charAt(0).toUpperCase() + role.slice(1);
        const { data, error } = await supabase.from(table).select('*').eq('id', userId).single();
        if (!error) userData = data;
    }

    if (!userData) {
        return <div>Error loading user data.</div>
    }

    // Map role to table name for FormContainer
    const tableMap: { [key: string]: "teacher" | "student" | "parent" } = {
        teacher: "teacher",
        student: "student",
        parent: "parent",
        admin: "teacher" // Admin might use teacher form or none? Let's assume admin uses teacher form or disable for now.
    };

    const table = tableMap[role as string];

    if (!table) return <div>Settings not available for this role.</div>

    return (
        <div className="p-4 bg-white rounded-md m-4 min-h-[calc(100vh-100px)]">
            <h1 className="text-xl font-semibold mb-8">Settings</h1>

            <div className="max-w-4xl">
                <h2 className="text-lg font-medium mb-4">Update Profile</h2>
                {/* We reuse FormContainer but we might need to adjust it to show embedded form instead of modal? 
              FormContainer renders a button that opens a modal. 
              For settings, an inline form is better, but reusing Modal is faster for now to ensure functionality.
          */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <p className="mb-4 text-gray-500">Edit your profile information below.</p>
                    {/* 
                  FormContainer renders a button. We can label it "Edit Profile". 
                  The icon logic in FormModal might need a tweak or we just accept the pen icon.
               */}
                    <div className="flex items-center gap-4">
                        <span>Click to edit:</span>
                        <FormContainer table={table} type="update" data={userData} id={userId} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
