

// "use client";

// import { useRouter } from "next/navigation";
// import { useEffect, useMemo, useState } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import debounce from "lodash.debounce";
// import { Toaster, toast } from "sonner";
// import { motion } from "framer-motion";
// import "react-datepicker/dist/react-datepicker.css";
// import { format } from "date-fns";

// // Shadcn UI
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectValue,
//   SelectItem,
// } from "@/components/ui/select";
// import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";

// // Local components
// import Navbar from "@/components/Navbar";

// // Use your shared schema if you have it:
// import { EduSchema, EducationalFormType } from "@/components/utils/eduSchema";

// /* --------------------------- helpers (dates, draft) -------------------------- */

// const isBrowser = () => typeof window !== "undefined";

// const isValidISODate = (value?: string) => {
//   if (!value || typeof value !== "string") return false;
//   const d = new Date(value);
//   return !Number.isNaN(d.getTime());
// };

// const displayDate = (iso?: string) =>
//   isValidISODate(iso) ? format(new Date(iso as string), "yyyy-MM-dd") : "";

// const draftKey = (phone: string | null | undefined) =>
//   phone ? `draft:${phone}:education` : null;

// /* --------------------------------- Reusables -------------------------------- */

// type DateInputFieldProps = {
//   label: string;
//   value?: string; // ISO string or ""
//   onChange: (iso: string) => void;
//   error?: string;
//   startMonth?: Date;
//   endMonth?: Date;
// };
// function DateInputField({
//   label,
//   value,
//   onChange,
//   error,
//   startMonth = new Date(1960, 0),
//   endMonth = new Date(new Date().getFullYear() + 1, 0),
// }: DateInputFieldProps) {
//   const selectedDate = isValidISODate(value) ? new Date(value!) : undefined;

//   return (
//     <div>
//       <Label>{label}</Label>
//       <Popover>
//         <PopoverTrigger asChild>
//           <Input value={displayDate(value)} placeholder="Select date" readOnly />
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0">
//           <Calendar
//             mode="single"
//             selected={selectedDate}
//             onSelect={(d: Date | undefined) => {
//               if (!d) return;
//               // store full ISO for backend
//               const iso = d.toISOString();
//               onChange(iso);
//             }}
//             captionLayout="dropdown"
//             startMonth={startMonth}
//             endMonth={endMonth}
//           />
//         </PopoverContent>
//       </Popover>
//       {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
//     </div>
//   );
// }

// type AdditionalQualificationItemProps = {
//   index: number;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   register: any;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   setValue: any;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   watch: any;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   errors: any;
//   onRemove: () => void;
// };

// function AdditionalQualificationItem({
//   index,
//   register,
//   setValue,
//   watch,
//   errors,
//   onRemove,
// }: AdditionalQualificationItemProps) {
//   const aq = watch(`additionalQualifications.${index}`);
//   const startErr =
//     errors?.additionalQualifications?.[index]?.start?.message as string | undefined;
//   const endErr =
//     errors?.additionalQualifications?.[index]?.end?.message as string | undefined;

//   return (
//     <div className="border p-4 rounded space-y-2">
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//         <div>
//           <Label>Type</Label>
//           <select
//             {...register(`additionalQualifications.${index}.type`)}
//             className="w-full border p-2 rounded"
//           >
//             <option value="">Select Type</option>
//             <option value="ADDITIONAL">Additional Qualification</option>
//             <option value="PROFESSIONAL">Professional Qualification</option>
//           </select>
//         </div>
//         <div>
//           <Label>Qualification</Label>
//           <Input {...register(`additionalQualifications.${index}.qualification`)} />
//         </div>
//         <div>
//           <Label>Institution</Label>
//           <Input {...register(`additionalQualifications.${index}.institution`)} />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//         <DateInputField
//           label="From"
//           value={aq?.start}
//           onChange={(iso) => setValue(`additionalQualifications.${index}.start`, iso, { shouldValidate: true })}
//           error={startErr}
//         />
//         <DateInputField
//           label="To"
//           value={aq?.end}
//           onChange={(iso) => setValue(`additionalQualifications.${index}.end`, iso, { shouldValidate: true })}
//           error={endErr}
//         />
//       </div>

//       <Button type="button" variant="destructive" onClick={onRemove}>
//         Remove
//       </Button>
//     </div>
//   );
// }

// /* --------------------------------- Page ------------------------------------- */

// export default function EducationPage() {
//   const router = useRouter();

//   // phone must be read in the browser only
//   const [phone, setPhone] = useState<string | null>(null);
//   useEffect(() => {
//     if (!isBrowser()) return;
//     const p = window.localStorage.getItem("nipost_phone");
//     setPhone(p);
//   }, []);

//   const {
//     register,
//     handleSubmit,
//     control,
//     watch,
//     setValue,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm<EducationalFormType>({
//     resolver: zodResolver(EduSchema),
//     defaultValues: {
//       highestQualification: "",
//       institutionAttended: "",
//       startYear: "",
//       endYear: "",
//       additionalQualifications: [],
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "additionalQualifications",
//   });

//   const watched = watch();

//   // Load draft when phone is ready
//   useEffect(() => {
//     if (!phone || !isBrowser()) return;
//     try {
//       const key = draftKey(phone);
//       const raw = key ? window.localStorage.getItem(key) : null;
//       if (raw) {
//         const parsed = JSON.parse(raw);
//         reset(parsed);
//         toast.success("Loaded saved draft");
//       }
//     } catch {
//       // ignore parse errors
//     }
//   }, [phone, reset]);

//   // Debounced save
//   const debouncedSave = useMemo(
//     () =>
//       debounce((values: EducationalFormType, p?: string | null) => {
//         if (!isBrowser() || !p) return;
//         const key = draftKey(p);
//         if (!key) return;
//         try {
//           window.localStorage.setItem(key, JSON.stringify(values));
//         } catch {
//           // quota errors etc.
//         }
//       }, 800),
//     []
//   );

//   // Auto-save on changes
//   useEffect(() => {
//     debouncedSave(watched, phone);
//     return () => {
//       debouncedSave.cancel();
//     };
//   }, [watched, phone, debouncedSave]);

//   const onSubmit = async (data: EducationalFormType) => {
//     if (!phone) {
//       toast.error("Phone is missing. Validate your phone first.");
//       return;
//     }
//     try {
//       const res = await fetch("/api/register/education", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phone, data }),
//       });

//       if (!res.ok) {
//         const msg = await res.text();
//         throw new Error(msg || "Failed to save education");
//       }

//       // persist last good draft then move forward
//       debouncedSave.flush?.();
//       const key = draftKey(phone);
//       if (isBrowser() && key) {
//         window.localStorage.setItem(key, JSON.stringify(data));
//       }

//       router.push("/register/employment");
//     } catch (err) {
//       toast.error("Failed to save education");
//       console.error(err);
//     }
//   };

//   return (
//     <>
//       <Toaster />
//       <Navbar
//         breadcrumbs={[
//           { label: "Personal Data", href: "personal" },
//           { label: "Education History" },
//         ]}
//       />

//       <motion.div
//         initial={{ opacity: 0, y: 12 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.45 }}
//         className="w-full"
//       >
//         <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-8">
//           <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-3/4">
//             <h1 className="text-2xl font-bold mb-4">Education</h1>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//                 <div>
//                   <Label>Qualification At First Appointment</Label>
//                   <Input {...register("highestQualification")} />
//                   {errors.highestQualification && (
//                     <p className="text-red-600 text-sm">
//                       {errors.highestQualification.message as string}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <Label>Institution Attended</Label>
//                   <Input {...register("institutionAttended")} />
//                   {errors.institutionAttended && (
//                     <p className="text-red-600 text-sm">
//                       {errors.institutionAttended.message as string}
//                     </p>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                   <DateInputField
//                     label="From"
//                     value={watched.startYear}
//                     onChange={(iso) => setValue("startYear", iso, { shouldValidate: true })}
//                     error={errors?.startYear?.message as string | undefined}
//                   />
//                   <DateInputField
//                     label="To"
//                     value={watched.endYear}
//                     onChange={(iso) => setValue("endYear", iso, { shouldValidate: true })}
//                     error={errors?.endYear?.message as string | undefined}
//                   />
//                 </div>
//               </div>

//               <h2 className="font-semibold mt-6">Additional Qualifications</h2>

//               {fields.map((field, index) => (
//                 <AdditionalQualificationItem
//                   key={field.id}
//                   index={index}
//                   register={register}
//                   setValue={setValue}
//                   watch={watch}
//                   errors={errors}
//                   onRemove={() => remove(index)}
//                 />
//               ))}

//               <Button
//                 type="button"
//                 className="bg-blue-500 text-white px-4 py-2 rounded mt-3 mr-3"
//                 onClick={() =>
//                   append({
//                     type: "",
//                     qualification: "",
//                     institution: "",
//                     start: "",
//                     end: "",
//                   })
//                 }
//               >
//                 Add Qualification
//               </Button>

//               <Button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="bg-green-500 text-white px-4 py-2 rounded"
//               >
//                 {isSubmitting ? "Saving..." : "Save & Continue"}
//               </Button>
//             </form>
//           </div>
//         </main>
//       </motion.div>
//     </>
//   );
// }



"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { ArrowBigLeft, UserPlus, Fingerprint, Menu, Users, QrCode, LogOut } from "lucide-react";

// Shadcn UI
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


// Use your shared schema if you have it:
import { EduSchema, EducationalFormType } from "@/components/utils/eduSchema";
// import DashboardLayout from "@/components/layout/DashboardLayout";

/* --------------------------- helpers (dates, draft) -------------------------- */

const isBrowser = () => typeof window !== "undefined";

const isValidISODate = (value?: string) => {
  if (!value || typeof value !== "string") return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
};

const displayDate = (iso?: string) =>
  isValidISODate(iso) ? format(new Date(iso as string), "yyyy-MM-dd") : "";

const draftKey = (phone: string | null | undefined) =>
  phone ? `draft:${phone}:education` : null;

/* --------------------------------- Reusables -------------------------------- */

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
              // store full ISO for backend
              const iso = d.toISOString();
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

type AdditionalQualificationItemProps = {
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  onRemove: () => void;
};

function AdditionalQualificationItem({
  index,
  register,
  setValue,
  watch,
  errors,
  onRemove,
}: AdditionalQualificationItemProps) {
  const aq = watch(`additionalQualifications.${index}`);
  const startErr =
    errors?.additionalQualifications?.[index]?.start?.message as string | undefined;
  const endErr =
    errors?.additionalQualifications?.[index]?.end?.message as string | undefined;

  return (
    
    <div className="border p-4 rounded space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <Label>Type</Label>
          <select
            {...register(`additionalQualifications.${index}.type`)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Type</option>
            <option value="ADDITIONAL">Additional Qualification</option>
            <option value="PROFESSIONAL">Professional Qualification</option>
          </select>
        </div>
        <div>
          <Label>Qualification</Label>
          <Input {...register(`additionalQualifications.${index}.qualification`)} />
        </div>
        <div>
          <Label>Institution</Label>
          <Input {...register(`additionalQualifications.${index}.institution`)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DateInputField
          label="From"
          value={aq?.start}
          onChange={(iso) => setValue(`additionalQualifications.${index}.start`, iso, { shouldValidate: true })}
          error={startErr}
        />
        <DateInputField
          label="To"
          value={aq?.end}
          onChange={(iso) => setValue(`additionalQualifications.${index}.end`, iso, { shouldValidate: true })}
          error={endErr}
        />
      </div>

      <Button type="button" variant="destructive" onClick={onRemove}>
        Remove
      </Button>
    </div>
  );
}

/* --------------------------------- Page ------------------------------------- */

export default function EducationPage() {
  const router = useRouter();

  // phone must be read in the browser only
  const [phone, setPhone] = useState<string | null>(null);
  useEffect(() => {
    if (!isBrowser()) return;
    const p = window.localStorage.getItem("nipost_phone");
    setPhone(p);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EducationalFormType>({
    resolver: zodResolver(EduSchema),
    defaultValues: {
      highestQualification: "",
      institutionAttended: "",
      startYear: "",
      endYear: "",
      additionalQualifications: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalQualifications",
  });

  const watched = watch();

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

  // Debounced save
  const debouncedSave = useMemo(
    () =>
      debounce((values: EducationalFormType, p?: string | null) => {
        if (!isBrowser() || !p) return;
        const key = draftKey(p);
        if (!key) return;
        try {
          window.localStorage.setItem(key, JSON.stringify(values));
        } catch {
          // quota errors etc.
        }
      }, 800),
    []
  );

  // Auto-save on changes
  useEffect(() => {
    debouncedSave(watched, phone);
    return () => {
      debouncedSave.cancel();
    };
  }, [watched, phone, debouncedSave]);

  const onSubmit = async (data: EducationalFormType) => {
    if (!phone) {
      toast.error("Phone is missing. Validate your phone first.");
      return;
    }
    try {
      const res = await fetch("/api/register/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, data }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to save education");
      }

      // persist last good draft then move forward
      debouncedSave.flush?.();
      const key = draftKey(phone);
      if (isBrowser() && key) {
        window.localStorage.setItem(key, JSON.stringify(data));
      }

      router.push("/register/employment");
    } catch (err) {
      toast.error("Failed to save education");
      console.error(err);
    }
  };

  return (
    <>
    {/* <DashboardLayout> */}
      <Toaster/>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full"
      >
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-8">
          <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-3/4">
            <h1 className="text-2xl font-bold mb-4">Education</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <Label>Qualification At First Appointment</Label>
                  <Input {...register("highestQualification")} />
                  {errors.highestQualification && (
                    <p className="text-red-600 text-sm">
                      {errors.highestQualification.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Institution Attended</Label>
                  <Input {...register("institutionAttended")} />
                  {errors.institutionAttended && (
                    <p className="text-red-600 text-sm">
                      {errors.institutionAttended.message as string}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <DateInputField
                    label="From"
                    value={watched.startYear}
                    onChange={(iso) => setValue("startYear", iso, { shouldValidate: true })}
                    error={errors?.startYear?.message as string | undefined}
                  />
                  <DateInputField
                    label="To"
                    value={watched.endYear}
                    onChange={(iso) => setValue("endYear", iso, { shouldValidate: true })}
                    error={errors?.endYear?.message as string | undefined}
                  />
                </div>
              </div>

              <div className="flex justify-between">
            <h2 className="font-semibold mt-6">Additional Qualifications</h2>
            <Button
                type="button"
                className="bg-gray-300 text-black px-4 py-2 rounded mt-3 mr-3"
                onClick={() =>
                  append({
                    type: "",
                    qualification: "",
                    institution: "",
                    start: "",
                    end: "",
                  })
                }
              >
                Add Qualification
              </Button>
            </div>
              {fields.map((field, index) => (
                <AdditionalQualificationItem
                  key={field.id}
                  index={index}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                  onRemove={() => remove(index)}
                />
              ))}
              <div className="flex justify-between">
              <Button onClick={()=> router.push("/admin/creat-users/personal")}>
                <ArrowBigLeft/>
              </Button>
              <Button
                type="submit"
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
      {/* </DashboardLayout> */}
    </>
  );
}
