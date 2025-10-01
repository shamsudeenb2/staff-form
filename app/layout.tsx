import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster, toast } from 'sonner'
import { getSession } from "@/app/config/auth"
// import { SocketProvider } from '@/app/contexts/SocketContext';

import SessionProvider from '@/app/config/SessionProvider'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Staff form",
  description: "This site was created for staff of the nigerian postal service",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession()
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
         {/* <SocketProvider> */}
          <Toaster />
          {children}
        {/* </SocketProvider> */}
       </SessionProvider>
      </body>
    </html>
  );
}
