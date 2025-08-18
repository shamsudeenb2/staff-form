"use client";

import { Bell, LogIn } from "lucide-react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const {data: session} = useSession()
  return (
    <header className="fixed top-0 left-0 lg:left-0 right-0 h-16 bg-white shadow flex items-center justify-between px-6 z-20">
      {session?(
      <>
      <div className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-gray-700">
       Nigerian Postal Service
      </div>
      {/* Centered App Name */}
        <div className="ml-auto flex items-center gap-6">
        <button className="relative hover:text-blue-700">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        <div className="flex items-center gap-2">
          {/* <Image
            src="/user-avatar.png"
            alt="User Avatar"
            width={32}
            height={32}
            className="rounded-full"
          /> */}
          <span className="font-medium text-gray-700 hidden sm:inline">
            {session?.user?.name}
          </span>
        </div>
      </div>
      </>):(<div>
            <div className="absolute left-1/2 transform -translate-x-1/2 text- center text-xl font-bold text-gray-700">
             Nigerian Postal Service
            </div>
            <button onClick={()=>signIn('/')}
             className={cn(" flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-blue-700 hover:font-medium")}>
             <LogIn className="w-5 h-5" />
              signIn
            </button> 
          </div>)}
    </header>
  );
}
