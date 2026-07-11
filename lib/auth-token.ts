/**
 * Auth token provider — Axios reads the token from here.
 * Redux must not be imported by Axios; Phase 2 will sync the store
 * into this provider via setAccessToken / clearAccessToken.
 */

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}
