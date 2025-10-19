"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { format, isValid, parseISO } from "date-fns";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Navbar from "@/components/Navbar";
import { id } from "date-fns/locale";
import { saveCombinedDraft, loadCombinedDraft } from "@/components/hooks/useDraft";

const isBrowser = () => typeof window !== "undefined";
const keyFor = (phone: string | null, page = "education") =>
  phone ? `draft:${phone}:${page}` : null;

/* ----------------- Schema ----------------- */
const AdditionalQualSchema = z.object({
  qualification: z.string().min(1),
  institution: z.string().optional().nullable(),
  start: z.string().optional().nullable(),
  end: z.string().optional().nullable(),
  type:z.string().optional().nullable(),
  fileUrl: z.any().optional().nullable(), // handle File on client, sent via FormData
});

const EduSchema = z.object({
  additionalQualifications: z.array(AdditionalQualSchema).optional(),
});

export type EducationFormType = z.infer<typeof EduSchema>;

/* ----------------- Component ----------------- */
const  EducationForm =  forwardRef(function EducationForm(_, ref) {
  const [phone, setPhone] = useState<string | null>(null);
   const router = useRouter();
  // userId must be set earlier in localStorage when phone verified or on login
  const userId = typeof window !== "undefined" ? window.localStorage.getItem("nipost_userId") : null;
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<EducationFormType>({
    resolver: zodResolver(EduSchema),
    defaultValues: {
      additionalQualifications: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalQualifications",
  });

  // // Load draft
    // Load combined draft slice into form on mount
  useEffect(() => {
    if (!userId) return;
    const combined = loadCombinedDraft(userId);
    if (combined?.education) {
      reset(combined.education);
      toast.success("Loaded saved education draft");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  // useEffect(() => {
  //   if (!phone || !isBrowser()) return;
  //   const k = keyFor(phone, "education");
  //   if (!k) return;
  //   const raw = window.localStorage.getItem(k);
  //   if (raw) {
  //     try {
  //       const parsed = JSON.parse(raw);
  //       reset(parsed);
  //       toast.success("Loaded saved education draft");
  //     } catch {
  //       // ignore
  //     }
  //   }
  // }, [phone, reset]);

  // Auto-save debounced
  const watched = watch();
  const debouncedSave = useMemo(
    () =>
      debounce((vals: EducationFormType, p?: string | null) => {
        if (!userId) return;
       saveCombinedDraft(userId,{education:vals})
      }, 900),
    [userId]
  );

  useEffect(() => {
    debouncedSave(watched);
    return () => debouncedSave.cancel();
  }, [watched, debouncedSave]);

  // date helpers
  const displayDate = (iso?: string) =>
    iso && isValid(parseISO(iso)) ? format(parseISO(iso), "yyyy-MM-dd") : "";

  const setISO = (path: string, d?: Date) => {
    if (!d) return;
    const iso = d.toISOString();
    setValue(path as any, iso, { shouldValidate: true, shouldDirty: true });
  };

  // expose methods
  useImperativeHandle(ref, () => ({
    getData: () => (watch() as EducationFormType),
    setData: (obj: Partial<EducationFormType>) => {
      reset({ ...(watch() as any), ...(obj || {}) });
    },
  }));

  // async function onSubmit(data: EducationFormType) {
  //   // default: local save (you can call server endpoint here)
  //   const p = phone || (isBrowser() ? window.localStorage.getItem("nipost_phone") : null);
  //   if (!p) {
  //     toast.error("Phone missing; validate phone first.");
  //     return;
  //   }
  //   const k = keyFor(p, "education");
  //   if (k) window.localStorage.setItem(k, JSON.stringify(data));
  //   toast.success("Education saved (local).");
  // }

  
  // Submit: send entire combined draft (so server receives all pages)
  const onSubmit = async (data: EducationFormType) => {
    if (!userId) {
      toast.error("User not identified. Please complete phone verification or login.");
      return;
    }

    // Save slice locally first
    saveCombinedDraft(userId, { education: data });

    // Load full combined draft to send to server
    const combined = loadCombinedDraft(userId) || {};
    try {
      const res = await fetch("/api/register/submit-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, draft: combined }),
      });
      const j = await res.json();
      if (!res.ok || !j?.success) {
        toast.error(j?.error || "Save failed");
        return;
      }
      toast.success("Education saved (combined draft submitted)");
      router.push("/register/employment");
    } catch (e) {
      console.error(e);
      toast.error("Server error");
    }
  };

  return (
    <>
      <Toaster />
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
        <main className="flex justify-center p-6">
          <Card>
            <h2 className="text-xl font-semibold mb-3">Add Education Qualification</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* <h3 className="font-medium mt-4">Add more Qualifications</h3> */}

              <div className="space-y-3">
                {fields.map((f, idx) => (
                  <div key={f.id} className="border rounded p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Qualification</Label>
                        <Input {...register(`additionalQualifications.${idx}.qualification` as const)} />
                      </div>
                      <div>
                        <Label>Institution</Label>
                        <Input {...register(`additionalQualifications.${idx}.institution` as const)} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <Label>From</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Input value={displayDate((watch() as any).additionalQualifications?.[idx]?.start)} readOnly placeholder="Select date" />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={(watch() as any).additionalQualifications?.[idx]?.start ? new Date((watch() as any).additionalQualifications[idx].start) : undefined}
                                onSelect={(d: Date | undefined) => setISO(`additionalQualifications.${idx}.start`, d)}
                                captionLayout="dropdown"
                                startMonth={new Date(1960, 0)}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label>To</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Input value={displayDate((watch() as any).additionalQualifications?.[idx]?.end)} readOnly placeholder="Select date" />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={(watch() as any).additionalQualifications?.[idx]?.end ? new Date((watch() as any).additionalQualifications[idx].end) : undefined}
                                onSelect={(d: Date | undefined) => setISO(`additionalQualifications.${idx}.end`, d)}
                                captionLayout="dropdown"
                                startMonth={new Date(1960, 0)}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex justify-end">
                      <Button variant="destructive" type="button" onClick={() => remove(idx)}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <Button type="button" onClick={() => append({ qualification: "", institution: "", start: "", end: "" })}>Add More</Button>
              </div>

              {/* <div className="flex gap-3 mt-4">
                <Button type="button" onClick={() => handleSubmit(onSubmit)()}>Save (local)</Button>
              </div> */}
            </form>
          </Card>
        </main>
      </motion.div>
    </>
  );
});

export default EducationForm;
