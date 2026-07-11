/**
 * Display label for a customer owner.
 * Never surfaces raw or truncated UUIDs in the UI.
 */
export type OwnerDisplay =
  | { status: "ready"; label: string }
  | { status: "loading" };

export function resolveOwnerDisplay(
  ownerId: string,
  currentUserId: string | undefined,
  ownerNameById: ReadonlyMap<string, string> | undefined,
  ownersLoading = false,
): OwnerDisplay {
  if (currentUserId && ownerId === currentUserId) {
    return { status: "ready", label: "You" };
  }
  const name = ownerNameById?.get(ownerId)?.trim();
  if (name) {
    return { status: "ready", label: name };
  }
  if (ownersLoading) {
    return { status: "loading" };
  }
  return { status: "ready", label: "Unknown" };
}

/**
 * Plain-string helper for non-cell contexts that already await users.
 * Prefer `resolveOwnerDisplay` when loading state matters.
 */
export function formatOwnerLabel(
  ownerId: string,
  currentUserId: string | undefined,
  ownerNameById?: ReadonlyMap<string, string>,
  ownersLoading = false,
): string {
  const display = resolveOwnerDisplay(
    ownerId,
    currentUserId,
    ownerNameById,
    ownersLoading,
  );
  return display.status === "loading" ? "Loading…" : display.label;
}
