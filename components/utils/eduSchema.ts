
import { z } from "zod";

const  additionalQualifications = z.object({
  qualification: z.string().min(1, "Qualification name is required"),
  institution: z.string().min(1, "Institution name is required"),
  start: z.string().refine(
    (v) => !!v && new Date(v) < new Date(),
    "DOB must be in the past"
  ),
  end: z.string().refine(
    (v) => !!v && new Date(v) < new Date(),
    "DOB must be in the past"
  ),
  type: z.string().min(1, "Year obtained is required"),
});

export const  EduSchema = z.object({
  qualAt1stAppt: z.string().min(1, "Qualification name is required"),
  institution: z.string().min(1, "Institution name is required"),
  startDate: z.string().refine(
    (v) => !!v && new Date(v) < new Date(),
    "DOB must be in the past"
  ),
  endDate: z.string().refine(
    (v) => !!v && new Date(v) < new Date(),
    "DOB must be in the past"
  ),
  addQualification: z.array(additionalQualifications).optional(),
});

export type EducationalFormType = z.infer<typeof EduSchema>;