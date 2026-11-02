"use server";

import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { branches, safeName } from "@/lib/data";
import type { Result } from "@/lib/result";

const DOC_EXT = /\.(pdf|jpe?g|png)$/i;
const PATH_OK = /^applications\/[0-9a-f-]{36}\/[A-Za-z0-9._-]+$/;

// Step 1: the browser asks for permission to upload two files straight to storage
// (files go directly to Supabase, so they are not limited by Vercel's request size).
export async function prepareApplicationUploads(
  idName: string,
  qualName: string
): Promise<
  Result<{ idPath: string; idToken: string; qualPath: string; qualToken: string }>
> {
  if (!DOC_EXT.test(idName) || !DOC_EXT.test(qualName)) {
    return { ok: false, error: "Documents must be PDF, JPG or PNG files." };
  }

  const folder = `applications/${randomUUID()}`;
  const idPath = `${folder}/id-${safeName(idName)}`;
  const qualPath = `${folder}/qualification-${safeName(qualName)}`;

  const bucket = createAdminClient().storage.from("documents");
  const [a, b] = await Promise.all([
    bucket.createSignedUploadUrl(idPath),
    bucket.createSignedUploadUrl(qualPath),
  ]);
  if (a.error || b.error || !a.data || !b.data) {
    return { ok: false, error: "Could not prepare the upload. Please try again." };
  }

  return { ok: true, idPath, idToken: a.data.token, qualPath, qualToken: b.data.token };
}

type ApplicationInput = {
  firstName: string;
  surname: string;
  idNumber: string;
  phone: string;
  email: string;
  courseId: string;
  branch: string;
  idPath: string;
  qualPath: string;
};

// Step 2: after the files are uploaded, save the application.
export async function submitApplication(input: ApplicationInput): Promise<Result> {
  const firstName = input.firstName.trim();
  const surname = input.surname.trim();
  const idNumber = input.idNumber.trim();
  const phone = input.phone.trim();
  const email = input.email.trim().toLowerCase();

  if (!firstName || !surname || !phone) return { ok: false, error: "Please fill in all fields." };
  if (!/^\d{13}$/.test(idNumber)) return { ok: false, error: "Your ID number must be 13 digits." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (!branches.includes(input.branch)) return { ok: false, error: "Choose a branch." };
  if (!PATH_OK.test(input.idPath) || !PATH_OK.test(input.qualPath)) {
    return { ok: false, error: "Invalid document upload." };
  }

  const admin = createAdminClient();

  const { data: course } = await admin
    .from("courses")
    .select("id")
    .eq("id", input.courseId)
    .maybeSingle();
  if (!course) return { ok: false, error: "Choose a course." };

  const { error } = await admin.from("applications").insert({
    first_name: firstName,
    surname,
    id_number: idNumber,
    phone,
    email,
    course_id: input.courseId,
    branch: input.branch,
    id_document_url: input.idPath,
    qualification_url: input.qualPath,
    status: "pending",
  });
  if (error) return { ok: false, error: `We could not save your application (${error.message}).` };

  return { ok: true };
}
