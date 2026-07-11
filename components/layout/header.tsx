"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/customers": "Customers",
  "/interactions": "Interactions",
};

function resolvePageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname];
  }
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(`${path}/`)) {
      return title;
    }
  }
  return "Deterministic Insights";
}

type HeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = resolvePageTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={sidebarOpen}
        onClick={onToggleSidebar}
      >
        {sidebarOpen ? (
          <X className="size-5" aria-hidden />
        ) : (
          <Menu className="size-5" aria-hidden />
        )}
      </Button>
      <p className="truncate text-sm font-medium text-muted-foreground">
        {pageTitle}
      </p>
    </header>
  );
}
