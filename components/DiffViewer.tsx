// components/DiffViewer.tsx
"use client";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import { motion } from "framer-motion";

export default function DiffViewer({ diff }: { diff?: { added?: Record<string, any>; removed?: Record<string, any>; changed?: Record<string, { from: any; to: any }> } }) {
  if (!diff) return null;

  const { added = {}, removed = {}, changed = {} } = diff;

  const hasAny = Object.keys(added).length + Object.keys(removed).length + Object.keys(changed).length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <h3 className="font-semibold">Summary of changes</h3>
      {!hasAny && <div className="text-sm text-gray-500">No differences detected vs previous final.</div>}

      {Object.keys(added).length > 0 && (
        <div>
          <h4 className="text-sm font-medium">Added</h4>
          <pre className="rounded-md p-3 bg-slate-50 text-xs overflow-auto max-h-40 border">{JSON.stringify(added, null, 2)}</pre>
        </div>
      )}

      {Object.keys(changed).length > 0 && (
        <div>
          <h4 className="text-sm font-medium">Changed</h4>
          <pre className="rounded-md p-3 bg-slate-50 text-xs overflow-auto max-h-40 border">{JSON.stringify(changed, null, 2)}</pre>
        </div>
      )}

      {Object.keys(removed).length > 0 && (
        <div>
          <h4 className="text-sm font-medium">Removed</h4>
          <pre className="rounded-md p-3 bg-slate-50 text-xs overflow-auto max-h-40 border">{JSON.stringify(removed, null, 2)}</pre>
        </div>
      )}
    </motion.div>
  );
}
