"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { format, isValid, parseISO } from "date-fns";

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

import Card from "@/components/Card";
import Navbar from "@/components/Navbar";

// ------------------ Schema ------------------
const PersonalSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(7, "Enter phone").max(20),
  dob: z.string().refine((v) => !!v && !Number.isNaN(new Date(v).getTime()), {
    message: "Invalid date",
  }),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  address: z.string().optional(),
  state: z.string().min(1, "Select state"),
  lga: z.string().min(1, "Select LGA"),
  placeOfBirth: z.string().min(1, "Place Birth"),
  pensionAdmin: z.string().min(1, "Required"),
  penComNo: z.string().min(1, "Required"),
  nextOfKin: z.string().min(1, "Required "),
  nextOfKinPhone: z.string().min(1, "Required"),
  senatorialDistrict: z.string().min(1, "Required"),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]).optional(),
});

export type PersonalFormData = z.infer<typeof PersonalSchema>;

// ------------------ Helpers ------------------
const isBrowser = () => typeof window !== "undefined";
const personalDraftKey = (phone?: string | null) =>
  phone ? `draft:${phone}:personal` : null;

// ------------------ Component ------------------
/**
 * PersonalForm (forwardRef)
 *
 * Exposes via ref:
 *  - getData() => current values
 *  - setData(obj) => reset/patch form
 *
 * Usage:
 *  const ref = useRef(null);
 *  <PersonalForm ref={ref} />
 *  await ref.current?.getData();
 */
const PersonalForm = forwardRef(function PersonalForm(_, ref) {
  // phone (read-only from localStorage if available)
  const [phoneFromStorage, setPhoneFromStorage] = useState<string | null>(null);
  useEffect(() => {
    if (!isBrowser()) return;
    setPhoneFromStorage(window.localStorage.getItem("nipost_phone"));
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<PersonalFormData>({
    resolver: zodResolver(PersonalSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: phoneFromStorage ?? "",
      dob: "",
      gender: "MALE",
      address: "",
      state: "",
      lga: "",
      placeOfBirth: "",
      pensionAdmin: "",
      penComNo: "",
      nextOfKin: "",
      nextOfKinPhone: "",
      senatorialDistrict: "",
      maritalStatus: "SINGLE",
    },
  });

  // watch all values for display and autosave
  const watched = watch();

  // ------------------ load draft if present ------------------
  useEffect(() => {
    if (!phoneFromStorage || !isBrowser()) return;
    try {
      const key = personalDraftKey(phoneFromStorage);
      const raw = key ? window.localStorage.getItem(key) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        // careful: parsed may come from older schema - only set known keys
        reset({ ...(parsed as Partial<PersonalFormData>) } as PersonalFormData);
        toast.success("Loaded saved draft (local)");
      }
    } catch (err) {
      // ignore parse issues
      console.warn("Failed to read local draft", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneFromStorage]);

  // ------------------ autosave to localStorage (debounced) ------------------
  const debouncedSave = useMemo(
    () =>
      debounce((values: PersonalFormData, p?: string | null) => {
        if (!isBrowser() || !p) return;
        const key = personalDraftKey(p);
        if (!key) return;
        try {
          window.localStorage.setItem(key, JSON.stringify(values));
        } catch (err) {
          console.warn("Autosave failed", err);
        }
      }, 900),
    []
  );

  useEffect(() => {
    debouncedSave(watched, phoneFromStorage);
    return () => {
      debouncedSave.cancel();
    };
  }, [watched, phoneFromStorage, debouncedSave]);

  // ------------------ expose getData / setData to parent via ref ------------------
  useImperativeHandle(ref, () => ({
    getData: () => {
      // return current form values (react-hook-form keeps them current)
      // ensure dob is full ISO string if present
      const values = (watched as PersonalFormData) ?? ({} as any);
      return values;
    },
    setData: (obj: Partial<PersonalFormData>) => {
      // patch reset (merge with current defaults)
      const merged = { ...(watched as any), ...(obj || {}) } as PersonalFormData;
      reset(merged);
    },
  }));

  // ------------------ simple submit (for local manual saves) ------------------
  const onSubmit = (data: PersonalFormData) => {
    // default local-only behaviour: persist to localStorage and show toast
    if (phoneFromStorage) {
      try {
        const key = personalDraftKey(phoneFromStorage);
        if (key) window.localStorage.setItem(key, JSON.stringify(data));
        toast.success("Saved local draft");
      } catch (err) {
        toast.error("Failed to save draft locally");
      }
    } else {
      toast.error("Phone not present; validate phone first");
    }
  };

  // ------------------ date helpers ------------------
  const displayDate = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = typeof iso === "string" && iso.includes("T") ? parseISO(iso) : new Date(iso);
      return isValid(d) ? format(d, "yyyy-MM-dd") : "";
    } catch {
      return "";
    }
  };

  const handleDobSelect = (d?: Date) => {
    if (!d) return;
    const iso = d.toISOString(); // full ISO for server/prisma
    setValue("dob", iso, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <>
      <Toaster />
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <main className="flex justify-center min-h-screen p-6">
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>First name</Label>
                <Input {...register("firstName")} />
                {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>}
              </div>

              <div>
                <Label>Last name</Label>
                <Input {...register("lastName")} />
                {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>}
              </div>

              <div>
                <Label>Email</Label>
                <Input {...register("email")} />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label>Phone</Label>
                <Input {...register("phone")} />
                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <Label>Date of birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Input value={displayDate(watched.dob)} placeholder="Select date" readOnly />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watched.dob ? new Date(watched.dob) : undefined}
                      onSelect={(d: Date | undefined) => handleDobSelect(d ?? undefined)}
                      captionLayout="dropdown" // year -> month -> day style selector
                      startMonth={new Date(1960, 0)}
                      endMonth={new Date(new Date().getFullYear() + 1, 0)}
                    />
                  </PopoverContent>
                </Popover>
                {errors.dob && <p className="text-sm text-red-600 mt-1">{String(errors.dob.message)}</p>}
              </div>

              <div>
                <Label>Gender</Label>
                <Select onValueChange={(v) => setValue("gender", v as any)} value={watched.gender ?? "MALE"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Place of Birth</Label>
                <Input {...register("placeOfBirth")} />
                {errors.placeOfBirth && <p className="text-sm text-red-600 mt-1">{errors.placeOfBirth.message}</p>}
              </div>

              <div>
                <Label>Marital Status</Label>
                <Select onValueChange={(v) => setValue("maritalStatus", v as any)} value={watched.maritalStatus ?? "SINGLE"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Single</SelectItem>
                    <SelectItem value="MARRIED">Married</SelectItem>
                    <SelectItem value="DIVORCED">Divorced</SelectItem>
                    <SelectItem value="WIDOWED">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Senatorial District</Label>
                <Input {...register("senatorialDistrict")} />
              </div>

              <div>
                <Label>Pension Administration</Label>
                <Input {...register("pensionAdmin")} />
              </div>

              <div>
                <Label>Pension Number</Label>
                <Input {...register("penComNo")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Next of Kin</Label>
                <Input {...register("nextOfKin")} />
              </div>
              <div>
                <Label>Next of Kin Phone</Label>
                <Input {...register("nextOfKinPhone")} />
              </div>

              <div>
                <Label>Address</Label>
                <Input {...register("address")} />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <Button type="button" onClick={() => handleSubmit(onSubmit)()}>
                Save (local)
              </Button>
              <Button
                type="button"
                onClick={() => {
                  // quick demonstration: mark localStorage phone if not set
                  if (!phoneFromStorage && isBrowser()) {
                    const p = watched.phone || "";
                    if (p) {
                      window.localStorage.setItem("nipost_phone", p);
                      setPhoneFromStorage(p);
                      toast.success("Phone saved to localStorage");
                    } else {
                      toast.error("Phone is empty");
                    }
                  } else {
                    toast("Already using phone from localStorage");
                  }
                }}
              >
                Ensure Phone Saved
              </Button>
            </div>
          </form>
        </Card>
        </main>
      </motion.div>
    </>
  );
});

export default PersonalForm;
