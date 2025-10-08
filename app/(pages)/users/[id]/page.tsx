"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Toaster } from "sonner";

import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";

type Json = any;

type UserResp = {
  success?: boolean;
  user?: {
    id: string;
    phone: string;
    email?: string | null;
    role?: string | null;
    done?: boolean | null;
    createdAt: string;
    updatedAt: string;

    personalData?: {
      firstName: string;
      lastName: string;
      gender: string;
      dob: string;
      maritalStatus: string;
      address: string;
      lga: string;
      state: string;
      placeOfBirth: string;
      senatorialDistrict: string;
      pensionAdmin: string;
      penComNo: string;
      nextOfKin: string;
      nextOfKinPhone: string;
    } | null;

    educationHistory?: {
      qualAt1stAppt: string;
      institution: string;
      startDate?: string | null;
      endDate?: string | null;
      addQualification: Array<{
        id: string;
        type: string;
        qualification: string;
        institution: string;
        startDate?: string | null;
        endDate?: string | null;
      }>;
    } | null;

    employmentData?: {
      personnelNumber: string;
      ippisNumber: string;
      rank: string;
      gradeLevel: string;
      step: string;
      dateFirstAppointed: string;
      datePresentAppointment: string;
      dateLastPromotion: string;
      rankAtFirstAppointment: string;
      presentStation: string;
      previousStations: Array<{ id: string; station: string; yearsInStation: string }>;
      previousPromotion: Array<{ id: string; rank: string; gradeLevel: string; date: string }>;
      presentJobDescription: string;
      previousJobsHandled: Array<{
        id: string;
        job: string;
        yearsInJob: string;
        jobDescription: string;
      }>;
      department: string;
      yearsInStation: number;
      yearsInService: number;
    } | null;

    otherData?: { content?: Json | null } | null;
  };
};

const isValidDate = (d?: string | null) => {
  if (!d) return false;
  const dt = new Date(d);
  return !Number.isNaN(dt.getTime());
};
const fmt = (d?: string | null) => (isValidDate(d) ? format(new Date(d!), "yyyy-MM-dd") : "—");
const show = (v: any) => (v !== undefined && v !== null && String(v).trim() !== "" ? String(v) : "—");

export default function AdminUserDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserResp["user"] | null>(null);
  const [page, setPage] = useState(1);
  // const [count, setCount] = useState(5);
  let count = page

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/admin/users/${params.id}`);
        const json: UserResp = await res.json();
        if (!active) return;
        if (res.ok && json.success && json.user) {
          setUser(json.user);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error(e);
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [params.id]);

  const fullName = useMemo(() => {
    const p = user?.personalData;
    return p ? `${p.firstName} ${p.lastName}` : "—";
  }, [user]);
  
  const next =()=>{
    console.log("next:count, page  ", count, page)
      count = count+1
      setPage(count)
    }

    const back =()=>{
      console.log("back:count, page  ", count, page)
      count = count-1
      setPage(count)
  }
  return (
    <>
      <Toaster />
      <DashboardLayout>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full"
      >
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-6">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Header + pager */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{fullName}</h1>
                {user?.done ? (
                  <Badge variant="default">Completed</Badge>
                ) : (
                  <Badge variant="outline">Incomplete</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={page === 1 ? "default" : "outline"}
                  onClick={() => back()}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant={page === 5 ? "default" : "outline"}
                  onClick={() => next()}
                  disabled={page === 5}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            )}

            {!loading && !user && (
              <Card>
                <CardHeader>
                  <CardTitle>User not found</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                  </Button>
                </CardContent>
              </Card>
            )}

            {!loading && user && (
              <>
                {/* Page 1: Bio + Additional Education */}
                {page === 1 && (
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                    {/* Bio Data */}
                    <Card className="min-h-[60vh]">
                      <CardHeader>
                        <CardTitle>Bio Data</CardTitle>
                      </CardHeader>
                      <Separator />
                      <ScrollArea className="h-[calc(60vh-4rem)] p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                          <Field label="Name" value={fullName} />
                          <Field label="Gender" value={show(user.personalData?.gender)} />
                          <Field label="Date of Birth" value={fmt(user.personalData?.dob)} />
                          <Field label="Place of Birth" value={show(user.personalData?.placeOfBirth)} />
                          <Field label="Local GovT. Area (LGA)" value={show(user.personalData?.lga)} />
                          <Field label="State" value={show(user.personalData?.state)} />
                          <Field label="Marital Status" value={show(user.personalData?.maritalStatus)} />
                          <Field label="Address" value={show(user.personalData?.address)} />
                          <Field label="Phone" value={show(user.phone)} />
                          <Field label="Email" value={show(user.email)} />
                          <Field label="PenCom No." value={show(user.personalData?.penComNo)} />
                          <Field label="Pension Admin" value={show(user.personalData?.pensionAdmin)} />
                          <Field label="Next of Kin" value={show(user.personalData?.nextOfKin)} />
                          <Field label="Next of Kin Phone" value={show(user.personalData?.nextOfKinPhone)} />
                        </div>

                        <Separator className="my-4" />

                        {/* Appointment/Promotion quick look (from Employment) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                          <Field
                            label="Date of First Appointment"
                            value={fmt(user.employmentData?.dateFirstAppointed)}
                          />
                          <Field
                            label="Date of Last Promotion"
                            value={fmt(user.employmentData?.dateLastPromotion)}
                          />
                          <Field label="Rank" value={show(user.employmentData?.rank)} />
                          <Field label="Present Station" value={show(user.employmentData?.presentStation)} />
                        </div>
                      </ScrollArea>
                    </Card>
                  </div>
                )}

                {page === 2 && (
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                    {/* Additional Education */}
                    <Card className="min-h-[60vh]">
                      <CardHeader>
                        <CardTitle>Education</CardTitle>
                      </CardHeader>
                      <Separator />
                      <ScrollArea className="h-[calc(60vh-4rem)] p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                          <Field label="Qualification at 1st Appointment" value={show(user.educationHistory?.qualAt1stAppt)} />
                          <Field label="Institution" value={show(user.educationHistory?.institution)} />
                          <Field label="Start Date" value={fmt(user.educationHistory?.startDate || null)} />
                          <Field label="End Date" value={fmt(user.educationHistory?.endDate || null)} />
                        </div>

                        <Separator className="my-4" />

                        <h3 className="font-semibold mb-2">Additional Qualifications</h3>
                        {user.educationHistory?.addQualification?.length ? (
                          <div className="space-y-3">
                            {user.educationHistory.addQualification.map((aq) => (
                              <div key={aq.id} className="border rounded-md p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                  <Field label="Type" value={show(aq.type)} />
                                  <Field label="Qualification" value={show(aq.qualification)} />
                                  <Field label="Institution" value={show(aq.institution)} />
                                  <Field label="From" value={fmt(aq.startDate || null)} />
                                  <Field label="To" value={fmt(aq.endDate || null)} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No additional qualifications.</p>
                        )}
                      </ScrollArea>
                    </Card>
                  </div>
                  )}

                {/* Page 3: Promotions, */}
                {page === 3 && (
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                    {/* Promotions */}
                    <Card className="lg:col-span-1 min-h-[60vh]">
                      <CardHeader>
                        <CardTitle>Promotion History</CardTitle>
                      </CardHeader>
                      <Separator />
                      <ScrollArea className="h-[calc(60vh-4rem)] p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                          <Field label="Current Rank" value={show(user.employmentData?.rank)} />
                          <Field label="Current Grade Level" value={show(user.employmentData?.gradeLevel)} />
                          <Field label="Step" value={show(user.employmentData?.step)} />
                          <Field
                            label="Date of Present Appointment"
                            value={fmt(user.employmentData?.datePresentAppointment)}
                          />
                          <Field
                            label="Date of Last Promotion"
                            value={fmt(user.employmentData?.dateLastPromotion)}
                          />
                        </div>

                        <Separator className="my-4" />
                        <h3 className="font-semibold mb-2">Previous Promotions</h3>
                        {user.employmentData?.previousPromotion?.length ? (
                          <div className="space-y-3">
                            {user.employmentData.previousPromotion.map((pp) => (
                              <div key={pp.id} className="border rounded-md p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                  <Field label="Rank" value={show(pp.rank)} />
                                  <Field label="Grade Level" value={show(pp.gradeLevel)} />
                                  <Field label="Date" value={fmt(pp.date)} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No previous promotions.</p>
                        )}
                      </ScrollArea>
                    </Card>
                    </div>
                    )}


                {/* Page 2: Stations */}
                {page === 4 && (
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                    {/* Stations */}
                    <Card className="lg:col-span-1 min-h-[60vh]">
                      <CardHeader>
                        <CardTitle>Stations</CardTitle>
                      </CardHeader>
                      <Separator />
                      <ScrollArea className="h-[calc(60vh-4rem)] p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                          <Field label="Present Station" value={show(user.employmentData?.presentStation)} />
                          <Field label="Department" value={show(user.employmentData?.department)} />
                          <Field label="Years in Station" value={show(user.employmentData?.yearsInStation)} />
                          <Field label="Years in Service" value={show(user.employmentData?.yearsInService)} />
                        </div>

                        <Separator className="my-4" />
                        <h3 className="font-semibold mb-2">Previous Stations</h3>
                        {user.employmentData?.previousStations?.length ? (
                          <div className="space-y-3">
                            {user.employmentData.previousStations.map((ps) => (
                              <div key={ps.id} className="border rounded-md p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                  <Field label="Station" value={show(ps.station)} />
                                  <Field label="Years in Station" value={show(ps.yearsInStation)} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No previous stations.</p>
                        )}
                      </ScrollArea>
                    </Card>
                    </div>
                )}

                     {/* Page 2: Stations */}
                  {page === 5 && (
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                    {/* Jobs */}
                    <Card className="lg:col-span-1 min-h-[60vh]">
                      <CardHeader>
                        <CardTitle>Jobs / Positions</CardTitle>
                      </CardHeader>
                      <Separator />
                      <ScrollArea className="h-[calc(60vh-4rem)] p-4">
                        <div className="mb-4">
                          <Field label="Present Job Description" value={show(user.employmentData?.presentJobDescription)} />
                        </div>

                        <Separator className="my-4" />
                        <h3 className="font-semibold mb-2">Previous Jobs Handled</h3>
                        {user.employmentData?.previousJobsHandled?.length ? (
                          <div className="space-y-3">
                            {user.employmentData.previousJobsHandled.map((pj) => (
                              <div key={pj.id} className="border rounded-md p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                  <Field label="Job" value={show(pj.job)} />
                                  <Field label="Years in Job" value={show(pj.yearsInJob)} />
                                  <div className="md:col-span-2">
                                    <Field label="Description" value={show(pj.jobDescription)} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No previous jobs handled.</p>
                        )}

                        <Separator className="my-4" />
                        <h3 className="font-semibold mb-2">Other Data</h3>
                        {user.otherData?.content ? (
                          <pre className="text-xs bg-gray-50 rounded-md p-3 overflow-auto">
                            {JSON.stringify(user.otherData.content, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-sm text-gray-500">No other data.</p>
                        )}
                      </ScrollArea>
                    </Card>
                  </div>
                )}

                {/* Bottom pager (sticky-ish) */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-gray-500">
                    Last updated: {fmt(user.updatedAt)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={page === 1 ? "default" : "outline"}
                      onClick={() => back()}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                    variant={page === 5 ? "default" : "outline"}
                      onClick={() => next()}
                      disabled={page === 5}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </motion.div>
      </DashboardLayout>
    </>
  );
}

/* --------------------------- Small UI helper --------------------------- */

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
