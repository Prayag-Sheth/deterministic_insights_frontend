import { z } from "zod";

const phoneField = z
  .string()
  .max(30, "Phone must be at most 30 characters")
  .transform((value) => (value.trim() === "" ? null : value.trim()));

export const customerCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  company: z
    .string()
    .min(1, "Company is required")
    .max(255, "Company must be at most 255 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255, "Email must be at most 255 characters"),
  phone: phoneField,
  status: z.enum(["active", "inactive"]),
});

export const customerUpdateSchema = customerCreateSchema;

export type CustomerFormValues = z.input<typeof customerCreateSchema>;
export type CustomerFormOutput = z.output<typeof customerCreateSchema>;
