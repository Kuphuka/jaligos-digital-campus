import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminDashboard, { type PendingApplication } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const me = await requireRole(["admin"]);
  if (!me) redirect("/login");

  const admin = createAdminClient();
  const [
    { data: apps, error: appsError },
    { data: courses, error: coursesError },
    { data: pendingResults, error: resultsError },
    { data: lecturers, error: lecturersError },
    { data: assignments, error: assignmentsError },
  ] = await Promise.all([
    admin.from("applications").select("*").eq("status", "pending").order("created_at", { ascending: false }),
    admin.from("courses").select("id,title"),
    admin.from("results").select("id,student_email,course_id,mark,status").eq("status", "pending_release").order("created_at", { ascending: false }),
    admin.from("user_roles").select("email,full_name,status").eq("role", "lecturer").order("full_name"),
    admin.from("staff_courses").select("lecturer_email,course_id"),
  ]);
  if (appsError) throw new Error(`Could not load applications: ${appsError.message}`);
  if (coursesError) throw new Error(`Could not load courses: ${coursesError.message}`);
  if (resultsError) throw new Error(`Could not load pending results: ${resultsError.message}`);
  if (lecturersError) throw new Error(`Could not load lecturers: ${lecturersError.message}`);
  if (assignmentsError) throw new Error(`Could not load staff course assignments: ${assignmentsError.message}`);
  const courseRows = (courses ?? []).map((course) => ({ id: String(course.id), title: course.title as string }));
  const courseTitle = new Map(courseRows.map((course) => [course.id, course.title]));

  // Documents are private: create short-lived signed links (1 hour).
  const sign = async (value?: string | null) => {
    if (!value) return null;
    if (value.startsWith("http")) return value;
    const { data } = await admin.storage.from("documents").createSignedUrl(value, 3600);
    return data?.signedUrl ?? null;
  };

  const applications: PendingApplication[] = await Promise.all(
    (apps ?? []).map(async (a) => ({
      id: String(a.id),
      created_at: (a.created_at as string | null) ?? null,
      first_name: a.first_name as string,
      surname: a.surname as string,
      email: a.email as string,
      course: courseTitle.get(String(a.course_id)) ?? "Unknown course",
      branch: a.branch as string,
      idUrl: await sign(a.id_document_url),
      qualUrl: await sign(a.qualification_url),
    }))
  );

  const results = (pendingResults ?? []).map((result) => ({
    id: String(result.id),
    student_email: result.student_email as string,
    course: courseTitle.get(String(result.course_id)) ?? "Unknown course",
    mark: Number(result.mark),
  }));
  const staff = (lecturers ?? []).map((lecturer) => {
    const assignedCourseIds = (assignments ?? [])
      .filter((assignment) => assignment.lecturer_email.toLowerCase() === lecturer.email.toLowerCase())
      .map((assignment) => String(assignment.course_id));
    return {
      name: (lecturer.full_name as string | null) ?? "Lecturer",
      email: lecturer.email as string,
      status: (lecturer.status as string | null) ?? "active",
      courses: assignedCourseIds.map((id) => courseTitle.get(id) ?? "Unknown course"),
    };
  });

  return (
    <AdminDashboard
      profile={{ name: me.fullName, email: me.email }}
      applications={applications}
      pendingResults={results}
      courses={courseRows}
      staff={staff}
    />
  );
}
