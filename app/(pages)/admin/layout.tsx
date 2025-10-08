import { ReactNode } from "react";
import { getSession } from "@/app/config/auth"; // adjust path to your next-auth config
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  // If no session, redirect to login
   console.log("user name : admin/layout", session?.user)
  if (!session) {
    redirect("/login");
    // return <>{children}</>;
  }

    // Only allow Admin
  if (session?.user?.role == null) {
    const baseUrl = process.env.NEXTAUTH_URL;
      const userId = session?.user?.id;
    if (userId) {
        // Construct the URL string using the relative path
        redirect(`/users/${userId}`);
    } else {
        // Handle case where user ID is missing (e.g., redirect to login)
        redirect('/login'); 
    }
  }

  // // Only allow Admin
  if (session?.user?.role !== "admin") {
        const userId = session?.user?.id;
    if (userId) {
        // Construct the URL string using the relative path
        redirect(`/users/${userId}`);
    } else {
        // Handle case where user ID is missing (e.g., redirect to login)
        redirect('/auth/signin'); 
    }
  }

  return <>{children}</>;
}
