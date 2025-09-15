"use client";

import { useState, useEffect,useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import { motion } from "framer-motion";
import OtpInputs from "@/components/OtpInputs";


export default function OtpVerification() {
  const router = useRouter();
  const phone = typeof window !== "undefined" ? localStorage.getItem("phone") : null;
  const inputs = useRef<(HTMLInputElement | null)[]>([]);


  const [otp, setOtp] = useState(Array(6).fill(""));
  // const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, []);


    const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next box if digit entered
      if (value && index < 5) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e:React.KeyboardEvent, index:number) => {
  // Backspace: move to previous box and clear current box
  const target = e.target as HTMLInputElement;
  if (e.key === "Backspace" && index > 0) {
    // If current box is empty, focus on the previous box
    if (!target.value) {
      inputs.current[index - 1]?.focus();
      e.preventDefault(); // Prevents the browser's default behavior
    }
  }
  // Left arrow key: move to previous box
  else if (e.key === "ArrowLeft" && index > 0) {
    inputs.current[index - 1]?.focus();
  }
  // Right arrow key: move to next box
  else if (e.key === "ArrowRight" && index < 5) {
    inputs.current[index + 1]?.focus();
  }
};


  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true)
    const code = otp.join("");
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone, code: code }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if(!res.ok){
      setError(data.error);
      setLoading(false)
    }
    if (!data.success) {
      setError("Invalid OTP");
      setLoading(false)
      
    } else {
      router.push("/register/personal");
      setLoading(false)
    }
  }
  

  if (timeLeft <= 0) {
    return (
      <>
        <Navbar breadcrumbs={[{ label: "Validate Phone", href: "/validate-phone" }, { label: "OTP Expired" }]} />
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
          <Card>
            <h1 className="text-xl font-bold text-center text-red-600">Your OTP has expired</h1>
            <p className="text-gray-600 text-center my-4">Please try again</p>
            <a
              href="/"
              className="block w-full text-center bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </a>
          </Card>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar breadcrumbs={[{ label: "Validate Phone", href: "/validate-phone" }, { label: "OTP Verification" }]} />
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
         <motion.div
          className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
         >
        <Card>
          <div className="text-center mb-4">
            <ShieldCheck className="mx-auto text-green-600" size={40} />
            <h1 className="text-2xl font-bold text-gray-800 mt-2">Enter OTP</h1>
            <p className="text-gray-500 text-sm">We sent an OTP to your phone</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex justify-center gap-2 mb-4">
              <OtpInputs otp={otp} setOtp={setOtp}/>
            </div>
            <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
              <Clock size={16} /> Time left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
            disabled={loading}
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
            >
              {loading?"Verifying..":"Verify OTP"}
            </button>
          </form>
        </Card>
        </motion.div>
      </main>
    </>
  );
}
