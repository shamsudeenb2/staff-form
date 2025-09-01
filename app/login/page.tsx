"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * Login form schema
 */
const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  // Pre-fill email if user recently used an email (optional)
  useEffect(() => {
    try {
      const savedEmail = typeof window !== "undefined" ? localStorage.getItem("nipost_email") : null;
      if (savedEmail) setValue("email", savedEmail);
    } catch {
      /* ignore */
    }
  }, [setValue]);

  async function onSubmit(data: LoginFormValues) {
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (!res?.ok) {
      toast.error("Invalid email or password.");
      setLoading(false);
        return;
    }

      // On success the API sets an HttpOnly cookie (nipost_token).
      // Save some client-side fallback / preferences:
      if (data.remember) {
        try {
          localStorage.setItem("nipost_email", data.email);
        } catch {
          /* ignore */
        }
      } else {
        try {
          localStorage.removeItem("nipost_email");
        } catch {}
      }
    toast.success("Logged in");
      // Redirect to dashboard or homepage
      router.push("/admin/dashboard"); // change if you have a dashboard route
  }

  return (
    <>
      <Toaster />
      <Navbar/>
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card>
            <div className="flex items-center justify-center gap-3 mb-4">
              <User className="text-blue-600" />
              <h2 className="text-xl font-semibold ">Sign in to your account</h2>
            </div>

            <p className="text-sm text-gray-600 mb-4 text-center">
              Log in using the email you provided.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input {...register("email")} placeholder="you@domain.com" />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className="w-full border px-3 py-2 rounded pr-10"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-80"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register("remember")} />
                  <span>Remember me</span>
                </label>

                <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>

              <div className="flex gap-3 mt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => window.location.href = "/"}>
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
