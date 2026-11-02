import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import StudentPortal, { type Material, type StudentCourse } from "@/components/StudentPortal";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const me = await requireRole(["student"]);
  if (!me) redirect("/login");

  const admin = createAdminClient();

  // Which courses is this student enrolled in?
  const [{ data: enrolments, error: enrollmentError }, { data: courseRows, error: courseError }] = await Promise.all([
    admin.from("enrollments").select("course_id").eq("student_email", me.email),
    admin.from("courses").select("id,title"),
  ]);
  if (enrollmentError) throw new Error(`Could not load your enrollments: ${enrollmentError.message}`);
  if (courseError) throw new Error(`Could not load courses: ${courseError.message}`);
  const myCourses = new Set((enrolments ?? []).map((e) => String(e.course_id)));
  const studentCourses: StudentCourse[] = (courseRows ?? [])
    .filter((course) => myCourses.has(String(course.id)))
    .map((course) => ({ id: String(course.id), title: course.title as string }));

  const { data: rows } = await admin
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false });

  // Show materials for the student's courses, plus any not tied to a course.
  const visible = (rows ?? []).filter((m) => m.course_id == null || myCourses.has(String(m.course_id)));

  // Turn "uploaded_by" (an email) into the lecturer's name.
  const emails = Array.from(new Set(visible.map((m) => m.uploaded_by).filter(Boolean))) as string[];
  const { data: people } = emails.length
    ? await admin.from("user_roles").select("email,full_name").in("email", emails)
    : { data: [] as { email: string; full_name: string | null }[] };
  const nameByEmail = new Map((people ?? []).map((p) => [p.email as string, p.full_name as string | null]));

  const materials: Material[] = visible.map((m) => ({
    id: String(m.id),
    title: m.title as string,
    file_url: m.file_url as string,
    uploaded_by_name: nameByEmail.get(m.uploaded_by) || m.uploaded_by || "Lecturer",
  }));

  const { data: resultRows, error: resultsError } = myCourses.size
    ? await admin
      .from("results")
      .select("id,course_id,mark,created_at")
      .eq("student_email", me.email)
      .eq("status", "released")
      .in("course_id", Array.from(myCourses))
      .order("created_at", { ascending: false })
    : { data: [], error: null };
  if (resultsError) throw new Error(`Could not load your results: ${resultsError.message}`);

  const courseNames = new Map((courseRows ?? []).map((course) => [String(course.id), course.title as string]));
  const studentResults = (resultRows ?? []).map((result) => ({
    id: String(result.id),
    course: courseNames.get(String(result.course_id)) ?? "Course",
    mark: Number(result.mark),
  }));

  return <StudentPortal profile={{ name: me.fullName, email: me.email }} courses={studentCourses} materials={materials} results={studentResults} />;
}
