// lib/submission-client.ts
export type Action = "save" | "finalize";

export async function fetchSubmissionWindow(yearMonth: string) {
  const res = await fetch(`/api/admin/submission-windows?yearMonth=${encodeURIComponent(yearMonth)}`);
  if (!res.ok) throw new Error("Failed to fetch window");
  return res.json();
}

export async function listSubmissionWindows() {
  const res = await fetch(`/api/admin/submission-windows`);
  if (!res.ok) throw new Error("Failed to list windows");
  return res.json();
}

export async function upsertSubmissionWindow(payload: { yearMonth: string; isOpen: boolean; note?: string }) {
  const res = await fetch(`/api/admin/submission-windows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function saveOrFinalizeSubmission(params: {
  action: Action;
  yearMonth: string;
  dataList: any;
  activePage:string;
}) {
  console.log("data params",params)
  const res = await fetch(`/api/submissions/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function loadSubmission(status: string, yearMonth: string) {
  const res = await fetch(`/api/submissions/submit?status=${encodeURIComponent(status)}&yearMonth=${encodeURIComponent(yearMonth)}`);
  if (!res.ok) throw new Error("Failed to load submission");
  return res.json();
}

export async function loadLatestFinal(phone: string) {
  const res = await fetch(`/api/submissions/latest?phone=${encodeURIComponent(phone)}`);
  if (!res.ok) throw new Error("Failed to load latest final");
  return res.json();
}
