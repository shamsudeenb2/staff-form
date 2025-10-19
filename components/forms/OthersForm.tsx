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
import { getSession } from "@/app/config/auth";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Card from "@/components/Card";
import Navbar from "@/components/Navbar";
import FileInput from "@/components/FileUpload"; // your file input shadcn wrapper
import { useRouter } from "next/navigation"
import { saveCombinedDraft, loadCombinedDraft } from "@/components/hooks/useDraft";

const isBrowser = () => typeof window !== "undefined";
const keyFor = (phone: string | null, page = "others") => (phone ? `draft:${phone}:${page}` : null);

const CertSchema = z.object({
  title: z.string().min(2),
  dateIssued: z.string().min(1),
  skills: z.string().min(2),
  fileUrl: z.any().optional().nullable(), // File client-side
});

const OthersSchema = z.object({
  certificates: z.array(CertSchema).optional(),
});

export type OthersFormType = z.infer<typeof OthersSchema>;

const OthersForm = forwardRef(function OthersForm(_, ref) {
  const [phone, setPhone] = useState<string | null>(null);
  const router = useRouter();
  const userId = typeof window !== "undefined" ? window.localStorage.getItem("nipost_userId") : null;


  useEffect(() => {
    if (!isBrowser()) return;
    setPhone(window.localStorage.getItem("nipost_phone"));
  }, []);

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<OthersFormType>({
    resolver: zodResolver(OthersSchema),
    defaultValues: { certificates: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "certificates" });

  // load draft
  // useEffect(() => {
  //   if (!phone || !isBrowser()) return;
  //   const k = keyFor(phone, "others");
  //   const raw = window.localStorage.getItem(k || "");
  //   if (raw) {
  //     try {
  //       const parsed = JSON.parse(raw);
  //       reset(parsed);
  //       toast.success("Loaded 'other' draft");
  //     } catch {}
  //   }
  // }, [phone, reset]);
    useEffect(() => {
    if (!userId) return;
    const combined = loadCombinedDraft(userId);
    if (combined?.others) {
      reset(combined.others);
      toast.success("Loaded saved others draft");
    }
  }, [userId, reset]);

  const watched = watch();
  const debouncedSave = useMemo(
    () =>
      debounce((values: OthersFormType) => {
        if (!userId) return;
        // ensure files are represented by meta if File objects are present
        const normalized = {
          certificates: (values.certificates || []).map((c: any) => {
            if (c.file instanceof File) {
              return { ...c, fileMeta: { name: c.file.name, size: c.file.size, type: c.file.type } };
            }
            return c;
          }),
        };
        saveCombinedDraft(userId, { others: normalized });
      }, 900),
    [userId]
  );

  useEffect(() => {
    debouncedSave(watched as OthersFormType);
    return () => debouncedSave.cancel();
  }, [watched, debouncedSave]);

  useImperativeHandle(ref, () => ({
    getData: () => watch() as OthersFormType,
    setData: (obj: Partial<OthersFormType>) => reset({ ...(watch() as any), ...(obj || {}) }),
  }));

  function displayDate(iso?: string) {
    if (!iso) return "";
    try {
      return isValid(parseISO(iso)) ? format(parseISO(iso), "yyyy-MM-dd") : "";
    } catch {
      return "";
    }
  }

  function setISO(path: string, d?: Date) {
    if (!d) return;
    setValue(path as any, d.toISOString(), { shouldValidate: true, shouldDirty: true });
  }

    // file input handler: update metadata in form state
  function onFileChange(index: number, f?: File | null) {
    if (!f) {
      setValue(`certificates.${index}.fileMeta` as any, null);
      return;
    }
    setValue(`certificates.${index}.fileMeta` as any, { name: f.name, size: f.size, type: f.type });
    // Note: do NOT try to save File object into localStorage
  }

  // async function onSubmit(data: OthersFormType) {
  //   const p = phone || (isBrowser() ? window.localStorage.getItem("nipost_phone") : null);
  //   if (!p) { toast.error("Phone not set"); return; }

  //   // Build FormData because files may be present
  //   const fd = new FormData();
  //   const certs = data.certificates || [];
  //   certs.forEach((c, idx) => {
  //     fd.append(`certificates[${idx}][title]`, c.title);
  //     fd.append(`certificates[${idx}][dateIssued]`, c.dateIssued);
  //     fd.append(`certificates[${idx}][skills]`, c.skills);
  //     const file = (c as any).fileUrl;
  //     if (file instanceof File) fd.append(`certificates[${idx}][fileUrl]`, file);
  //   });
  //   fd.append("phone", p);

  //   // example: POST to your api endpoint that accepts multipart/form-data
  //   try {
  //     const res = await fetch("/api/register/others", {
  //       method: "POST",
  //       body: fd,
  //     });
  //     const j = await res.json();
  //     if (!res.ok || !j?.success) {
  //       toast.error(j?.error ?? "Failed to save others data");
  //       return;
  //     }
  //     // Persist locally as last known good
  //     const k = keyFor(p, "others");
  //     if (k) window.localStorage.setItem(k, JSON.stringify(data));
  //     toast.success("Other information saved");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Server error");
  //   }
  // }

   const onSubmit = async (data: OthersFormType) => {
    if (!userId) {
      toast.error("User not identified. Please complete phone verification or login.");
      return;
    }

    // Save slice locally first
    saveCombinedDraft(userId, { others: data });

    // Optionally upload files here and replace fileMeta with URLs before sending combined draft
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
      toast.success("Others saved (combined draft submitted)");
      router.push("/register/done");
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
            <h2 className="text-xl font-semibold">Other Information</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-3">
                {fields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 border p-3 rounded">
                    <div>
                      <Label>Title</Label>
                      <Input {...register(`certificates.${i}.title` as const)} />
                    </div>
                    <div>
                      <Label>Skills</Label>
                      <Input {...register(`certificates.${i}.skills` as const)} />
                    </div>
                    <div className="flex flex-col w-full">
                      <Label>Upload (PDF)</Label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => onFileChange(i, e.target.files?.[0] ?? null)}
                      />
                      {/* <div className="text-sm text-muted-foreground mt-1">
                        {watch(`certificates.${i}.fileMeta`) ? (watch(`certificates.${i}.fileMeta`) as any).name : "No file chosen"}
                      </div> */}
                    </div>
                    {/* <div>
                      <Label>File</Label>
                      <FileInput
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0] ?? null;
                          setValue(`certificates.${i}.fileUrl` as const, file, { shouldValidate: true, shouldDirty: true });
                        }}
                      />
                    </div> */}
                    <div>
                      <Label>Date Issued</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Input value={displayDate((watch() as any).certificates?.[i]?.dateIssued)} readOnly placeholder="Select date" />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={(watch() as any).certificates?.[i]?.dateIssued ? new Date((watch() as any).certificates[i].dateIssued) : undefined}
                            onSelect={(d) => setISO(`certificates.${i}.dateIssued`, d)}
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="md:col-span-4 flex justify-end">
                      <Button type="button" variant="destructive" onClick={() => remove(i)}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <Button type="button" onClick={() => append({ title: "", dateIssued: "", skills: "", fileUrl: undefined })}>Add Certificate</Button>
              </div>
{/* 
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>Submit</Button>
              </div> */}
            </form>
          </Card>
        </main>
      </motion.div>
    </>
  );
});

export default OthersForm;
