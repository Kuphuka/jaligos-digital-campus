"use server";

import { findUserRole } from "@/lib/user-role";
import { createClient } from "@/lib/supabase/server";
import type { Result } from "@/lib/result";

export async function getSignedInRole(): Promise<Result<{ role: string; status: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return { ok: false, error: "Your session could not be verified. Please log in again." };
  }

  try {
    const roleRow = await findUserRole(user.id, user.email);
    if (!roleRow) {
      return { ok: false, error: "Your account has no role assigned yet. Please contact the administrator." };
    }

    return {
      ok: true,
      role: roleRow.role,
      status: roleRow.status ?? "active",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not verify your account role.",
    };
  }
}
