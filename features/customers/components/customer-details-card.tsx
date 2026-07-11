"use client";

import { format } from "date-fns";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerStatusBadge } from "@/features/customers/components/customer-status-badge";
import { ReassignCustomerOwnerDialog } from "@/features/customers/components/reassign-customer-owner-dialog";
import { resolveOwnerDisplay } from "@/features/customers/utils/format-owner-label";
import { useUsersList } from "@/features/users/hooks/use-users-list";
import { useAppSelector } from "@/store/hooks";
import type { Customer } from "@/types/customer";

interface CustomerDetailsCardProps {
  customer: Customer;
}

const USERS_LIST_PARAMS = { page: 1, page_size: 100 } as const;

export function CustomerDetailsCard({ customer }: CustomerDetailsCardProps) {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const isAdmin = currentUser?.role === "admin";
  const [reassignOpen, setReassignOpen] = useState(false);

  const {
    data: usersData,
    isPending: usersPending,
    isFetching: usersFetching,
  } = useUsersList(USERS_LIST_PARAMS, {
    enabled: isAdmin,
  });

  const ownersLoading = isAdmin && (usersPending || (usersFetching && !usersData));

  const ownerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of usersData?.items ?? []) {
      map.set(user.id, user.name);
    }
    return map;
  }, [usersData?.items]);

  const fields: { label: string; value: ReactNode }[] = [
    { label: "Name", value: customer.name },
    { label: "Company", value: customer.company },
    { label: "Email", value: customer.email },
    { label: "Phone", value: customer.phone || "—" },
    {
      label: "Status",
      value: <CustomerStatusBadge status={customer.status} />,
    },
  ];

  if (isAdmin) {
    const ownerDisplay = resolveOwnerDisplay(
      customer.owner_id,
      currentUser?.id,
      ownerNameById,
      ownersLoading,
    );
    fields.push({
      label: "Owner",
      value: (
        <div className="space-y-2">
          <p>
            {ownerDisplay.status === "loading" ? (
              <Skeleton className="inline-block h-4 w-28 align-middle" />
            ) : (
              ownerDisplay.label
            )}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setReassignOpen(true)}
          >
            Reassign owner
          </Button>
        </div>
      ),
    });
  }

  fields.push(
    {
      label: "Created",
      value: format(new Date(customer.created_at), "PPp"),
    },
    {
      label: "Updated",
      value: format(new Date(customer.updated_at), "PPp"),
    },
  );

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="space-y-1">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {field.label}
              </dt>
              <dd className="text-sm text-foreground break-words">
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {isAdmin ? (
        <ReassignCustomerOwnerDialog
          customer={customer}
          open={reassignOpen}
          onOpenChange={setReassignOpen}
        />
      ) : null}
    </>
  );
}
