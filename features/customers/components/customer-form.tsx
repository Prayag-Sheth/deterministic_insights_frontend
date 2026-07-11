"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

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
import {
  customerCreateSchema,
  type CustomerFormOutput,
  type CustomerFormValues,
} from "@/features/customers/schemas/customer-schema";
import { isApiError } from "@/lib/axios";

interface CustomerFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<CustomerFormValues>;
  onSubmit: (values: CustomerFormOutput) => Promise<void>;
  isSubmitting?: boolean;
  cancelHref: string;
}

const FORM_FIELDS = ["name", "company", "email", "phone", "status"] as const;

export function CustomerForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  cancelHref,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<CustomerFormValues, unknown, CustomerFormOutput>({
    resolver: zodResolver(customerCreateSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      status: "active",
      ...defaultValues,
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      if (isApiError(error) && error.details.length > 0) {
        for (const detail of error.details) {
          const field = detail.field;
          if (
            field &&
            FORM_FIELDS.includes(field as (typeof FORM_FIELDS)[number])
          ) {
            setError(field as (typeof FORM_FIELDS)[number], {
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
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          autoComplete="name"
          autoFocus={mode === "create"}
          aria-invalid={Boolean(errors.name)}
          disabled={isSubmitting}
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          autoComplete="organization"
          aria-invalid={Boolean(errors.company)}
          disabled={isSubmitting}
          {...register("company")}
        />
        {errors.company ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.company.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          disabled={isSubmitting}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
          disabled={isSubmitting}
          {...register("phone")}
        />
        {errors.phone ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.phone.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="status"
                className="w-full"
                aria-invalid={Boolean(errors.status)}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.status ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.status.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="text-primary-foreground" />
              {mode === "create" ? "Creating…" : "Saving…"}
            </>
          ) : mode === "create" ? (
            "Create customer"
          ) : (
            "Save changes"
          )}
        </Button>
        <Button type="button" variant="outline" asChild disabled={isSubmitting}>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
