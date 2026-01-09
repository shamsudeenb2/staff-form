

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import debounce from "lodash.debounce";
import { ArrowBigLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { isValid as isValidDate, differenceInYears } from "date-fns";

import { nigeriaStates, getstationByState } from "@/components/lib/stationState";

import {   EmploymentSchema,
  type EmploymentFormInput, } from "@/components/utils/employSchema";
  import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem,
  } from "@/components/ui/select";


// shadcn ui
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import DashboardLayout from "@/components/layout/DashboardLayout";

// local shared UI

/* ------------------------------ Helpers/Utils ----------------------------- */
const isBrowser = () => typeof window !== "undefined";
const isValidISODate = (value?: string) => {
  if (!value || typeof value !== "string") return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
};
const displayDate = (iso?: string) => (isValidISODate(iso) ? format(new Date(iso as string), "yyyy-MM-dd") : "");

const draftKey = (phone: string | null | undefined) =>
  phone ? `draft:${phone}:employment` : null;

/* ------------------------- Reusable Date Field (ISO) ---------------------- */
type DateFieldProps = {
  label: string;
  value?: string; // ISO string or ""
  onSelectISO: (iso: string) => void;
  minYear?: number;
  maxYear?: number;
  placeholder?: string;
};
function DateField({
  label,
  value,
  onSelectISO,
  minYear = 1960,
  maxYear = new Date().getFullYear() + 1,
  placeholder = "Select date",
}: DateFieldProps) {
  const selected = isValidISODate(value) ? new Date(value as string) : undefined;
  console.log("date and time",value)
  return (
    <div>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Input value={displayDate(value)} placeholder={placeholder} readOnly />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d: Date | undefined) => {
              if (!d) return;
              onSelectISO(d.toISOString()); // store full ISO for server/prisma
            }}
            captionLayout="dropdown"
            startMonth={new Date(minYear, 0)}
            endMonth={new Date(maxYear, 11)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** Helper: returns whole full years between the date and now.
 *  - returns 0 for invalid or future dates
 */
function calculateYearsInService(dateIsoOrDate: string | Date | undefined | null) {
  if (!dateIsoOrDate) return 0;
  const d = typeof dateIsoOrDate === "string" ? new Date(dateIsoOrDate) : dateIsoOrDate;
  if (!isValidDate(d)) return 0;
  const now = new Date();
  if (d > now) return 0;
  return Math.max(0, differenceInYears(now, d));
}

interface FetchState {
  id: number;
  name: string;
}

/* ---------------------------------- Page ---------------------------------- */
export default function EmploymentPage() {
  const router = useRouter();

  // Read phone only in the browser
  const [phone, setPhone] = useState<string | null>(null);

  const [fetchState, setfetchState] = useState<FetchState[]>([]);
  useEffect(() => {
    if (!isBrowser()) return;
    setPhone(window.localStorage.getItem("nipost_phone"));
  }, []);

  // Draft hook (namespaced per phone + page)
  // const { draft, loading, saveDraft } = useDraft(phone, "employment");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EmploymentFormInput>({
    resolver: zodResolver(EmploymentSchema),
    defaultValues: {
      personnelNumber: "",
      ippisNumber: "",
      rank: "",
      gradeLevel: "",
      step: "",
      dateFirstAppointed: "",
      datePresentAppointment: "",
      dateLastPromotion: "",
      rankAtFirstAppointment: "",
      presentStation: "",
      presentJobDescription: "",
      department: "",
      yearsInStation: 0,
      yearsInService: 0,
      previousStations: [],
      previousJobsHandled: [],
      previousPromotion: [],
    },
  });

        useEffect(() => {
        try {
          
            async function fetchTires() {
            const res = await fetch(`/api/register/employment`);
            const data = await res.json();
            
            if(data.success){
              console.log("fetch state and type", data.data)
              setfetchState(data.data)
            }
          }
          fetchTires()            
        } catch {
          // ignore parse errors
        }
      }, []);

  const [lgas, setLgas] = useState<string[]>([]);

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
        debounce((values: EmploymentFormInput, p?: string | null) => {
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

    function getIdByName(data: FetchState[], targetName: string){
        const foundItem = data.find(item => item.name === targetName);
        const select = foundItem?.name as string
        setValue("selectedState", select, { shouldValidate: true });
        return foundItem?.id as number;
      }
    const watchedState = watch("selectedState");
    const watchedId = watch("standardStationId");

      // Keep LGA list in sync with state
      useEffect(() => {
        if (watchedState) {
          setLgas(getstationByState(watchedState));
        } else {
          setLgas([]);
        }
      }, [watchedState]);

      const onStateChange = (state: string) => {
        const stateId = getIdByName(fetchState, state)
            
        setValue("standardStationId",stateId, { shouldValidate: true });
        setValue("presentStation", "", { shouldValidate: true });
        setLgas(getstationByState(state));
      };

    // Auto-save on changes
    useEffect(() => {
      debouncedSave(watched, phone);
      return () => {
        debouncedSave.cancel();
      };
    }, [watched, phone, debouncedSave]);

  // Repeatable sections
  const stationsFA = useFieldArray({ control, name: "previousStations" });
  const jobsFA = useFieldArray({ control, name: "previousJobsHandled" });
  const promotionsFA = useFieldArray({ control, name: "previousPromotion" });

  
  // IMPORTANT: compute yearsInService when dateFirstAppointed changes (both when user selects and when draft restores)
  useEffect(() => {
    const iso = watched.dateFirstAppointed;
    if (!iso) return;
    const yrs = calculateYearsInService(iso);
    // only update if different to avoid unnecessary form dirty toggles
    if (typeof watched.yearsInService === "undefined" || Number(watched.yearsInService) !== yrs) {
      setValue("yearsInService", yrs, { shouldValidate: true, shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched.dateFirstAppointed]);


        useEffect(() => {
          try { 
              async function fetchTires() {
                const p = window.localStorage.getItem("nipost_phone");
              console.log("checking phone number",p)
              if (!p) return;
              const res = await fetch(`/api/register/employment/all?phone=${encodeURIComponent(p)}`);
              const data = await res.json();
              console.log("action type", data.items,phone)
              if(data.ok){
                reset(data?.items);
                toast.success("Loaded saved draft");
              }
              toast.error(data.message)
            }
            fetchTires()            
          } catch {
            // ignore parse errors
          }
        }, []);


  const onSubmit = async (data: EmploymentFormInput) => {
    try {
      const p = phone || (isBrowser() ? window.localStorage.getItem("nipost_phone") : null);
      if (!p) {
        toast.error("Phone not found, please complete phone verification.");
        return;
      }

      const res = await fetch("/api/register/employment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: p, data }),
      });
      const j = await res.json();

      if (!res.ok || !j?.success) {
        toast.error(j?.error ?? "Failed to save employment data");
        return;
      }

      toast.success("Employment data saved");
      // Persist last good draft
       // persist last good draft then move forward
      debouncedSave.flush?.();
      const key = draftKey(phone);
      if (isBrowser() && key) {
        window.localStorage.setItem(key, JSON.stringify(data));
      }
      // Keep your current navigation behavior:
      router.push("/register/others"); // adjust to next step when ready
    } catch (e) {
      console.error(e);
      toast.error("Server error while saving employment data");
    }
  };

  console.log("errors list", errors)
  return (
    <>
    {/* <DashboardLayout> */}
      <Toaster />
        <Navbar
          breadcrumbs={[
            { label: "Education", href: "/register/education" },
            { label: "Employment", },       
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
            <h1 className="text-2xl font-bold mb-1">Employment Information</h1>
            <p className="text-sm text-gray-500 mb-6">
              We auto-save your progress — you can return later to continue.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Core Details */}
              <section>
                <h2 className="font-semibold mb-3">Core Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <Label>Personnel Number</Label>
                    <Input {...register("personnelNumber")} />
                    {errors.personnelNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.personnelNumber.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>IPPIS Number</Label>
                    <Input {...register("ippisNumber")} />
                    {errors.ippisNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.ippisNumber.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Input {...register("department")} />
                    {errors.department && (
                      <p className="text-red-600 text-sm mt-1">{errors.department.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Rank</Label>
                    <Input {...register("rank")} />
                    {errors.rank && <p className="text-red-600 text-sm mt-1">{errors.rank.message}</p>}
                  </div>
                         <div>
                            <Label>Grade Level </Label>
                            <Select
                              value={watch("gradeLevel") || "__unset__"}
                              onValueChange={(v) => {
                                if (v !== "__placeholder__") setValue("gradeLevel", v, { shouldValidate: true }) ;
                              }}
                            >
                              <SelectTrigger className="border p-2 w-full rounded">
                                <SelectValue placeholder="Select gradeLevel" />
                              </SelectTrigger>
                              <SelectContent className="max-h-60 overflow-auto">
                                <SelectItem value="__unset__" disabled>
                                  Select Grade Level
                                </SelectItem>
                                <SelectItem value="GL.01"> GL.01</SelectItem>
                                <SelectItem value="GL.02"> GL.02</SelectItem>
                                <SelectItem value="GL.03"> GL.03</SelectItem>
                                <SelectItem value="GL.04"> GL.04</SelectItem>
                                <SelectItem value="GL.05"> GL.05</SelectItem>
                                <SelectItem value="GL.06"> GL.06</SelectItem>
                                <SelectItem value="GL.07"> GL.07</SelectItem>
                                <SelectItem value="GL.08"> GL.08</SelectItem>
                                <SelectItem value="GL.09"> GL.09</SelectItem>
                                <SelectItem value="GL.10"> GL.10</SelectItem>
                                <SelectItem value="GL.12"> GL.12</SelectItem>
                                <SelectItem value="GL.13"> GL.13</SelectItem>
                                <SelectItem value="GL.14"> GL.14</SelectItem>
                                <SelectItem value="GL.15"> GL.15</SelectItem>
                                <SelectItem value="GL.16"> GL.16</SelectItem>
                                <SelectItem value="GL.17"> GL.17</SelectItem>              
                              </SelectContent>
                            </Select>
                            {errors.gradeLevel && (
                              <p className="text-sm text-red-600 mt-1">{errors.gradeLevel.message}</p>
                            )}
                          </div>
                  {/* <div>
                    <Label>Grade Level</Label>
                    <Input {...register("gradeLevel")} />
                    {errors.gradeLevel && (
                      <p className="text-red-600 text-sm mt-1">{errors.gradeLevel.message}</p>
                    )}
                  </div> */}
                  <div>
                    <Label>Step</Label>
                    <Input {...register("step")} />
                    {errors.step && <p className="text-red-600 text-sm mt-1">{errors.step.message}</p>}
                  </div>
                </div>
              </section>

              {/* Appointments & Promotions */}
              <section>
                <h2 className="font-semibold mb-3">Appointments & Promotions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* <DateField
                    label="Date First Appointed"
                    value={watched?.dateFirstAppointed}
                    onSelectISO={(iso) => setValue("dateFirstAppointed", iso, { shouldValidate: true })}
                  /> */}
                  <DateField
                    label="Date First Appointed"
                    value={watched.dateFirstAppointed}
                    onSelectISO={(iso) => {
                      setValue("dateFirstAppointed", iso, { shouldValidate: true, shouldDirty: true });
                      // compute years and populate yearsInService immediately
                      const yrs = calculateYearsInService(iso);
                      setValue("yearsInService", yrs, { shouldValidate: true, shouldDirty: true });
                    }}
                  />
                  <DateField
                    label="Date of Present Appointment"
                    value={watched?.datePresentAppointment}
                    onSelectISO={(iso) => setValue("datePresentAppointment", iso, { shouldValidate: true })}
                  />
                  <DateField
                    label="Date of Last Promotion"
                    value={watched?.dateLastPromotion}
                    onSelectISO={(iso) => setValue("dateLastPromotion", iso, { shouldValidate: true })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                  <div>
                    <Label>Rank at First Appointment</Label>
                    <Input {...register("rankAtFirstAppointment")} />
                    {errors.rankAtFirstAppointment && (
                      <p className="text-red-600 text-sm mt-1">{errors.rankAtFirstAppointment.message}</p>
                    )}
                  </div>
                </div>
              </section>
              
              {/* Previous Promotions Held */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold">Previous Promotions</h2>
                  <Button
                    type="button"
                    onClick={() => promotionsFA.append({ rank: "", gradeLevel: "", date: "" })}
                    variant="secondary"
                  >
                    Add Promotion
                  </Button>
                </div>

                {promotionsFA.fields.length === 0 && (
                  <p className="text-sm text-gray-500">No previous promotion added yet.</p>
                )}

                <div className="space-y-3">
                  {promotionsFA.fields.map((f, i) => (
                    <div key={f.id} className="border rounded p-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <Label>Rank</Label>
                          <Input {...register(`previousPromotion.${i}.rank` as const)} />
                          {errors.previousPromotion?.[i]?.rank && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.previousPromotion[i]?.rank?.message}
                            </p>
                          )}
                        </div>
                          <div>
                            <Label>Grade Level </Label>
                            <Select
                              value={watch(`previousPromotion.${i}.gradeLevel` as const) || "__unset__"}
                              onValueChange={(v) => {
                                if (v !== "__placeholder__") setValue(`previousPromotion.${i}.gradeLevel` as const, v, { shouldValidate: true }) ;
                              }}
                            >
                              <SelectTrigger className="border p-2 w-full rounded">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent className="max-h-60 overflow-auto">
                                <SelectItem value="__unset__" disabled>
                                  Select Grade Level
                                </SelectItem>
                                <SelectItem value="GL.01"> GL.01</SelectItem>
                                <SelectItem value="GL.02"> GL.02</SelectItem>
                                <SelectItem value="GL.03"> GL.03</SelectItem>
                                <SelectItem value="GL.04"> GL.04</SelectItem>
                                <SelectItem value="GL.05"> GL.05</SelectItem>
                                <SelectItem value="GL.06"> GL.06</SelectItem>
                                <SelectItem value="GL.07"> GL.07</SelectItem>
                                <SelectItem value="GL.08"> GL.08</SelectItem>
                                <SelectItem value="GL.09"> GL.09</SelectItem>
                                <SelectItem value="GL.10"> GL.10</SelectItem>
                                <SelectItem value="GL.12"> GL.12</SelectItem>
                                <SelectItem value="GL.13"> GL.13</SelectItem>
                                <SelectItem value="GL.14"> GL.14</SelectItem>
                                <SelectItem value="GL.15"> GL.15</SelectItem>
                                <SelectItem value="GL.16"> GL.16</SelectItem>
                                <SelectItem value="GL.17"> GL.17</SelectItem>              
                              </SelectContent>
                            </Select>

                          </div>
                        {/* <div>
                          <Label>Grade Level</Label>
                          <Input {...register(`previousPromotion.${i}.gradeLevel` as const)} />
                          {errors.previousPromotion?.[i]?.gradeLevel && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.previousPromotion[i]?.gradeLevel?.message}
                            </p>
                          )}
                        </div> */}
                        <div>
                          <DateField
                            label="Date of Promotion"
                            value={watch(`previousPromotion.${i}.date` as const)}
                            onSelectISO={(iso) => setValue(`previousPromotion.${i}.date`as const, iso, { shouldValidate: true })}
                          />
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                          <Button type="button" variant="destructive" onClick={() => promotionsFA.remove(i)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Present Posting */}
              <section>
                <h2 className="font-semibold mb-3">Present Posting</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* <div>
                    <Label>Present Station</Label>
                    <Input {...register("presentStation")} /> */}
                    {/* {errors.presentStation && (
                      <p className="text-red-600 text-sm mt-1">{errors.presentStation.message}</p>
                    )} */}
                  {/* </div> */}
                <div>
                  <Label>State </Label>
                  <Select
                    value={watch("selectedState") || "__unset__"}
                    onValueChange={(v) => {
                      if (v !== "__placeholder__") onStateChange(v);
                    }}
                  >
                    <SelectTrigger className="border p-2 w-full rounded">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-auto">
                      <SelectItem value="__unset__" disabled>
                        Select state or venture
                      </SelectItem>
                      {nigeriaStates.map((s) => (
                        <SelectItem key={s.name} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.selectedState && (
                    <p className="text-sm text-red-600 mt-1">{errors.selectedState.message}</p>
                  )}
                </div>
                  
                <div>
                  <Label>Present Station</Label>
                  <Select
                    value={watch("presentStation") || "__unset__"}
                    onValueChange={(v) => {
                      if (v !== "__placeholder__") setValue("presentStation", v, { shouldValidate: true });
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
                  {errors.presentStation && (
                    <p className="text-sm text-red-600 mt-1">{errors.presentStation.message}</p>
                  )}
                </div>

                  <div>
                    <Label>Years in Station</Label>
                    <Input type="number" {...register("yearsInStation", { valueAsNumber: true })} />
                    {errors.yearsInStation && (
                      <p className="text-red-600 text-sm mt-1">{errors.yearsInStation.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Years in Service</Label>
                    <Input type="number" {...register("yearsInService", { valueAsNumber: true })} disabled={true} />
                    
                    {errors.yearsInService && (
                      <p className="text-red-600 text-sm mt-1">{errors.yearsInService.message}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Present Job Description</Label>
                  <Input {...register("presentJobDescription")} />
                  {errors.presentJobDescription && (
                    <p className="text-red-600 text-sm mt-1">{errors.presentJobDescription.message}</p>
                  )}
                </div>
              </section>

              {/* Previous Stations */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold">Previous Stations</h2>
                  <Button
                    type="button"
                    onClick={() => stationsFA.append({ station: "", yearsInStation: "" })}
                    variant="secondary"
                  >
                    Add Station
                  </Button>
                </div>

                {stationsFA.fields.length === 0 && (
                  <p className="text-sm text-gray-500">No stations added yet.</p>
                )}

                <div className="space-y-3">
                  {stationsFA.fields.map((f, i) => (
                    <div key={f.id} className="border rounded p-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <Label>Station</Label>
                          <Input {...register(`previousStations.${i}.station` as const)} />
                          {errors.previousStations?.[i]?.station && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.previousStations[i]?.station?.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label>Years in Station</Label>
                          <Input {...register(`previousStations.${i}.yearsInStation` as const)} />
                          {errors.previousStations?.[i]?.yearsInStation && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.previousStations[i]?.yearsInStation?.message}
                            </p>
                          )}
                        </div>
                        <div className="flex items-end">
                          <Button type="button" variant="destructive" onClick={() => stationsFA.remove(i)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Previous Jobs Handled */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold">Previous Jobs Handled</h2>
                  <Button
                    type="button"
                    onClick={() => jobsFA.append({ job: "", yearsInJob: "", jobDescription: "" })}
                    variant="secondary"
                  >
                    Add Job
                  </Button>
                </div>

                {jobsFA.fields.length === 0 && (
                  <p className="text-sm text-gray-500">No jobs added yet.</p>
                )}

                <div className="space-y-3">
                  {jobsFA.fields.map((f, i) => (
                    <div key={f.id} className="border rounded p-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <Label>Job</Label>
                          <Input {...register(`previousJobsHandled.${i}.job` as const)} />
                          {errors.previousJobsHandled?.[i]?.job && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.previousJobsHandled[i]?.job?.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label>Years in Job</Label>
                          <Input {...register(`previousJobsHandled.${i}.yearsInJob` as const)} />
                          {errors.previousJobsHandled?.[i]?.yearsInJob && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.previousJobsHandled[i]?.yearsInJob?.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label>Job Description</Label>
                          <Input {...register(`previousJobsHandled.${i}.jobDescription` as const)} />
                          {errors.previousJobsHandled?.[i]?.jobDescription && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.previousJobsHandled[i]?.jobDescription?.message}
                            </p>
                          )}
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                          <Button type="button" variant="destructive" onClick={() => jobsFA.remove(i)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Actions */}
              <div className="flex justify-between gap-3">

                 <Button onClick={()=> router.push("/register/education")}>
                  <ArrowBigLeft/>
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-green-500 text-white px-4 py-2 rounded">
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
