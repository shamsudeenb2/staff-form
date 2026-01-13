"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  TrendingUp, 
  User as UserIcon, 
  Loader2,
  CheckCircle2
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
// import { useToast } from "@/components/ui/use-toast"; // Assuming shadcn toast
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Toaster, toast } from "sonner";
import { nigeriaStates, getstationByState } from "@/components/lib/stationState";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


// Standardized options - in production, these could come from a global config or API
const STATIONS = ["HQ Abuja", "Lagos GPO", "Kano", "Port Harcourt", "Ibadan", "Kaduna"];
const STATES = ["FCT", "Lagos", "Kano", "Rivers", "Oyo", "Kaduna"];
const GRADES = ["GL.01","GL.02","GL.03","GL.04","GL.05","GL.06","GL.07", "GL.08", "GL.09", "GL.10", "GL.12", "GL.13", "GL.14", "GL.15", "GL.16","GL.17"];

interface FetchState {
  id: number;
  name: string;
}

 const StationSchema = z.object({
  id: z.number(), // Or .min(1) if not UUID
  name: z.string(),
  type: z.string(),
});
const updateSchema = z.object({
  standardStationId: StationSchema.shape.id,
  presentStation: z.string().min(1, "Station is required"),
  selectedState: z.string().min(1, "State is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  rank: z.string().min(1, "Rank is required"),
});
type upateFormInput = z.input<typeof updateSchema>;
export default function UpdateStaffPage() {
  const router = useRouter();
  const params = useParams();
//   const { toast } = useToast();

const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<upateFormInput>({
    resolver: zodResolver(updateSchema),
    defaultValues: {    },
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchState, setfetchState] = useState<FetchState[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);
  const [emId, setEmId] = useState<string>("")

  
  //fetch list of state
          useEffect(() => {
          try {
            
              async function fetchTires() {
              const res = await fetch(`/api/register/employment`);
              const data = await res.json();
              
              if(data.success){
           
                setfetchState(data.data)
              }
            }
            fetchTires()            
          } catch {
            // ignore parse errors
          }
        }, []);

  // Fetch initial data
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(`/api/admin/update/${params.id}`);
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        if(data.success){
            
            
            reset(data.data)
            const state = getNameById(fetchState, data?.data?.standardStation)
            setValue("selectedState", data?.data?.standardStation?.name, { shouldValidate: true });
            setValue("presentStation", data?.data?.presentStation, { shouldValidate: true });
            setValue("standardStationId",data?.data?.standardStation?.id, { shouldValidate: true });
            setEmId(data?.data?.id);
        }
      
      } catch (err) {
        toast( "Could not load staff details." );
        // router.push("/admin/dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [params.id, router, toast]);

    function getNameById(data: FetchState[], id: number){
          const foundItem = data.find(item => item.id === id);
          return foundItem?.name as string;
        }

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

  const onSubmit = async (data: upateFormInput) => {
   
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/update/${emId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Update failed");

      toast( "Staff record updated successfully." );
      router.push(`/admin/users/${params.id}`); // Return to detail page
      router.refresh();
    } catch (err) {
      toast("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
console.log("fetch state and type", errors)
  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="px-4 md:px-8 py-6 max-w-[800px] mx-auto"
      >
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Update Staff Transfer and Promotion</h1>

          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Transfer Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5 text-blue-500" /> Staff Transfer
              </CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
<div>
                  <Label>New State</Label>
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
                  <Label>New Postoffice</Label>
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
                          -- select new state first --
                        </SelectItem>
                      ) : (
                        <>
                          <SelectItem value="__unset__" disabled>
                            Select P.O
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

            </CardContent>
          </Card>

          {/* Promotion Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-green-500" /> Promotion
              </CardTitle>
              <CardDescription>Update rank and grade level for promotions.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                 <Label>New Grade Level </Label>
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
                      Select New Grade Level
                    </SelectItem>
                    {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
                  <div>
                    <Label>New Rank Title</Label>
                    <Input {...register("rank")} />
                    {errors.rank && <p className="text-red-600 text-sm mt-1">{errors.rank.message}</p>}
                  </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="min-w-[140px]">
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Changes</>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}