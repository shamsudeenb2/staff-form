// hooks/useDraft.ts
import { useState, useEffect } from "react";

export function useDraft(phone: string , page: string) {
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (phone) {
      loadDraft();
    }
  }, [phone, page]);

  async function saveDraft(data: any) {
    await fetch("/api/register/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, page, data }),
    });
  }

  async function loadDraft() {
    setLoading(true);
    const res = await fetch(`/api/register/draft?phone=${phone}&page=${page}`);
    const json = await res.json();
    if (json?.data) setDraft(json.data);
    setLoading(false);
  }

  return { draft, loading, saveDraft, loadDraft };
}
