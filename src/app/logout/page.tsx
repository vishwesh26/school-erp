import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const LogoutPage = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/sign-in");
};

export default LogoutPage;
