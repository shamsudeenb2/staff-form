// components/MonthSelector.tsx
"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { format, addMonths } from "date-fns";

export default function MonthSelector({
  value,
  onChange,
  rangeMonths = 12, // how many months to allow before/after current
}: {
  value: string;
  onChange: (ym: string) => void;
  rangeMonths?: number;
}) {
  // prepare month list: default current month and previous 11 months
  const now = new Date();
  const months: string[] = [];
  for (let i = 0; i < rangeMonths; i++) {
    const d = addMonths(now, -i);
    months.push(format(d, "yyyy-MM"));
  }

  return (
    <div>
      <Label>Month</Label>
      <Select value={value} onValueChange={(v) => onChange(v)}>
        <SelectTrigger>
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
