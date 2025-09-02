"use client";

import React, { useRef, useState, useEffect } from "react";

export default function OtpInputs({
  otp,
  setOtp,
  length = 6,
  onChange,
}: {
  otp: any[]
  setOtp:React.Dispatch<React.SetStateAction<string[]>>
  length?: number;
  onChange?: (code: string) => void;
}) {
//   const [otp, setOtp] = useState<string[]>(() => Array(length).fill(""));
  // ref array of inputs
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // ensure ref array has correct length after first render
  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    onChange?.(otp.join(""));
  }, [otp, onChange]);

  const handleChange = (value: string, index: number) => {
    // keep only digits, max 1 char
    const digit = value.replace(/\D/g, "").slice(0, 1);
    if (!/^\d?$/.test(digit)) return;

    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    // focus next if entered
    if (digit && index < length - 1) {
      const nextEl = inputsRef.current[index + 1];
      nextEl?.focus();
      nextEl?.select?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const key = e.key;

    if (key === "Backspace") {
      e.preventDefault();
      setOtp((prev) => {
        const next = [...prev];
        if (next[index]) {
          // clear current
          next[index] = "";
        } else if (index > 0) {
          // move to previous and clear it
          const prevIdx = index - 1;
          inputsRef.current[prevIdx]?.focus();
          next[prevIdx] = "";
        }
        return next;
      });
    } else if (key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    } else if (key === "Enter") {
      // optional: submit attempt
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").trim().replace(/\D/g, "");
    if (!pasted) return;
    const chars = pasted.split("").slice(0, length);
    setOtp((prev) => {
      const next = [...prev];
      for (let i = 0; i < chars.length; i++) next[i] = chars[i];
      return next;
    });
    const focusIndex = Math.min(chars.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
    inputsRef.current[focusIndex]?.select?.();
  };

  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          inputMode="numeric"
          pattern="\d*"
          type="text"
          maxLength={1}
          value={otp[i]}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          ref={(el: HTMLInputElement | null) => {
            // IMPORTANT: don't return anything here — block body returns void
            inputsRef.current[i] = el;
          }}
          className="w-12 h-12 text-center rounded border shadow-sm focus:outline-none focus:ring"
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
