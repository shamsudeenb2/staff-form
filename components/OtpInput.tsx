// import { useState, useRef } from "react";
// import { motion } from "framer-motion";

// export default function OtpInput({ length = 6, onComplete }) {
//   const [values, setValues] = useState(Array(length).fill(""));
//   const inputsRef = useRef([]);

//   const handleChange = (value, idx) => {
//     if (/^[0-9]?$/.test(value)) {
//       const newValues = [...values];
//       newValues[idx] = value;
//       setValues(newValues);

//       if (value && idx < length - 1) {
//         inputsRef.current[idx + 1].focus();
//       }

//       if (newValues.join("").length === length) {
//         onComplete(newValues.join(""));
//       }
//     }
//   };

//   const handleKeyDown = (e, idx) => {
//     if (e.key === "Backspace" && !values[idx] && idx > 0) {
//       inputsRef.current[idx - 1].focus();
//     }
//   };

//   return (
//     <div className="flex gap-2">
//       {values.map((val, idx) => (
//         <motion.input
//           key={idx}
//           ref={el => (inputsRef.current[idx] = el)}
//           type="text"
//           inputMode="numeric"
//           maxLength="1"
//           value={val}
//           onChange={(e) => handleChange(e.target.value, idx)}
//           onKeyDown={(e) => handleKeyDown(e, idx)}
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ duration: 0.2 }}
//           className="w-12 h-12 rounded-xl border text-center text-lg font-bold focus:outline-none focus:border-blue-500"
//         />
//       ))}
//     </div>
//   );
// }

"use client";
import { useState, useRef } from "react";

export default function OtpInput({ onChange }: { onChange: (value: string) => void }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      onChange(newOtp.join(""));

      // Move to next box if digit entered
      if (value && index < 5) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          value={digit}
          maxLength={1}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-12 h-12 text-center border border-gray-400 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
        />
      ))}
    </div>
  );
}
