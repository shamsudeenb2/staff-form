// app/admin/submission-windows/page.tsx
"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Toaster, toast } from "sonner";
import MonthSelector from "@/components/MonthSelector";
import { upsertSubmissionWindow, listSubmissionWindows } from "@/components/lib/submission-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminSubmissionWindows() {
  const [yearMonth, setYearMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [windows, setWindows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadList();
  }, []);

  async function loadList() {
    try {
      const j = await listSubmissionWindows();
      setWindows(j?.windows ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpsert() {
    setLoading(true);
    try {
      const res = await upsertSubmissionWindow({ yearMonth, isOpen, note });
      if (res?.success) {
        toast.success("Window updated");
        loadList();
      } else {
        toast.error(res?.error || "Failed");
      }
    } catch (err) {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Toaster />
      <DashboardLayout>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <main className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center gap-3">
              <MonthSelector value={yearMonth} onChange={setYearMonth} />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />
                <span>Open</span>
              </label>
              <Input placeholder="Optional note" value={note} onChange={(e) => setNote(e.target.value)} />
              <Button onClick={handleUpsert} disabled={loading}>Save</Button>
            </div>
          </div>

          <div className="bg-white rounded shadow p-4">
            <h3 className="font-semibold mb-3">All windows</h3>
            <div className="space-y-2">
              {windows.map((w) => (
                <div key={w.yearMonth} className="flex items-center justify-between border rounded p-2">
                  <div>
                    <div className="font-medium">{w.yearMonth}</div>
                    <div className="text-sm text-gray-500">{w.note}</div>
                  </div>
                  <div className={`px-3 py-1 rounded ${w.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {w.isOpen ? "OPEN" : "CLOSED"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      </motion.div>
      </DashboardLayout>
    </>
  );
}
