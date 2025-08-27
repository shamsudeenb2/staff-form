"use client";

import { Home, UserPlus, Fingerprint, Menu, Users, QrCode, LogOut, User2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { getSession } from "@/app/config/auth";
import { signOut, useSession } from "next-auth/react";

type Role = "admin" | "supervisor" | "staff";

// Example: Replace with user role from auth context or API


const menuByRole: Record<Role, { name: string; href: string; icon: any }[]> = {
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Register User", href: "/admin/register", icon: UserPlus },
    // { name: "Capture Fingerprint", href: "/admin/fingerprint-capture", icon: Fingerprint },
    // { name: "Generate Qr-Code", href: "/admin/qr-code", icon: QrCode },
    // { name: "Departments", href: "/departments", icon: Users },
  ],
  supervisor: [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Capture Fingerprint", href: "/fingerprint-lookup", icon: Fingerprint },
    { name: "Departments", href: "/departments", icon: Users },
  ],
  staff: [
    { name: "Dashboard", href: "/users", icon: Home },
    { name: "Bio Data", href: "/users/", icon: User2 },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const {data: session} = useSession()
  const currentUserRole: Role = session?.user?.role;

  const isActive = (href: string) => pathname === href;
  const menu = menuByRole[currentUserRole];
  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-900 text-white rounded-md"
        onClick={() => setOpen(!open)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-blue-900 text-white flex flex-col transform transition-transform duration-300 z-40",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-700">
          <div className="text-2xl font-bold">NIPOST</div>
          {/* <p className="text-sm text-blue-200">Attendance System</p> */}
        </div>

        {/* Animated menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menu.map((item, index) => {
            const active = isActive(item.href);

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                    active
                      ? "bg-blue-700 font-semibold"
                      : "hover:bg-blue-700 hover:font-medium"
                  )}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  {item.name}
                </Link>
              </motion.div>
            );
          })}
        <button onClick={()=>signOut({callbackUrl: '/login'})} 
          className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-blue-700 hover:font-medium")}>
         <motion.div
           whileHover={{ scale: 1.2, rotate: 10 }}
           whileTap={{ scale: 0.95 }}>
            <LogOut className="w-5 h-5" />
         </motion.div>
        <span className="hidden lg:block">Logout</span>
        </button>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-700 text-sm text-blue-200">
          © {new Date().getFullYear()} MyCompany
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
