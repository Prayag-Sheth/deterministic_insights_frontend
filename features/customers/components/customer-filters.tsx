"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useState, type FormEvent } from "react";

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
import type { CustomerStatus } from "@/types/customer";

function buildCustomersUrl(params: {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
}): string {
  const next = new URLSearchParams();

  const page = params.page ?? 1;
  const pageSize = params.page_size ?? 20;

  if (page !== 1) {
    next.set("page", String(page));
  }
  if (pageSize !== 20) {
    next.set("page_size", String(pageSize));
  }
  if (params.status === "active" || params.status === "inactive") {
    next.set("status", params.status);
  }
  if (params.search) {
    next.set("search", params.search);
  }

  const query = next.toString();
  return query ? `/customers?${query}` : "/customers";
}

export function CustomerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusParam = searchParams.get("status");
  const status: CustomerStatus | "" =
    statusParam === "active" || statusParam === "inactive" ? statusParam : "";
  const searchFromUrl = searchParams.get("search") ?? "";
  const pageSize = Number(searchParams.get("page_size") ?? "20") || 20;

  const [search, setSearch] = useState(searchFromUrl);

  useEffect(() => {
    setSearch(searchFromUrl);
  }, [searchFromUrl]);

  function navigate(overrides: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
  }) {
    startTransition(() => {
      router.push(
        buildCustomersUrl({
          page: overrides.page ?? 1,
          page_size: overrides.page_size ?? pageSize,
          status: overrides.status !== undefined ? overrides.status : status,
          search:
            overrides.search !== undefined ? overrides.search : searchFromUrl,
        }),
      );
    });
  }

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({ search: search.trim(), page: 1 });
  }

  function onStatusChange(value: string) {
    navigate({
      status: value === "all" ? "" : value,
      page: 1,
      search: searchFromUrl,
    });
  }

  function onClear() {
    setSearch("");
    startTransition(() => {
      router.push("/customers");
    });
  }

  const hasFilters = Boolean(status || searchFromUrl);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <form
        onSubmit={onSearchSubmit}
        className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="customer-search">Search</Label>
          <Input
            id="customer-search"
            type="search"
            placeholder="Name, company, or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="w-full space-y-2 sm:w-44">
        <Label htmlFor="customer-status-filter">Status</Label>
        <Select value={status || "all"} onValueChange={onStatusChange}>
          <SelectTrigger id="customer-status-filter" className="w-full">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters ? (
        <Button type="button" variant="ghost" onClick={onClear}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}

export { buildCustomersUrl };
