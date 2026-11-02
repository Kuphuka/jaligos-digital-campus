import { createAdminClient } from "@/lib/supabase/admin";

export async function getStaffCourseIds(email: string): Promise<string[]> {
  const { data, error } = await createAdminClient()
    .from("staff_courses")
    .select("course_id")
    .eq("lecturer_email", email.toLowerCase());

  if (error) throw new Error(`Could not load assigned courses: ${error.message}`);
  return (data ?? []).map((assignment) => String(assignment.course_id));
}
