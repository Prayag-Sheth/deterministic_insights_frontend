"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, LogOut, MessagesSquare, Users } from "lucide-react";

import { BrandMark } from "@/components/shared/brand-mark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/interactions", label: "Interactions", icon: MessagesSquare },
] as const;

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  // Warm primary routes so sidebar switches feel instant.
  useEffect(() => {
    for (const { href } of navItems) {
      void router.prefetch(href);
    }
  }, [router]);

  return (
    <>
      <div className="flex h-14 shrink-0 items-center px-4">
        <Link
          href="/dashboard"
          className="min-w-0"
          onClick={onNavigate}
        >
          <BrandMark size="sm" className="min-w-0 [&_span:last-child]:truncate" />
        </Link>
      </div>
      <nav
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3"
        aria-label="Main"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function SidebarUserSection() {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const logout = useLogout();
  const displayName = currentUser?.name ?? "User";
  const roleLabel = currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : null;

  return (
    <div className="shrink-0 space-y-2 p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 truncate">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {displayName}
          </p>
          {roleLabel ? (
            <p className="truncate text-xs text-muted-foreground capitalize">
              {roleLabel}
            </p>
          ) : null}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-muted-foreground"
        onClick={logout}
      >
        <LogOut className="size-4" aria-hidden />
        Log out
      </Button>
    </div>
  );
}

function SidebarPanel({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex h-full w-60 shrink-0 flex-col text-sidebar-foreground",
        className,
      )}
    >
      <SidebarNav onNavigate={onNavigate} />
      <SidebarUserSection />
    </aside>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop: inset-style sidebar on muted canvas (no hard grid border) */}
      <SidebarPanel className="hidden lg:flex" />

      {/* Mobile/tablet: overlay drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close navigation"
            onClick={onClose}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex h-full w-60 flex-col border-r border-border bg-background shadow-lg"
          >
            <SidebarNav onNavigate={onClose} />
            <SidebarUserSection />
          </aside>
        </div>
      ) : null}
    </>
  );
}
