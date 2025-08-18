import { email, z } from "zod";

export const userSchema = z.object({
  phone: z.string().min(10),
});