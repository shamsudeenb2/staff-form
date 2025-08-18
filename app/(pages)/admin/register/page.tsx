"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useRouter } from "next/navigation";

 const userSchema = z.object({
  id: z.string().min(3),
  role: z.enum(["admin", "staff",]),
});

type FormData = z.infer<typeof userSchema>;

export default function RegisterUser() {
//   const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userData, setData] = useState<string[]>([]);
   const router = useRouter();

  const { register, handleSubmit,watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(userSchema),
  });

    useEffect(() => {
    async function getUsers() {
        try { 
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Network error");
            const data =  await res.json();
            console.log("users lis", data)
            setData(data)
            }
            catch {
                toast.error("Fail to fetch users")
            }
          }
            getUsers();
         }, []);
    
    const onStateChange = (id: string) => {
        setValue("id", id, { shouldValidate: true });
      };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    console.log("data lets see",data)
    try {
      const user = await axios.put("/api/admin/users", data);
      console.log("registration", user)
      const userId = user?.data?.user?.id;
      toast.success( "User registered successfully." );

    //   setTimeout(() => {
    //     router.push(`/admin/fingerprint-capture/${userId}`);
    //   }, 1000);

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong." );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
    <Card className="max-w-xl mx-auto mt-10">
      <CardContent className="space-y-4 py-6">
        <h2 className="text-2xl font-bold text-center">Register New Employee</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label>State</Label>
                    <Select
                        value={watch("id") || "__unset__"}
                        onValueChange={(v) => {
                     if (v !== "__placeholder__") onStateChange(v);
                              }}
                            >
                              <SelectTrigger className="border p-2 w-full rounded">
                                <SelectValue placeholder="Select user" />
                              </SelectTrigger>
                              <SelectContent className="max-h-60 overflow-auto">
                                <SelectItem value="__unset__" disabled>
                                  Select user
                                </SelectItem>
                                {userData.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.id && (
                              <p className="text-sm text-red-600 mt-1">{errors.id.message}</p>
                            )}
                          </div>
          <div className="border p-2 w-full rounded">
            <Label>Role</Label>
            <Select onValueChange={(value) => setValue("role", value as FormData["role"])} >
              <SelectTrigger className="border p-2 w-full rounded">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">staff</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "update"}
          </Button>
        </form>
      </CardContent>
    </Card>
  </DashboardLayout>
  );
}
