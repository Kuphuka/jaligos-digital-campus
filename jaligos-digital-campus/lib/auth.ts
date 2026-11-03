import { createClient } from './supabase/server';
import { findUserRole } from './user-role';

export async function getCurrentUser() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const email = user.email.trim().toLowerCase();
  const roleData = await findUserRole(user.id, email);
  if (!roleData) return null;

  return {
    user,
    role: roleData.role,
    status: roleData.status || 'active',
    profile: roleData,
    email,
    fullName: roleData.full_name || 'Student',
  };
}

export async function requireRole(allowedRoles: string[]) {
  const session = await getCurrentUser();
  
  if (!session) {
    throw new Error("Unauthorized: No active session");
  }

  if (session.status === "suspended") {
    throw new Error("Your account is suspended. Please contact the administrator.");
  }

  if (!allowedRoles.includes(session.role)) {
    throw new Error(`Unauthorized: Requires one of roles: ${allowedRoles.join(', ')}`);
  }

  return session;
}