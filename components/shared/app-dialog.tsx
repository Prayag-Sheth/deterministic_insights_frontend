"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface AppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Confirmation / form footer actions. Parent owns submit behavior. */
  footer?: ReactNode;
  /** Convenience confirm button — ignored when `footer` is provided. */
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  confirmVariant?: "default" | "destructive";
  isConfirmLoading?: boolean;
  className?: string;
}

/**
 * Controlled dialog wrapper for confirmation and form dialogs.
 * Parent owns open state, submit behavior, and business logic.
 */
export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  confirmVariant = "default",
  isConfirmLoading = false,
  className,
}: AppDialogProps) {
  const defaultFooter = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isConfirmLoading}
      >
        {cancelLabel}
      </Button>
      {onConfirm ? (
        <Button
          type="button"
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={isConfirmLoading}
        >
          {isConfirmLoading ? "Please wait…" : confirmLabel}
        </Button>
      ) : null}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {children ? <div className="py-2">{children}</div> : null}
        <DialogFooter>{footer ?? defaultFooter}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
