"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getStaffCourseIds } from "@/lib/staff";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeName } from "@/lib/data";
import type { Result } from "@/lib/result";

// Step 1 of a material upload: permission to upload straight to storage.
export async function prepareMaterialUpload(
  fileName: string
): Promise<Result<{ path: string; token: string }>> {
  const me = await requireRole(["admin", "lecturer"]);
  if (!me) return { ok: false, error: "Please log in again." };

  const path = `materials/${randomUUID()}-${safeName(fileName)}`;
  const { data, error } = await createAdminClient().storage.from("documents").createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: "Could not prepare the upload." };
  return { ok: true, path, token: data.token };
}

// Step 2: save the link in the materials table.
export async function saveMaterial(input: {
  title: string;
  path: string;
  courseId: string | null;
}): Promise<Result> {
  const me = await requireRole(["admin", "lecturer"]);
  if (!me) return { ok: false, error: "Please log in again." };

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Enter a title." };
  if (!input.path.startsWith("materials/") || input.path.includes("..")) {
    return { ok: false, error: "Invalid file." };
  }
  if (me.role === "lecturer") {
    if (!input.courseId || !(await getStaffCourseIds(me.email)).includes(input.courseId)) {
      return { ok: false, error: "You can only add materials to your assigned courses." };
    }
  }

  const admin = createAdminClient();
  const { error } = await admin.from("materials").insert({
    title,
    file_url: input.path,
    course_id: input.courseId || null,
    uploaded_by: me.email,
  });
  if (error) {
    await admin.storage.from("documents").remove([input.path]);
    return { ok: false, error: `Could not save the material (${error.message}).` };
  }

  revalidatePath("/staff");
  return { ok: true };
}

export async function deleteMaterial(id: string): Promise<Result> {
  const me = await requireRole(["admin", "lecturer"]);
  if (!me) return { ok: false, error: "Please log in again." };

  const admin = createAdminClient();
  const { data: row, error: lookupError } = await admin.from("materials").select("file_url,course_id").eq("id", id).maybeSingle();
  if (lookupError) return { ok: false, error: `Could not check the material: ${lookupError.message}` };
  if (!row) return { ok: false, error: "Material not found." };
  if (
    me.role === "lecturer" &&
    (row.course_id == null || !(await getStaffCourseIds(me.email)).includes(String(row.course_id)))
  ) {
    return { ok: false, error: "You can only delete materials for your assigned courses." };
  }
  if (row?.file_url && String(row.file_url).startsWith("materials/")) {
    await admin.storage.from("documents").remove([row.file_url]);
  }
  const { error } = await admin.from("materials").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/staff");
  return { ok: true };
}

// Download link for a student's submitted assignment. Only files under submissions/ can be signed here.
export async function getSubmissionDownloadUrl(path: string): Promise<Result<{ url: string }>> {
  const me = await requireRole(["admin", "lecturer"]);
  if (!me) return { ok: false, error: "Please log in again." };
  if ((!path.startsWith("assignments/") && !path.startsWith("submissions/")) || path.includes("..")) {
    return { ok: false, error: "Invalid file." };
  }

  const admin = createAdminClient();
  const { data: submission, error: submissionError } = await admin
    .from("submissions")
    .select("course_id")
    .eq("file_url", path)
    .maybeSingle();
  if (submissionError) return { ok: false, error: `Could not verify the submission: ${submissionError.message}` };
  if (!submission) return { ok: false, error: "Submission not found." };
  if (me.role === "lecturer" && !(await getStaffCourseIds(me.email)).includes(String(submission.course_id))) {
    return { ok: false, error: "You are not assigned to this submission's course." };
  }

  const { data, error } = await admin.storage.from("documents").createSignedUrl(path, 60);
  if (error || !data) return { ok: false, error: "Could not create the download link." };
  return { ok: true, url: data.signedUrl };
}

export async function submitMark(input: {
  studentEmail: string;
  courseId: string;
  mark: number;
}): Promise<Result> {
  const me = await requireRole(["admin", "lecturer"]);

  const studentEmail = input.studentEmail.trim().toLowerCase();
  if (!studentEmail || !input.courseId || !Number.isFinite(input.mark) || input.mark < 0 || input.mark > 100) {
    return { ok: false, error: "Enter a valid student, course, and mark between 0 and 100." };
  }

  const admin = createAdminClient();
  if (me.role === "lecturer" && !(await getStaffCourseIds(me.email)).includes(input.courseId)) {
    return { ok: false, error: "You can only submit marks for your assigned courses." };
  }
  const { data: enrollment, error: enrollmentError } = await admin
    .from("enrollments")
    .select("id")
    .eq("student_email", studentEmail)
    .eq("course_id", input.courseId)
    .maybeSingle();
  if (enrollmentError) return { ok: false, error: `Could not verify enrollment: ${enrollmentError.message}` };
  if (!enrollment) return { ok: false, error: "The student is not enrolled in this course." };

  const { data: currentResult, error: resultLookupError } = await admin
    .from("results")
    .select("status")
    .eq("student_email", studentEmail)
    .eq("course_id", input.courseId)
    .maybeSingle();
  if (resultLookupError) return { ok: false, error: `Could not check the existing mark: ${resultLookupError.message}` };
  if (currentResult?.status === "released") {
    return { ok: false, error: "This mark has already been released and cannot be changed." };
  }

  const { error } = await admin.from("results").upsert(
    {
      student_email: studentEmail,
      course_id: input.courseId,
      mark: input.mark,
      status: "pending_release",
    },
    { onConflict: "student_email,course_id" }
  );
  if (error) return { ok: false, error: `Could not submit the mark: ${error.message}` };

  revalidatePath("/staff");
  revalidatePath("/admin");
  return { ok: true };
}
