export type Role = "admin" | "lecturer" | "student";

// Where each role lands after logging in.
export function homeFor(role?: string | null) {
  if (role === "admin") return "/admin";
  if (role === "lecturer") return "/staff";
  if (role === "student") return "/portal";
  return "/login";
}
