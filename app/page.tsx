"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import { motion } from "framer-motion";

export default function ValidatePhone() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    // e.preventDefault();
    setLoading(true)
    console.log("lets see the phone", phone)
    const res = await fetch("/api/otp/send", {
      method: "POST",
      body: JSON.stringify({phone}),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok){
      console.log("res error", res)
      setError(data.error);
      setLoading(false)
    }else{
      if (data.verified) {
        router.push("/register/personal");

    } else if (data.success) {
      localStorage.setItem("phone", phone);

      router.push("/otp-verification");
    } else if (data.done) {
      localStorage.setItem("phone", phone);
      router.push("/login");
    }
    else {
      setError("Something went wrong");
      setLoading(false)
    }  
  }
    }

    // const data = await res.json();
   

  return (
    <>
      <Navbar breadcrumbs={[{ label: "Validate Phone" }]} />
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
         <motion.div
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <div className="text-center mb-4">
            <Phone className="mx-auto text-blue-600" size={40} />
            <h1 className="text-2xl font-bold text-gray-800 mt-2">Phone Verification</h1>
            <p className="text-gray-500 text-sm">
              Enter your phone number to receive an OTP
            </p>
          </div>

          <div  className="space-y-4">
            <input
              type="tel"
              placeholder="e.g. 08012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-gray-300 w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              disabled={loading}
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <Send size={18} /> {loading?"sending ...": "Send OTP"}
            </button>
          </div>
        </Card>
        </motion.div>
      </main>
    </>
  );
}
