import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const HomePage = async () => {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            redirect("/sign-in");
        }

        const role = user.user_metadata?.role;

        if (role) {
            redirect(`/${role}`);
        }
    } catch (err: any) {
        if (
            err?.message === "NEXT_REDIRECT" ||
            (typeof err?.digest === "string" && err.digest.includes("NEXT_REDIRECT"))
        ) {
            throw err;
        }
        console.error("Home page auth error:", err);
        redirect("/sign-in");
    }

    return (
        <div className="flex items-center justify-center h-screen">
            Loading...
        </div>
    );
};

export default HomePage;
