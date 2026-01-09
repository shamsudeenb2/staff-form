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
import { format, parseISO, isValid } from "date-fns";
import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Card from "@/components/Card";
import Navbar from "@/components/Navbar";
import { getSession } from "@/app/config/auth";
import { saveCombinedDraft, loadCombinedDraft } from "@/components/hooks/useDraft";

const isBrowser = () => typeof window !== "undefined";
const keyFor = (phone: string | null, page = "employment") =>
  phone ? `draft:${phone}:${page}` : null;

/* ---------------- Zod Schema ---------------- */
const PrevStationSchema = z.object({
  station: z.string().min(1),
  yearsInStation: z.string().min(1),
});
const PrevJobSchema = z.object({
  job: z.string().min(1),
  yearsInJob: z.string().min(1),
  jobDescription: z.string().min(1),
});
const PrevPromotionSchema = z.object({
  rank: z.string().min(1),
  gradeLevel: z.string().min(1),
  date: z.string().optional().nullable(),
});

const EmploymentSchema = z.object({
  previousStations: z.array(PrevStationSchema).optional(),
  previousJobsHandled: z.array(PrevJobSchema).optional(),
  previousPromotion: z.array(PrevPromotionSchema).optional(),
});

export type EmploymentFormType = z.infer<typeof EmploymentSchema>;

/* ---------------- Component ---------------- */
const EmploymentForm = forwardRef(function EmploymentForm(_, ref) {
  const [phone, setPhone] = useState<string | null>(null);
     const router = useRouter();
    // userId must be set earlier in localStorage when phone verified or on login
    const userId = typeof window !== "undefined" ? window.localStorage.getItem("nipost_userId") : null;

  // useEffect(() => {
  //   if (!isBrowser()) return;
  //   setPhone(window.localStorage.getItem("nipost_phone"));
  // }, []);

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<EmploymentFormType>({
    resolver: zodResolver(EmploymentSchema),
    defaultValues: {
      previousStations: [],
      previousJobsHandled: [],
      previousPromotion: []
    }
  });

  const stationsFA = useFieldArray({ control, name: "previousStations" });
  const jobsFA = useFieldArray({ control, name: "previousJobsHandled" });
  const promosFA = useFieldArray({ control, name: "previousPromotion" });

  // load draft
  // useEffect(() => {
  //   if (!phone || !isBrowser()) return;
  //   const k = keyFor(phone, "employment");
  //   const raw = window.localStorage.getItem(k || "");
  //   if (raw) {
  //     try {
  //       const parsed = JSON.parse(raw);
  //       reset(parsed);
  //       toast.success("Loaded employment draft");
  //     } catch {}
  //   }
  // }, [phone, reset]);
    useEffect(() => {
      if (!userId) return;
      const combined = loadCombinedDraft(userId);
      if (combined?.education) {
        reset(combined.education);
        toast.success("Loaded saved education draft");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

  const watched = watch();

  // autosave
  const debouncedSave = useMemo(() => debounce((vals: EmploymentFormType, p?: string | null) => {
    if (!p) return;
    saveCombinedDraft(p, { employment: vals });
  }, 900), []);

  useEffect(() => {
    debouncedSave(watched as EmploymentFormType, userId);
    return () => debouncedSave.cancel();
  }, [watched, userId, debouncedSave]);

  // helper to display date
  const displayDate = (iso?: string) => (iso ? (isValid(parseISO(iso)) ? format(parseISO(iso), "yyyy-MM-dd") : "") : "");

  const setISO = (path: string, d?: Date) => {
    if (!d) return;
    setValue(path as any, d.toISOString(), { shouldDirty: true, shouldValidate: true });
  };

  // compute years in service when dateFirstAppointed picked
  const computeYearsSince = (iso?: string) => {
    if (!iso) return 0;
    try {
      const then = parseISO(iso);
      if (!isValid(then)) return 0;
      const now = new Date();
      const years = now.getFullYear() - then.getFullYear();
      // adjust if before birthday this year
      const m = now.getMonth() - then.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < then.getDate())) return years - 1;
      return years;
    } catch {
      return 0;
    }
  };

  // auto-fill yearsInService when dateFirstAppointed changes
  // useEffect(() => {
  //   const iso = (watch() as any).dateFirstAppointed;
  //   if (!iso) return;
  //   const y = computeYearsSince(iso);
  //   setValue("yearsInService", y);
  // }, [watch((v) => v.dateFirstAppointed)]); // note: watch subscription

  useImperativeHandle(ref, () => ({
    getData: () => (watch() as EmploymentFormType),
    setData: (obj: Partial<EmploymentFormType>) => reset({ ...(watch() as any), ...(obj || {}) }),
  }));

  // async function onSubmit(data: EmploymentFormType) {
  //   const p = phone || (isBrowser() ? window.localStorage.getItem("nipost_phone") : null);
  //   if (!p) { toast.error("Phone missing"); return; }
  //   const k = keyFor(p, "employment");
  //   if (k) window.localStorage.setItem(k, JSON.stringify(data));
  //   toast.success("Employment saved (local)");
  // }

  const onSubmit = async (data: EmploymentFormType) => {
    if (!userId) {
      toast.error("User not identified. Please complete phone verification or login.");
      return;
    }

    saveCombinedDraft(userId, { employment: data });
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
      toast.success("Employment saved (combined draft submitted)");
      router.push("/register/others");
    } catch (e) {
      console.error(e);
      toast.error("Server error");
    }
  };

  return (
    <>
      <Toaster />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <main className="flex justify-center p-6">
          <Card>
            {/* <h2 className="text-xl font-semibold mb-3">Employment</h2> */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Add New Stations</h3>
                  <Button type="button"  onClick={() => stationsFA.append({ station: "", yearsInStation: "" })}>Add</Button>
                </div>
                <div className="space-y-2">
                  {stationsFA.fields.map((f, i) => (
                    <div key={f.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 border p-2 rounded">
                      <Input {...register(`previousStations.${i}.station` as const)} placeholder="Station" />
                      <Input {...register(`previousStations.${i}.yearsInStation` as const)} placeholder="Years" />
                      <Button type="button" variant="destructive" onClick={() => stationsFA.remove(i)}>Remove</Button>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Add New Jobs Handling</h3>
                  <Button type="button" onClick={() => jobsFA.append({ job: "", yearsInJob: "", jobDescription: "" })}>Add</Button>
                </div>
                <div className="space-y-2">
                  {jobsFA.fields.map((f, i) => (
                    <div key={f.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 border p-2 rounded">
                      <Input {...register(`previousJobsHandled.${i}.job` as const)} placeholder="Job" />
                      <Input {...register(`previousJobsHandled.${i}.yearsInJob` as const)} placeholder="Years" />
                      <Input {...register(`previousJobsHandled.${i}.jobDescription` as const)} placeholder="Description" />
                      <div className="md:col-span-3 flex justify-end">
                        <Button type="button" variant="destructive" onClick={() => jobsFA.remove(i)}>Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Add New Promotions</h3>
                  <Button type="button" onClick={() => promosFA.append({ rank: "", gradeLevel: "", date: "" })}>Add</Button>
                </div>
                <div className="space-y-2">
                  {promosFA.fields.map((f, i) => (
                    <div key={f.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 border p-2 rounded">
                      <Input {...register(`previousPromotion.${i}.rank` as const)} placeholder="Rank" />
                      <Input {...register(`previousPromotion.${i}.gradeLevel` as const)} placeholder="Grade Level" />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Input value={displayDate((watch() as any).previousPromotion?.[i]?.date)} readOnly placeholder="Select date" />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={(watch() as any).previousPromotion?.[i]?.date ? new Date((watch() as any).previousPromotion[i].date) : undefined}
                            onSelect={(d) => setISO(`previousPromotion.${i}.date`, d)}
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="md:col-span-4 flex justify-end">
                        <Button type="button" variant="destructive" onClick={() => promosFA.remove(i)}>Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

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

export default EmploymentForm;
