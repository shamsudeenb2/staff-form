"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";

import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * Password rules (front-end & server-side validation must match):
 * - min 8 chars
 * - uppercase + lowercase
 * - number
 * - symbol
 */
const PasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number")
      .regex(/[^A-Za-z0-9]/, "Include at least one symbol"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof PasswordSchema>;

export default function CreatePasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string>("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  // Hydrate phone from localStorage (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = window.localStorage.getItem("nipost_phone") ?? "";
    setPhone(p);
    // also set into form if needed (not required)
  }, []);

  // Password strength helper (simple)
  const password = watch("password") || "";
  const strength = (() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return { score, pct: (score / 5) * 100 };
  })();

  async function onSubmit(values: FormValues) {
    if (!phone) {
      toast.error("Phone not found. Please validate your phone first.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/register/create-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password: values.password }),
      });
      const j = await res.json();
      if (!res.ok) {
        toast.error(j?.error || "Failed to set password");
        setSubmitting(false);
        return;
      }
      toast.success("Password created — you can now log in.");
      // optional: redirect to login
      setTimeout(() => router.push("/login"), 900);
    } catch (err) {
      console.error(err);
      toast.error("Server error while creating password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Toaster />
      <Navbar breadcrumbs={[{ label: "Create Password" }]} />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-blue-600" />
              <h2 className="text-xl font-semibold">Create a secure password</h2>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Create a password for your account. Use a strong password — we will store it securely.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Phone</Label>
                <Input value={phone} readOnly placeholder="Phone used for account" />
                {!phone && (
                  <p className="text-sm text-yellow-600 mt-1">Phone missing — complete phone verification first.</p>
                )}
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={show ? "text" : "password"}
                    className="w-full border px-3 py-2 rounded pr-10"
                    placeholder="Enter a strong password"
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-80"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-sm text-red-600 mt-1">{errors.password.message as string}</p>
                ) : (
                  <div className="mt-2">
                    <div className="h-2 bg-slate-200 rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-200 ${strength.pct >= 80 ? "bg-green-500" : strength.pct >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
                        style={{ width: `${strength.pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Strength: {["Very weak", "Weak", "Okay", "Good", "Strong"][Math.max(0, strength.score - 1)] || "Very weak"}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label>Confirm Password</Label>
                <Input {...register("confirm")} type={show ? "text" : "password"} placeholder="Confirm password" />
                {errors.confirm && <p className="text-sm text-red-600 mt-1">{errors.confirm.message as string}</p>}
              </div>

              <div className="flex gap-3 mt-4">
                <Button type="submit" disabled={submitting || !phone}>
                  {submitting ? "Saving..." : "Create Password"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </main>
    </>
  );
}
