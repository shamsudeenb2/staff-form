"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";


const isBrowser = () => typeof window !== "undefined";

export default function DonePage() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);

    useEffect(() => {
      if (!isBrowser()) return;
        setPhone(window.localStorage.getItem("nipost_phone"));
      }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/register/done", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone}),
       });
      if (res.ok) {
        toast.success("Form successfully submitted!");
        localStorage.removeItem(`draft:${phone}:personal`);
        localStorage.removeItem(`draft:${phone}:education`);
        localStorage.removeItem(`draft:${phone}:employment`);
        localStorage.removeItem(`draft:${phone}:others`);
        router.push("/register/create-password"); // Redirect after submission
        
      } else {
        toast.error("Failed to submit form");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Confirm Final Submission
            </h2>
            <p className="mb-6">
              Are you sure you want to <strong>completely submit</strong> the form?
              Once submitted, you may not be able to make changes.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
