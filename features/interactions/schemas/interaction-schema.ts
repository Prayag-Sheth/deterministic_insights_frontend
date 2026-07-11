import { z } from "zod";

export const interactionTypeSchema = z.enum([
  "meeting",
  "call",
  "email",
  "demo",
  "follow_up",
]);

export const interactionCreateSchema = z.object({
  customer_id: z.string().uuid("Select a customer"),
  type: interactionTypeSchema,
  interaction_at: z.string().min(1, "Date and time are required"),
  raw_notes: z.string().min(1, "Notes are required"),
});

export const interactionUpdateSchema = z.object({
  type: interactionTypeSchema,
  interaction_at: z.string().min(1, "Date and time are required"),
  raw_notes: z.string().min(1, "Notes are required"),
});

export type InteractionCreateFormValues = z.input<
  typeof interactionCreateSchema
>;
export type InteractionCreateFormOutput = z.output<
  typeof interactionCreateSchema
>;
export type InteractionUpdateFormValues = z.input<
  typeof interactionUpdateSchema
>;
export type InteractionUpdateFormOutput = z.output<
  typeof interactionUpdateSchema
>;

/** Convert a YYYY-MM-DD calendar date to start-of-day local → aware ISO. */
export function dateToStartOfDayIso(yyyyMmDd: string): string {
  const [year, month, day] = yyyyMmDd.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
}

/** Convert a YYYY-MM-DD calendar date to end-of-day local → aware ISO. */
export function dateToEndOfDayIso(yyyyMmDd: string): string {
  const [year, month, day] = yyyyMmDd.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
}

/** Convert datetime-local value (local wall clock) to timezone-aware ISO. */
export function datetimeLocalToIso(value: string): string {
  return new Date(value).toISOString();
}

/** Convert an aware ISO string to a datetime-local input value in local TZ. */
export function isoToDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const INTERACTION_TYPE_LABELS: Record<
  z.infer<typeof interactionTypeSchema>,
  string
> = {
  meeting: "Meeting",
  call: "Call",
  email: "Email",
  demo: "Demo",
  follow_up: "Follow-up",
};
