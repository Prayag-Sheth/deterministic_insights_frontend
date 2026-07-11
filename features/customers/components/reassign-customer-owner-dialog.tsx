"use client";

import { useEffect, useState } from "react";

import { AppDialog } from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useReassignCustomerOwner } from "@/features/customers/hooks/use-reassign-customer-owner";
import { useUsersList } from "@/features/users/hooks/use-users-list";
import type { Customer } from "@/types/customer";

interface ReassignCustomerOwnerDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const USERS_LIST_PARAMS = { page: 1, page_size: 100 } as const;

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

export function ReassignCustomerOwnerDialog({
  customer,
  open,
  onOpenChange,
}: ReassignCustomerOwnerDialogProps) {
  const [ownerId, setOwnerId] = useState("");
  const reassignOwner = useReassignCustomerOwner(customer?.id ?? "");

  const { data: usersData, isLoading: usersLoading } = useUsersList(
    USERS_LIST_PARAMS,
    { enabled: open },
  );

  useEffect(() => {
    if (open && customer) {
      setOwnerId(customer.owner_id);
    }
  }, [open, customer]);

  async function onConfirm() {
    if (!customer || !ownerId || ownerId === customer.owner_id) {
      return;
    }

    try {
      await reassignOwner.mutateAsync(ownerId);
      onOpenChange(false);
    } catch {
      // Error toast is handled in the mutation hook.
    }
  }

  const users = usersData?.items ?? [];
  const isUnchanged = Boolean(customer && ownerId === customer.owner_id);
  const canSubmit =
    Boolean(customer && ownerId) &&
    !usersLoading &&
    !reassignOwner.isPending &&
    !isUnchanged;

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reassign owner"
      description={
        customer
          ? `Choose a new owner for ${customer.name}.`
          : "Choose a new owner for this customer."
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={reassignOwner.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void onConfirm()}
            disabled={!canSubmit}
          >
            {reassignOwner.isPending ? "Please wait…" : "Reassign"}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="reassign-owner">Owner</Label>
        <select
          id="reassign-owner"
          aria-label="Owner"
          className={selectClassName}
          value={ownerId}
          disabled={usersLoading || reassignOwner.isPending || !customer}
          onChange={(event) => setOwnerId(event.target.value)}
        >
          <option value="">
            {usersLoading ? "Loading users…" : "Select an owner"}
          </option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
        {isUnchanged ? (
          <p className="text-xs text-muted-foreground">
            Select a different user to reassign ownership.
          </p>
        ) : null}
      </div>
    </AppDialog>
  );
}
