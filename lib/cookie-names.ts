// Shared by the server data layer, the /session/clear route, and proxy.ts.
// Kept dependency-free so `proxy.ts` can import it without pulling `server-only`.
export const TOKEN_COOKIE = "wcp_token";
export const USER_COOKIE = "wcp_user";
