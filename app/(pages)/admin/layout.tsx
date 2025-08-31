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
  if (session?.user?.role === null) {
    redirect(`/users/${session?.user?.id}`);
  }

  // // Only allow Admin
  if (session?.user?.role !== "admin") {
    redirect(`/users/${session?.user?.id}`);
  }

  return <>{children}</>;
}
