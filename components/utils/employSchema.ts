
import { z } from "zod";

const PrevPromotionSchema = z.object({
  rank: z.string().min(1, "rank is required"),
  gradeLevel: z.string().min(1, "rank is required"),
  date: z.iso.datetime("Use the calendar to pick a date"),
});

const PrevStationSchema = z.object({
  station: z.string().min(1, "Station is required"),
  yearsInStation: z.string().min(1, "Years in station is required"),
});

const PrevJobSchema = z.object({
  job: z.string().min(1, "Job is required"),
  yearsInJob: z.string().min(1, "Years in job is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});

export const StationSchema = z.object({
  id: z.number(), // Or .min(1) if not UUID
  name: z.string(),
  type: z.string(),
});

export const EmploymentSchema = z.object({
  personnelNumber: z.string().min(1, "Personnel number is required"),
  ippisNumber: z.string().min(1, "IPPIS number is required"),
  rank: z.string().min(1, "Rank is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  step: z.string().min(1, "Step is required"),

  dateFirstAppointed: z.iso.datetime("Use the calendar to pick a date"),
  datePresentAppointment: z.iso.datetime("Use the calendar to pick a date"),
  dateLastPromotion: z.iso.datetime("Use the calendar to pick a date"),

  selectedState: z.string(),

  rankAtFirstAppointment: z.string().min(1, "Required"),
  presentStation: z.string().min(1, "Required"),
  standardStationId: StationSchema.shape.id,
  presentJobDescription: z.string().min(1, "Required"),
  department: z.string().min(1, "Required"),

  yearsInStation: z.coerce.number().int().min(0, "Must be a non-negative number"),
  yearsInService: z.coerce.number().int().min(0, "Must be a non-negative number"),

  previousStations: z.array(PrevStationSchema).default([]),
  previousJobsHandled: z.array(PrevJobSchema).default([]),
  previousPromotion: z.array(PrevPromotionSchema).default([]),
});

// export type EmploymentFormType = z.infer<typeof EmploymentSchema>;

// Use INPUT for form types (pre-default; keys with default are optional)
export type EmploymentFormInput = z.input<typeof EmploymentSchema>;
// If you ever need post-parse types elsewhere:
export type EmploymentFormOutput = z.output<typeof EmploymentSchema>;
