import { createClient } from './supabase/server';

export async function getCurrentUser() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const email = user.email.toLowerCase();
  
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('*')
    .eq('email', email)
    .single();

  return {
    user,
    role: roleData?.role || 'student',
    status: roleData?.status || 'active',
    profile: roleData,
    email: email, // Added for easy access
    fullName: roleData?.full_name || 'Student', // Added for easy access
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