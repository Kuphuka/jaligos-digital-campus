"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeName } from "@/lib/data";
import type { Result } from "@/lib/result";

const SUBMISSION_EXT = /\.(pdf|docx?)$/i;

// Short-lived download link for a study material. Only files under materials/ can be signed here.
export async function getMaterialDownloadUrl(path: string): Promise<Result<{ url: string }>> {
  const me = await requireRole(["student", "lecturer", "admin"]);
  if (!me) return { ok: false, error: "Please log in again." };
  if (!path.startsWith("materials/") || path.includes("..")) return { ok: false, error: "Invalid file." };

  const { data, error } = await createAdminClient().storage.from("documents").createSignedUrl(path, 60);
  if (error || !data) return { ok: false, error: "Could not create the download link." };
  return { ok: true, url: data.signedUrl };
}

// Step 1 of an assignment upload: permission to upload straight to storage.
export async function prepareSubmissionUpload(
  fileName: string,
  courseId: string
): Promise<Result<{ path: string; token: string }>> {
  const me = await requireRole(["student"]);
  if (!me) return { ok: false, error: "Please log in again." };
  if (!SUBMISSION_EXT.test(fileName)) return { ok: false, error: "Please choose a PDF or Word file." };
  if (!courseId) return { ok: false, error: "Choose an enrolled course." };

  const admin = createAdminClient();
  const { data: enrollment, error: enrollmentError } = await admin
    .from("enrollments")
    .select("id")
    .eq("student_email", me.email)
    .eq("course_id", courseId)
    .maybeSingle();
  if (enrollmentError) return { ok: false, error: `Could not verify your enrollment: ${enrollmentError.message}` };
  if (!enrollment) return { ok: false, error: "You are not enrolled in that course." };

  const path = `assignments/${me.user.id}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeName(fileName)}`;
  const { data, error } = await admin.storage.from("documents").createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: "Could not prepare the upload." };
  return { ok: true, path, token: data.token };
}

// Step 2: record the uploaded file so lecturers can see it.
export async function recordSubmission(path: string, fileName: string, courseId: string): Promise<Result> {
  const me = await requireRole(["student"]);
  if (!me) return { ok: false, error: "Please log in again." };
  if (!path.startsWith(`assignments/${me.user.id}/`) || path.includes("..")) return { ok: false, error: "Invalid file." };
  if (!SUBMISSION_EXT.test(fileName) || !courseId) return { ok: false, error: "Choose a valid file and enrolled course." };

  const admin = createAdminClient();
  const { data: enrollment, error: enrollmentError } = await admin
    .from("enrollments")
    .select("id")
    .eq("student_email", me.email)
    .eq("course_id", courseId)
    .maybeSingle();
  if (enrollmentError) return { ok: false, error: `Could not verify your enrollment: ${enrollmentError.message}` };
  if (!enrollment) return { ok: false, error: "You are not enrolled in that course." };

  const { error } = await admin.from("submissions").insert({
    student_email: me.email,
    file_name: fileName,
    file_url: path,
    course_id: courseId,
  });
  if (error) {
    const { error: cleanupError } = await admin.storage.from("documents").remove([path]);
    if (cleanupError) {
      return {
        ok: false,
        error: `Could not record your submission (${error.message}), and its uploaded file could not be removed (${cleanupError.message}).`,
      };
    }
    return { ok: false, error: `Could not record your submission (${error.message}).` };
  }
  revalidatePath("/portal");
  revalidatePath("/staff");
  return { ok: true };
}
