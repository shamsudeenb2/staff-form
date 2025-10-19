// app/submissions/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import MonthSelector from "@/components/MonthSelector";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import DiffViewer from "@/components/DiffViewer";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { saveOrFinalizeSubmission, loadSubmission, loadLatestFinal, fetchSubmissionWindow } from "@/components/lib/submission-client";

// You must have these components (or adapt to your actual forms)
import EducationForm from "@/components/forms/EducationForm";
import EmploymentForm from "@/components/forms/EmploymentForm";
import OthersForm from "@/components/forms/OthersForm";
import { boolean } from "zod";

type PageKey = "personal" | "education" | "employment" | "others";

interface DataObject {
  education: Record<string, any>; // You can define a specific type here
  employment: Record<string, any>;
  others: Record<string, any>;
  isComplete: boolean;
}

export default function SubmissionCenter() {
  // const phone = typeof window !== "undefined" ? window.localStorage.getItem("nipost_userId") ?? "" : "";
  const [yearMonth, setYearMonth] = useState(() => {
    const d = new Date();
    const mm = d.toISOString().slice(0, 7); // YYYY-MM
    return mm;
  });

  const initialState: DataObject = {
  education: {},
  employment: {},
  others: {},
  isComplete: false,
};

  const [windowInfo, setWindowInfo] = useState<{ isOpen: boolean; yearMonth?: string; note?: string } | null>(null);
  const [isFinalize, setIsFinalize] = useState(false);
  const [activePage, setActivePage] = useState<PageKey>("education");
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState<DataObject>(initialState);
  const [serverDiff, setServerDiff] = useState<any>(null);
  const [latestFinal, setLatestFinal] = useState<any>(null);
  const [draftSubmission, setDraftSubmission] = useState<any>(null); // draft or final for month

  // refs to forms — forms should implement getData() -> object, setData(obj)
  // const personalRef = useRef<any>(null);
  const educationRef = useRef<any>(null);
  const employmentRef = useRef<any>(null);
  const othersRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const win = await fetchSubmissionWindow(yearMonth);
        
        setWindowInfo(win?.windows[0] ?? win?.windows[0] ?? null);
        
      } catch (e) {
        // ignore
        setWindowInfo(null);
      }
      // load existing submission for this phone+month
      try {
        const jsonDraft = await loadSubmission("DRAFT", yearMonth);
        
        if(jsonDraft.success){
          if (jsonDraft?.submission?.length) {
            const entry = jsonDraft.submission[0];
            console.log("message draft",activePage, jsonDraft.submission[0].data)
            setDraftSubmission(entry);

            // set forms data using ref if available
            const data = entry.data ?? {};
            setTimeout(() => {
              // personalRef.current?.setData?.(data.personal || {});
              educationRef.current?.setData?.(data.education || {});
              employmentRef.current?.setData?.(data.employment || {});
              othersRef.current?.setData?.(data.others || {});
            }, 20);
          } else {
            setDraftSubmission(null);
          }
        }else{
          const data = {};
          console.log("message draft", jsonDraft)
              // personalRef.current?.setData?.(data.personal || {});
              educationRef.current?.setData?.(data);
              employmentRef.current?.setData?.( data);
              othersRef.current?.setData?.(data);
        }
        
      } catch (err) {
        console.warn("load submission failed", err);
      }

      // also fetch latest final for compare
        try {
          const jsonFinal = await loadSubmission("FINAL", yearMonth);
          if(jsonFinal.success){
            if (jsonFinal?.submission?.length) {
              const entry = jsonFinal.submission[0];
              console.log("message final",activePage, jsonFinal.submission)
              setDraftSubmission(entry);
            }
          }else{
            setLatestFinal(null);
          }
          
        } catch (err) {
          // ignore
        }
    })();
  }, [yearMonth,activePage ]);

  // compose page data from the 4 forms
  const gatherAll = async () => {
    // each form should expose getData(); if not adapt to use react-hook-form value extraction
    // const personal = await personalRef.current?.getData?.();
    const education = await educationRef.current?.getData?.();
    const employment = await employmentRef.current?.getData?.();
    const others = await othersRef.current?.getData?.();
    return { education, employment, others };
  };

  useEffect(()  => {
    // Only run the POST if a specific condition is met, 
    // like both sections being filled, or the 'isComplete' flag being true.
   const getNow = async ()=>{

     if (dataList.isComplete) {
       const res = await saveOrFinalizeSubmission({ action: "save", yearMonth, dataList, activePage });
       if (res?.success) {
        toast.success("Draft saved");
        setDraftSubmission(res);
      } else {
        toast.error(res?.error || "Failed to save draft");
      }
      }
   }
    getNow()
    
  }, [dataList]);


const updateDataList=(data:any )=>{

  if(activePage==="education"){
        setDataList(prevData => ({
      // 1. Copy all existing properties from the previous state
      ...prevData,
      // 2. Overwrite or set the specific key (e.g., 'education') 
      //    with the new data object
      [activePage]: data.education,
      isComplete: true,
    }));
      }else if(activePage==="employment"){
        console.log("employment",activePage)
      setDataList(prevData => ({
      // 1. Copy all existing properties from the previous state
      ...prevData,
      // 2. Overwrite or set the specific key (e.g., 'education') 
      //    with the new data object
      [activePage]: data.employment,
      isComplete: true,
    }));
      }else if(activePage==="others"){
      setDataList(prevData => ({
      // 1. Copy all existing properties from the previous state
      ...prevData,
      // 2. Overwrite or set the specific key (e.g., 'education') 
      //    with the new data object
      [activePage]: data.others,
      isComplete:true
    }));
      }
}
  async function handleSaveDraft() {

    setLoading(true);
    try {
      const data = await gatherAll();

      updateDataList(data)

      console.log("data list", dataList , activePage)
      // const res = await saveOrFinalizeSubmission({ action: "save", yearMonth, dataList, activePage });
      // if (res?.success) {
      //   toast.success("Draft saved");
      //   setDraftSubmission(res);
      // } else {
      //   toast.error(res?.error || "Failed to save draft");
      // }
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleFinalize() {
    // confirm window open
    if (!windowInfo?.isOpen) {
      toast.error("Submission window is closed for this month.");
      return;
    }
    // get data, call finalize
    setLoading(true);
    try {
      const res = await saveOrFinalizeSubmission({ action: "finalize", yearMonth, dataList, activePage });
      if (res?.success) {
        toast.success("Final submission successful");
        setServerDiff(res.diff ?? res.diffSummary ?? null);
        // update current and latest
        const reload = await loadSubmission("FINAL", yearMonth);
        setLatestFinal(reload?.submission?.[0] ?? null);
      } else {
        toast.error(res?.error || "Failed to finalize");
      }
    } catch (err) {
      console.error(err);
      toast.error("Finalize failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Toaster />
      <DashboardLayout>
      <main className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <MonthSelector value={yearMonth} onChange={setYearMonth} />
              <div>
                <div className={`px-3 py-2 rounded ${windowInfo?.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {windowInfo?.isOpen ? `OPEN (${windowInfo?.yearMonth})` : `CLOSED (${yearMonth})`}
                </div>
                {windowInfo?.note && <div className="text-sm text-gray-500 mt-1">{windowInfo.note}</div>}
              </div>
            </div>

          </div>

          <div className="bg-white rounded shadow p-4">
            <div className="flex gap-3 border-b pb-3 mb-4">
              {(["education", "employment", "others"] as PageKey[]).map((p) => (
                <button key={p} onClick={() => setActivePage(p)} className={`px-3 py-2 rounded ${activePage === p ? "bg-blue-600 text-white" : "hover:bg-slate-50"}`}>
                  {p[0].toUpperCase() + p.slice(1)}
                </button>
              ))}
              
            </div>

            <div>
              {/* render relevant form: each form must implement setData/getData via ref */}
              {/* {activePage === "personal" && <PersonalForm ref={personalRef} />} */}
              {activePage === "education" && <EducationForm ref={educationRef} />}
              {activePage === "employment" && <EmploymentForm ref={employmentRef} />}
              {activePage === "others" && <OthersForm ref={othersRef} />}
            </div>
              <div className="flex justify-center gap-3">
              <Button onClick={handleSaveDraft} disabled={loading || !windowInfo?.isOpen || draftSubmission?.status==="FINAL" }>Save Draft</Button>
              {activePage==="others"?(<><Button onClick={handleFinalize} disabled={loading || !windowInfo?.isOpen || draftSubmission?.status==="FINAL"}>Finalize</Button></>):(<></>)}
            </div>
          </div>
        </div>
      </main>
      </DashboardLayout>
    </>
  );
}
