import { createAdminClient } from "@/lib/supabase/admin";

export async function findUserRole(userId: string, email: string) {
  const admin = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  const columns = "id,email,role,status,full_name";

  const { data: idMatch, error: idError } = await admin
    .from("user_roles")
    .select(columns)
    .eq("id", userId)
    .maybeSingle();
  if (idError) throw new Error(`Could not check your account role: ${idError.message}`);
  if (idMatch?.email?.toLowerCase() === normalizedEmail) return idMatch;

  const { data: emailMatch, error: emailError } = await admin
    .from("user_roles")
    .select(columns)
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (emailError) throw new Error(`Could not check your account role: ${emailError.message}`);
  if (emailMatch) return emailMatch;

  const escapedEmail = normalizedEmail.replace(/[\\%_]/g, "\\$&");
  const { data: caseInsensitiveMatch, error: caseInsensitiveError } = await admin
    .from("user_roles")
    .select(columns)
    .ilike("email", escapedEmail)
    .maybeSingle();
  if (caseInsensitiveError) {
    throw new Error(`Could not check your account role: ${caseInsensitiveError.message}`);
  }

  return caseInsensitiveMatch;
}
