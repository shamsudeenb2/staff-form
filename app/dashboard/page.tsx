// app/validate-phone/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ValidatePhone() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.verified) {
      router.push("/register/personal"); // Already validated
    } else if (data.success) {
      localStorage.setItem("phone", phone);
      router.push("/otp-verification");
    } else {
      setError("Something went wrong");
    }
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Validate your phone</h1>
      <form onSubmit={handleSubmit}>
        <input
          className="border w-full p-2 mb-2"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {error && <p className="text-red-600">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Send OTP
        </button>
      </form>
    </main>
  );
}
