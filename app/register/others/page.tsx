"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import { format } from "date-fns";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";


import  DateField  from "@/components/DateInput";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import FileInput from "@/components/FileUpload";
import { blob } from "stream/consumers";

/* ------------------------------- Schema ---------------------------------- */

const OthersSchema = z.object({
  certificates: z
    .array(
      z.object({
        title: z.string().min(2, "Title is required"),
        dateIssued: z.string().min(1, "Date is required"),
        skills: z.string().min(2, "Skills must be at least 2 characters"),
    //     fileUrl:  z
    //       .instanceof(File, { message: "File is required" })
    //       .refine((file) => file.size <= 2 * 1024 * 1024, {
    //         message: "File size must be <= 2MB",
    //       })
    //       .refine((file) => ["application/pdf"].includes(file.type), {
    //         message: "Only PDF files are allowed",
    // }).optional(),
      })
    )
    .optional(),
});

type OthersFormType = z.infer<typeof OthersSchema>;

/* ----------------------------- Helpers ---------------------------------- */

const isBrowser = () => typeof window !== "undefined";

const isValidISODate = (value?: string) => {
  if (!value || typeof value !== "string") return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
};
const displayDate = (iso?: string) => (isValidISODate(iso) ? format(new Date(iso as string), "yyyy-MM-dd") : "");
const draftKey = (phone?: string | null | undefined) => (phone ? `draft:${phone}:others` : null);

/* ------------------------------ Component -------------------------------- */

export default function OthersPage() {
  // phone input/state (allow user to type phone or prefill from localStorage)
   // Read phone only in the browser
    const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (!isBrowser()) return;
      setPhone(window.localStorage.getItem("nipost_phone"));
    }, []);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OthersFormType>({
    resolver: zodResolver(OthersSchema),
    defaultValues: {
      certificates: []
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
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
          debounce((values: OthersFormType, p?: string | null) => {
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "certificates",
  });

  // Submit handler (calls saveDraft for now and shows success)
  async function onSubmit(data: OthersFormType) {
        try {
          console.log("type of data", data);
          const p = phone || (isBrowser() ? window.localStorage.getItem("nipost_phone") : null);
          if (!p) {
            toast.error("Phone not found, please complete phone verification.");
            return;
          }

          if(data.certificates?.length === 0){
            console.log("type of data", data);
            router.push("/register/done"); 
            return;
          }

          const formData = new FormData();
              data.certificates?.forEach((cert, index) => {
              formData.append(`certificates[${index}][title]`, cert.title);
              formData.append(`certificates[${index}][dateIssued]`, cert.dateIssued);
              formData.append(`certificates[${index}][skills]`, cert.skills);
            //   if (cert.fileUrl instanceof File) {
            //     formData.append(`certificates[${index}][fileUrl]`, cert.fileUrl);
            //     console.log("file value", cert.fileUrl)
            //   }
            });
            
          formData.append(`phone`, p);
          
          const res = await fetch("/api/register/others", {
            method: "POST",
            body: formData,
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
          router.push("/register/done"); // adjust to next step when ready
        } catch (e) {
          console.error(e);
          toast.error("Server error while saving employment data");
        }
  }

  // Helper to set certificate date (safe update)
  function setCertificateDate(index: number, iso: string) {
    setValue(`certificates.${index}.dateIssued`, iso, { shouldValidate: true, shouldDirty: true });
  }

  return (
    <>
      <Toaster />
      <Navbar
        breadcrumbs={[
          { label: "Employment", href: "/register/employment"  },
          { label: "Others", },           

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
            <h1 className="text-2xl font-bold mb-4">Other Information</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Certificates</h3>

                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const watchedDate = (watched?.certificates?.[index] as any)?.dateIssued ?? "";
                    return (
                      <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                        
                        <div className="flex-1">
                          <Label>Title</Label>
                          <Input
                            {...register(`certificates.${index}.title` as const)}
                            className="w-full border px-3 py-2 rounded"
                          />
                          {errors.certificates?.[index]?.title && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.certificates[index]?.title?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>Skills Obtained</Label>
                          <Input {...register(`certificates.${index}.skills` as const)} className="w-full border px-3 py-2 rounded" />
                          {errors.certificates?.[index]?.skills && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.certificates[index]?.skills?.message}
                            </p>
                          )}
                        </div>
                        <div>
                          {/* <input
                            id="file"
                            type="file"
                            accept=".pdf"
                            disabled={uploading}
                            onChange={handleFileChange}
                          />

                          {file && (
                            <div className="flex items-center gap-3 mt-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded">
                              <FileIcon className="w-5 h-5 text-blue-500" />
                              <p className="text-sm truncate">{file.name}</p>
                            </div>
                          )} */}
                          {/* <Label>Upload Document (PDF only)"</Label>
                          <Input
                            // label="Upload Document (PDF only)"
                            id="file"
                            type="file"
                            accept=".pdf"
                            {...register(`certificates.${index}.fileUrl` as const)}
                          />
                          {errors.certificates?.[index]?.fileUrl && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.certificates[index]?.fileUrl?.message}
                            </p>
                          )} */}
                        </div>
                          <div>
                            <DateField
                            label="Date Issued"
                            value={watchedDate}
                            onSelectISO={(iso) => setValue(`certificates.${index}.dateIssued` as const, iso, { shouldValidate: true })}
                          />
                          {errors.certificates?.[index]?.dateIssued && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.certificates[index]?.dateIssued?.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Button type="button" variant="destructive" 
                          onClick={() => remove(index)}
                          className="mt-6"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <Button
                    type="button"
                    onClick={() => append({ title: "", skills:"", dateIssued: ""})}
                  >
                    Add Certificate
                  </Button>
                </div>
              </div>
                <div className="flex justify-between gap-3">
                 <Link href="/register/employment" className="p-1 text-center bg-black text-white">
                  <ArrowBigLeft/>
                </Link>
                    <Button type="submit" disabled={isSubmitting}
                     className="bg-green-500 text-white px-4 py-2 rounded">
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </form>                 
          </div>
        </main>
      </motion.div>
    </>
  );
}
