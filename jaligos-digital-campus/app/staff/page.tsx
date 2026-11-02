import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getStaffCourseIds } from "@/lib/staff";
import { createAdminClient } from "@/lib/supabase/admin";
import StaffPortal, {
  type CourseRow,
  type MaterialRow,
  type ResultRow,
  type StudentRow,
  type SubmissionRow,
} from "@/components/StaffPortal";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.status === "suspended") redirect("/login?error=suspended");
  if (!["admin", "lecturer"].includes(me.role)) redirect("/login?error=unauthorized");

  const isAdmin = me.role === "admin";
  const assignedCourseIds = isAdmin ? null : await getStaffCourseIds(me.email);
  const admin = createAdminClient();
  const [enrolments, courses, materials, submissions, results] = await Promise.all([
    admin.from("enrollments").select("*").order("created_at", { ascending: false }),
    admin.from("courses").select("id,title").order("title"),
    admin.from("materials").select("*").order("created_at", { ascending: false }),
    admin.from("submissions").select("*").order("created_at", { ascending: false }).limit(100),
    admin.from("results").select("student_email,course_id,mark,status").order("created_at", { ascending: false }),
  ]);
  if (results.error) throw new Error(`Could not load student results: ${results.error.message}`);
  if (submissions.error) throw new Error(`Could not load student submissions: ${submissions.error.message}`);

  const courseRows: CourseRow[] = (courses.data ?? [])
    .filter((course) => isAdmin || assignedCourseIds?.includes(String(course.id)))
    .map((c) => ({ id: String(c.id), title: c.title as string }));
  const titleById = new Map(courseRows.map((c) => [c.id, c.title]));

  const visibleEnrollments = (enrolments.data ?? []).filter((enrollment) =>
    isAdmin || assignedCourseIds?.includes(String(enrollment.course_id))
  );
  const students: StudentRow[] = visibleEnrollments.map((e) => ({
    id: String(e.id),
    email: e.student_email as string,
    courseId: String(e.course_id),
    course: titleById.get(String(e.course_id)) ?? "",
    branch: (e.branch as string | null) ?? "",
    status: (e.status as string | null) ?? "Active",
  }));

  const visibleMaterials = (materials.data ?? []).filter((material) =>
    isAdmin || (material.course_id != null && assignedCourseIds?.includes(String(material.course_id)))
  );
  const materialRows: MaterialRow[] = visibleMaterials.map((m) => ({
    id: String(m.id),
    title: m.title as string,
    created_at: (m.created_at as string | null) ?? null,
    course: m.course_id == null ? "All courses" : titleById.get(String(m.course_id)) ?? "",
  }));

  const visibleSubmissions = (submissions.data ?? []).filter((submission) =>
    isAdmin || assignedCourseIds?.includes(String(submission.course_id))
  );
  const submissionRows: SubmissionRow[] = visibleSubmissions.map((s) => ({
    id: String(s.id),
    student_email: s.student_email as string,
    courseId: String(s.course_id),
    file_name: s.file_name as string,
    file_url: s.file_url as string,
    created_at: (s.created_at as string | null) ?? null,
  }));
  const visibleResults = (results.data ?? []).filter((result) =>
    isAdmin || assignedCourseIds?.includes(String(result.course_id))
  );
  const resultRows: ResultRow[] = visibleResults.map((r) => ({
    student_email: r.student_email as string,
    course_id: String(r.course_id),
    mark: Number(r.mark),
    status: r.status as string,
  }));

  return (
    <StaffPortal
      profile={{ name: me.fullName, email: me.email, role: me.role }}
      courses={courseRows}
      students={students}
      materials={materialRows}
      submissions={submissionRows}
      results={resultRows}
    />
  );
}
