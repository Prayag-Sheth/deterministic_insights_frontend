"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Controller,
  useForm,
  type Control,
  type UseFormRegisterReturn,
} from "react-hook-form";

import { Spinner } from "@/components/shared/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomersList } from "@/features/customers/hooks/use-customers-list";
import {
  datetimeLocalToIso,
  INTERACTION_TYPE_LABELS,
  interactionCreateSchema,
  interactionUpdateSchema,
  type InteractionCreateFormOutput,
  type InteractionCreateFormValues,
  type InteractionUpdateFormOutput,
  type InteractionUpdateFormValues,
} from "@/features/interactions/schemas/interaction-schema";
import { isApiError } from "@/lib/axios";
import type { InteractionType } from "@/types/interaction";

const CREATE_FIELDS = [
  "customer_id",
  "type",
  "interaction_at",
  "raw_notes",
] as const;

const UPDATE_FIELDS = ["type", "interaction_at", "raw_notes"] as const;

const textareaClassName =
  "flex min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40";

interface InteractionFormCreateProps {
  mode: "create";
  defaultValues?: Partial<InteractionCreateFormValues>;
  onSubmit: (values: {
    customer_id: string;
    type: InteractionCreateFormOutput["type"];
    interaction_at: string;
    raw_notes: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
  cancelHref: string;
}

interface InteractionFormEditProps {
  mode: "edit";
  customerName: string;
  defaultValues?: Partial<InteractionUpdateFormValues>;
  onSubmit: (values: {
    type: InteractionUpdateFormOutput["type"];
    interaction_at: string;
    raw_notes: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
  cancelHref: string;
}

type InteractionFormProps =
  InteractionFormCreateProps | InteractionFormEditProps;

export function InteractionForm(props: InteractionFormProps) {
  if (props.mode === "create") {
    return <InteractionCreateForm {...props} />;
  }
  return <InteractionEditForm {...props} />;
}

function InteractionCreateForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  cancelHref,
}: InteractionFormCreateProps) {
  const { data: customersData, isPending: customersLoading } = useCustomersList(
    {
      page: 1,
      page_size: 100,
      status: "active",
    },
  );

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<
    InteractionCreateFormValues,
    unknown,
    InteractionCreateFormOutput
  >({
    resolver: zodResolver(interactionCreateSchema),
    defaultValues: {
      customer_id: "",
      type: "meeting",
      interaction_at: "",
      raw_notes: "",
      ...defaultValues,
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit({
        customer_id: values.customer_id,
        type: values.type,
        interaction_at: datetimeLocalToIso(values.interaction_at),
        raw_notes: values.raw_notes,
      });
    } catch (error) {
      if (isApiError(error) && error.details.length > 0) {
        for (const detail of error.details) {
          const field = detail.field;
          if (
            field &&
            CREATE_FIELDS.includes(field as (typeof CREATE_FIELDS)[number])
          ) {
            setError(field as (typeof CREATE_FIELDS)[number], {
              message: detail.message,
            });
          }
        }
      }
    }
  });

  return (
    <form onSubmit={submit} className="max-w-xl space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="customer_id">Customer</Label>
        <Controller
          control={control}
          name="customer_id"
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
              disabled={isSubmitting || customersLoading}
            >
              <SelectTrigger
                id="customer_id"
                className="w-full"
                aria-invalid={Boolean(errors.customer_id)}
              >
                <SelectValue
                  placeholder={
                    customersLoading
                      ? "Loading customers…"
                      : "Select a customer"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(customersData?.items ?? []).map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.customer_id ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.customer_id.message}
          </p>
        ) : null}
      </div>

      <TypeField
        error={errors.type?.message}
        disabled={isSubmitting}
        control={control}
      />

      <DateTimeField
        error={errors.interaction_at?.message}
        disabled={isSubmitting}
        register={register("interaction_at")}
      />

      <NotesField
        error={errors.raw_notes?.message}
        disabled={isSubmitting}
        register={register("raw_notes")}
      />

      <FormActions
        mode="create"
        isSubmitting={isSubmitting}
        cancelHref={cancelHref}
      />
    </form>
  );
}

function InteractionEditForm({
  customerName,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  cancelHref,
}: InteractionFormEditProps) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<
    InteractionUpdateFormValues,
    unknown,
    InteractionUpdateFormOutput
  >({
    resolver: zodResolver(interactionUpdateSchema),
    defaultValues: {
      type: "meeting",
      interaction_at: "",
      raw_notes: "",
      ...defaultValues,
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit({
        type: values.type,
        interaction_at: datetimeLocalToIso(values.interaction_at),
        raw_notes: values.raw_notes,
      });
    } catch (error) {
      if (isApiError(error) && error.details.length > 0) {
        for (const detail of error.details) {
          const field = detail.field;
          if (
            field &&
            UPDATE_FIELDS.includes(field as (typeof UPDATE_FIELDS)[number])
          ) {
            setError(field as (typeof UPDATE_FIELDS)[number], {
              message: detail.message,
            });
          }
        }
      }
    }
  });

  return (
    <form onSubmit={submit} className="max-w-xl space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="customer_readonly">Customer</Label>
        <Input id="customer_readonly" value={customerName} disabled readOnly />
      </div>

      <TypeField
        error={errors.type?.message}
        disabled={isSubmitting}
        control={control}
      />

      <DateTimeField
        error={errors.interaction_at?.message}
        disabled={isSubmitting}
        register={register("interaction_at")}
      />

      <NotesField
        error={errors.raw_notes?.message}
        disabled={isSubmitting}
        register={register("raw_notes")}
      />

      <FormActions
        mode="edit"
        isSubmitting={isSubmitting}
        cancelHref={cancelHref}
      />
    </form>
  );
}

function TypeField({
  error,
  disabled,
  control,
}: {
  error?: string;
  disabled: boolean;
  control:
    | Control<InteractionCreateFormValues>
    | Control<InteractionUpdateFormValues>;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="type">Type</Label>
      <Controller
        // Both create/update schemas share the same `type` field.
        control={control as Control<InteractionCreateFormValues>}
        name="type"
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id="type"
              className="w-full"
              aria-invalid={Boolean(error)}
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.entries(INTERACTION_TYPE_LABELS) as [
                  InteractionType,
                  string,
                ][]
              ).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function DateTimeField({
  error,
  disabled,
  register,
}: {
  error?: string;
  disabled: boolean;
  register: UseFormRegisterReturn;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="interaction_at">Date & time</Label>
      <Input
        id="interaction_at"
        type="datetime-local"
        aria-invalid={Boolean(error)}
        disabled={disabled}
        {...register}
      />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function NotesField({
  error,
  disabled,
  register,
}: {
  error?: string;
  disabled: boolean;
  register: UseFormRegisterReturn;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="raw_notes">Notes</Label>
      <textarea
        id="raw_notes"
        className={textareaClassName}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        {...register}
      />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FormActions({
  mode,
  isSubmitting,
  cancelHref,
}: {
  mode: "create" | "edit";
  isSubmitting: boolean;
  cancelHref: string;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner size="sm" className="text-primary-foreground" />
            {mode === "create" ? "Creating…" : "Saving…"}
          </>
        ) : mode === "create" ? (
          "Log interaction"
        ) : (
          "Save changes"
        )}
      </Button>
      <Button type="button" variant="outline" asChild disabled={isSubmitting}>
        <Link href={cancelHref}>Cancel</Link>
      </Button>
    </div>
  );
}
