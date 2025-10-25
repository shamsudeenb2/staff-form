

"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker"; // kept for parity with your packages
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

// Import from your nigeria.ts
import { nigeriaStates, getLgasByState } from "@/components/lib/nigeria";

// Shadcn UI components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Local components
import Card from "@/components/Card"; // kept import (even if not used) for consistency
import Navbar from "@/components/Navbar";

/* ---------------------------------- Zod ---------------------------------- */

const PersonalSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(7, "Enter phone").max(15),
  dob: z
    .string()
    .refine((v) => !!v && new Date(v).toString() !== "Invalid Date" && new Date(v) < new Date(), "DOB must be in the past"),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  address: z.string().optional(),
  state: z.string().min(1, "Select state"),
  lga: z.string().min(1, "Select LGA"),
  placeOfBirth: z.string().min(1, "Place Birth"),
  pensionAdmin: z.string().min(1, "Required"),
  penComNo: z.string().min(1, "Required"),
  nextOfKin: z.string().min(1, "Required "),
  nextOfKinPhone: z.string().min(1, "Required"),
  senatorialDistrict: z.string().min(1, "Required"),
  maritalStatus: z.enum(["SINGLE", "MARRIED"]).optional(),
});
type PersonalFormData = z.infer<typeof PersonalSchema>;

/* ------------------------------ Helpers/Utils ----------------------------- */

const isBrowser = () => typeof window !== "undefined";

const isValidISODate = (value?: string) => {
  if (!value || typeof value !== "string") return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
};

const displayDate = (iso?: string) =>
  isValidISODate(iso) ? format(new Date(iso as string), "yyyy-MM-dd") : "";

const draftKey = (phone: string | null ) =>
  phone ? `draft:${phone}:personal` : null;

/* ------------------------------ Reusable Parts ---------------------------- */

type DateInputFieldProps = {
  label: string;
  value?: string; // ISO string or ""
  onChange: (iso: string) => void;
  error?: string;
  startMonth?: Date;
  endMonth?: Date;
};
function DateInputField({
  label,
  value,
  onChange,
  error,
  startMonth = new Date(1960, 0),
  endMonth = new Date(new Date().getFullYear() + 1, 0),
}: DateInputFieldProps) {
  const selectedDate = isValidISODate(value) ? new Date(value!) : undefined;

  return (
    <div>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Input value={displayDate(value)} placeholder="Select date" readOnly />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d: Date | undefined) => {
              if (!d) return;
              const iso = d.toISOString(); // store full ISO
              onChange(iso);
            }}
            captionLayout="dropdown"
            startMonth={startMonth}
            endMonth={endMonth}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function PersonalDataPage() {
  const router = useRouter();

  // phone is read client-side only
  const [phone, setPhone] = useState<string | null>(null);
  useEffect(() => {
    if (!isBrowser()) return;
    const p = window.localStorage.getItem("nipost_phone");
    setPhone(p);
  }, []);

  const [lgas, setLgas] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors,isSubmitting },
    setValue,
    reset,
  } = useForm<PersonalFormData>({
    resolver: zodResolver(PersonalSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dob: "",
      gender: "MALE",
      maritalStatus: "SINGLE",
      address: "",
      state: "",
      lga: "",
      placeOfBirth: "",
      pensionAdmin: "",
      penComNo: "",
      nextOfKin: "",
      senatorialDistrict: "",
      nextOfKinPhone: "", 
    },
  });

  const watched = watch();
  const watchedState = watch("state");

  // Load draft when phone is ready
    // Load draft when phone is ready
      useEffect(() => {
        if (!phone || !isBrowser()) return;
        try {
          const key = draftKey(phone);
          const raw = key ? window.localStorage.getItem(key) : null;
          if (raw) {
            const parsed = JSON.parse(raw);
            reset(parsed);
            toast.success("Loaded saved draft");
          }
        } catch {
          // ignore parse errors
        }
      }, [phone, reset]);


  // Keep LGA list in sync with state
  useEffect(() => {
    if (watchedState) {
      setLgas(getLgasByState(watchedState));
    } else {
      setLgas([]);
    }
  }, [watchedState]);

  const onStateChange = (state: string) => {
    setValue("state", state, { shouldValidate: true });
    setValue("lga", "", { shouldValidate: true });
    setLgas(getLgasByState(state));
  };

  // Debounced draft save (per phone)
  const debouncedSave = useMemo(
    () =>
      debounce((values: PersonalFormData, p?: string | null) => {
        if (!isBrowser() || !p) return;
        const key = draftKey(p);
        if (!key) return;
        try {
          window.localStorage.setItem(key, JSON.stringify(values));
        } catch {
          // quota or other storage errors
        }
      }, 800),
    []
  );

  // Auto-save draft on any change
  useEffect(() => {
    debouncedSave(watched, phone);
    return () => {
      debouncedSave.cancel();
    };
  }, [watched, phone, debouncedSave]);

  const onSubmit = async (data: PersonalFormData) => {
    try {
      const phoneFromForm = data.phone || (isBrowser() ? window.localStorage.getItem("nipost_phone") : null);
      if (!phoneFromForm) {
        toast.error("Phone is missing. Validate your phone first.");
        return;
      }

      const res = await fetch("/api/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneFromForm, data }),
      });

      const j = await res.json();
      if (j?.success) {
        toast.success("Personal data saved");
        if (isBrowser()) {
          window.localStorage.setItem("nipost_phone", phoneFromForm);
          const key = draftKey(phoneFromForm);
          if (key) {
            // persist last known good draft
            window.localStorage.setItem(key, JSON.stringify(data));
          }
        }
        router.push("/register/education");
      } else {
        toast.error(j?.error || "Failed to save");
      }
    } catch (err) {
      toast.error("Server error");
      console.error(err);
    }
  };

  return (
    <>
      <Toaster />
      <Navbar
        breadcrumbs={[
          { label: "Personal Data" },
        ]}
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full"
      >
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-8">
          <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-3/4">
            <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
            <p className="text-sm text-gray-500 mb-6">
              Fill your details. We auto-save your progress — you can return later to continue.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(onSubmit)();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <Label>First name</Label>
                  <Input {...register("firstName")} />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <Label>Last name</Label>
                  <Input {...register("lastName")} />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <Label>Email</Label>
                  <Input {...register("email")} />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input {...register("phone")} />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <DateInputField
                  label="Date of birth"
                  value={watch("dob")}
                  onChange={(iso) => setValue("dob", iso, { shouldValidate: true })}
                  error={errors?.dob?.message as string | undefined}
                />

                <div>
                  <Label>Gender</Label>
                  <Select
                    value={watch("gender") || ""}
                    onValueChange={(v) => setValue("gender", v as any, { shouldValidate: true })}
                  >
                    <SelectTrigger className="border p-2 w-full rounded">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Place of Birth</Label>
                  <Input {...register("placeOfBirth")} />
                  {errors.placeOfBirth && (
                    <p className="text-sm text-red-600 mt-1">{errors.placeOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <Label>Marital Status</Label>
                  <Select
                    value={watch("maritalStatus") || ""}
                    onValueChange={(v) => setValue("maritalStatus", v as any, { shouldValidate: true })}
                  >
                    <SelectTrigger className="border p-2 w-full rounded">
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE">Single</SelectItem>
                      <SelectItem value="MARRIED">Married</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Senatorial District</Label>
                  <Input {...register("senatorialDistrict")} />
                  {errors.senatorialDistrict && (
                    <p className="text-sm text-red-600 mt-1">{errors.senatorialDistrict.message}</p>
                  )}
                </div>

                <div>
                  <Label>Address</Label>
                  <Input {...register("address")} />
                </div>

                <div>
                  <Label>State</Label>
                  <Select
                    value={watch("state") || "__unset__"}
                    onValueChange={(v) => {
                      if (v !== "__placeholder__") onStateChange(v);
                    }}
                  >
                    <SelectTrigger className="border p-2 w-full rounded">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-auto">
                      <SelectItem value="__unset__" disabled>
                        Select state
                      </SelectItem>
                      {nigeriaStates.map((s) => (
                        <SelectItem key={s.name} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && (
                    <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <Label>LGA</Label>
                  <Select
                    value={watch("lga") || "__unset__"}
                    onValueChange={(v) => {
                      if (v !== "__placeholder__") setValue("lga", v, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger className="border p-2 w-full rounded">
                      <SelectValue placeholder="Select LGA" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-auto">
                      {lgas.length === 0 ? (
                        <SelectItem value="__placeholder__" disabled>
                          -- select state first --
                        </SelectItem>
                      ) : (
                        <>
                          <SelectItem value="__unset__" disabled>
                            Select LGA
                          </SelectItem>
                          {lgas.map((l) => (
                            <SelectItem key={l} value={l}>
                              {l}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.lga && (
                    <p className="text-sm text-red-600 mt-1">{errors.lga.message}</p>
                  )}
                </div>

                <div>
                  <Label>Pension Administration</Label>
                  <Input {...register("pensionAdmin")} />
                  {errors.pensionAdmin && (
                    <p className="text-sm text-red-600 mt-1">{errors.pensionAdmin.message}</p>
                  )}
                </div>

                <div>
                  <Label>Pension Number</Label>
                  <Input {...register("penComNo")} />
                  {errors.penComNo && (
                    <p className="text-sm text-red-600 mt-1">{errors.penComNo.message}</p>
                  )}
                </div>

                <div>
                  <Label>Next Of Kin Name</Label>
                  <Input {...register("nextOfKin")} />
                  {errors.nextOfKin && (
                    <p className="text-sm text-red-600 mt-1">{errors.nextOfKin.message}</p>
                  )}
                </div>

                <div>
                  <Label>Next Of Kin Phone</Label>
                  <Input {...register("nextOfKinPhone")} />
                  {errors.nextOfKinPhone && (
                    <p className="text-sm text-red-600 mt-1">{errors.nextOfKinPhone.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleSubmit(onSubmit)()}
                  disabled={isSubmitting}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  {isSubmitting ? "Saving..." : "Save & Continue"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </motion.div>
    </>
  );
}
