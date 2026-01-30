import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const HomePage = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/sign-in");
    }

    const role = user.user_metadata?.role;

    if (role) {
        redirect(`/${role}`);
    }

    return (
        <div className="flex items-center justify-center h-screen">
            Loading...
        </div>
    );
};

export default HomePage;
