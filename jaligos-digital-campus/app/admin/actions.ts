"use server";

import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Result } from "@/lib/result";

const DOMAIN = process.env.SCHOOL_EMAIL_DOMAIN || "jaligos.co.za";
type Admin = ReturnType<typeof createAdminClient>;

// "Thabo" -> "thabo", "O'Brien" -> "obrien"
const clean = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

function tempPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let p = "";
  for (let i = 0; i < 10; i++) p += chars[randomInt(chars.length)];
  return `${p}#${randomInt(10, 100)}`;
}

// Creates the login. If firstname.surname@domain is taken, tries firstname.surname2, 3, ...
async function createAccount(admin: Admin, base: string, fullName: string) {
  const password = tempPassword();
  for (let n = 0; n < 20; n++) {
    const email = `${base}${n === 0 ? "" : n + 1}@${DOMAIN}`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (!error && data.user) return { email, password, userId: data.user.id };
    if (!/already|registered|exists/i.test(error?.message ?? "")) {
      throw new Error(error?.message ?? "Could not create the account.");
    }
  }
  throw new Error("Could not find a free school email address.");
}

// Works whether user_roles.id is the auth user id or an auto-generated id.
async function insertRole(
  admin: Admin,
  userId: string,
  row: { email: string; role: string; full_name: string }
) {
  const first = await admin.from("user_roles").insert({ id: userId, ...row });
  if (!first.error) return null;
  const second = await admin.from("user_roles").insert(row);
  return second.error ? second.error.message : null;
}

async function rollback(admin: Admin, userId: string, email: string) {
  await admin.from("user_roles").delete().eq("email", email);
  await admin.auth.admin.deleteUser(userId);
}

export async function approveApplication(
  applicationId: string
): Promise<Result<{ schoolEmail: string; password: string; name: string }>> {
  const me = await requireRole(["admin"]);
  if (!me) return { ok: false, error: "Not allowed." };

  const admin = createAdminClient();
  const { data: app } = await admin.from("applications").select("*").eq("id", applicationId).maybeSingle();
  if (!app) return { ok: false, error: "Application not found." };
  if (app.status !== "pending") return { ok: false, error: "This application was already processed." };

  const fullName = `${app.first_name} ${app.surname}`;
  const base = `${clean(app.first_name)}.${clean(app.surname)}`;
  if (base.length < 3) return { ok: false, error: "The applicant's name is not valid for an email address." };

  try {
    const acc = await createAccount(admin, base, fullName);

    const roleError = await insertRole(admin, acc.userId, { email: acc.email, role: "student", full_name: fullName });
    if (roleError) {
      await rollback(admin, acc.userId, acc.email);
      return { ok: false, error: `Could not save the student role: ${roleError}` };
    }

    const { error: enrolError } = await admin.from("enrollments").insert({
      student_email: acc.email,
      course_id: app.course_id,
      branch: app.branch,
      status: "Active",
    });
    if (enrolError) {
      await rollback(admin, acc.userId, acc.email);
      return { ok: false, error: `Could not save the enrollment: ${enrolError.message}` };
    }

    const { error: statusError } = await admin.from("applications").update({ status: "approved" }).eq("id", app.id);
    if (statusError) {
      return { ok: false, error: `Account created (${acc.email}) but the application status was not updated: ${statusError.message}` };
    }

    revalidatePath("/admin");
    return { ok: true, schoolEmail: acc.email, password: acc.password, name: fullName };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function rejectApplication(applicationId: string): Promise<Result> {
  const me = await requireRole(["admin"]);
  if (!me) return { ok: false, error: "Not allowed." };

  const { error } = await createAdminClient()
    .from("applications")
    .update({ status: "rejected" })
    .eq("id", applicationId)
    .eq("status", "pending");
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}

export async function releaseResult(resultId: string): Promise<Result> {
  await requireRole(["admin"]);
  const { data, error } = await createAdminClient()
    .from("results")
    .update({ status: "released" })
    .eq("id", resultId)
    .eq("status", "pending_release")
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: `Could not release the result: ${error.message}` };
  if (!data) return { ok: false, error: "This result was already released or no longer exists." };

  revalidatePath("/admin");
  revalidatePath("/portal");
  return { ok: true };
}

export async function createLecturer(
  fullName: string,
  courseId: string
): Promise<Result<{ schoolEmail: string; password: string; name: string }>> {
  const me = await requireRole(["admin"]);
  if (!me) return { ok: false, error: "Not allowed." };

  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return { ok: false, error: "Enter the first name and surname." };
  const name = parts.join(" ");
  const base = `${clean(parts[0])}.${clean(parts[parts.length - 1])}`;
  if (base.length < 3) return { ok: false, error: "That name is not valid for an email address." };
  if (!courseId) return { ok: false, error: "Select a course for this lecturer." };

  const admin = createAdminClient();
  try {
    const { data: course, error: courseError } = await admin.from("courses").select("id").eq("id", courseId).maybeSingle();
    if (courseError) return { ok: false, error: `Could not verify the selected course: ${courseError.message}` };
    if (!course) return { ok: false, error: "The selected course does not exist." };

    const acc = await createAccount(admin, base, name);
    const roleError = await insertRole(admin, acc.userId, { email: acc.email, role: "lecturer", full_name: name });
    if (roleError) {
      await rollback(admin, acc.userId, acc.email);
      return { ok: false, error: `Could not save the lecturer role: ${roleError}` };
    }
    const { error: assignmentError } = await admin.from("staff_courses").insert({
      lecturer_email: acc.email,
      course_id: courseId,
    });
    if (assignmentError) {
      await rollback(admin, acc.userId, acc.email);
      return { ok: false, error: `Could not assign the lecturer to the course: ${assignmentError.message}` };
    }

    revalidatePath("/admin");
    revalidatePath("/staff");
    return { ok: true, schoolEmail: acc.email, password: acc.password, name };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function createAdmin(
  fullName: string
): Promise<Result<{ schoolEmail: string; password: string; name: string }>> {
  await requireRole(["admin"]);

  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return { ok: false, error: "Enter the first name and surname." };
  const name = parts.join(" ");
  const base = `${clean(parts[0])}.${clean(parts[parts.length - 1])}`;
  if (base.length < 3) return { ok: false, error: "That name is not valid for an email address." };

  const admin = createAdminClient();
  try {
    const acc = await createAccount(admin, base, name);
    const roleError = await insertRole(admin, acc.userId, {
      email: acc.email,
      role: "admin",
      full_name: name,
    });
    if (roleError) {
      await rollback(admin, acc.userId, acc.email);
      return { ok: false, error: `Could not save the admin role: ${roleError}` };
    }

    revalidatePath("/admin");
    return { ok: true, schoolEmail: acc.email, password: acc.password, name };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not create admin." };
  }
}

export async function setLecturerStatus(
  email: string,
  status: "active" | "suspended"
): Promise<Result> {
  await requireRole(["admin"]);
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return { ok: false, error: "Lecturer email is required." };

  const { data, error } = await createAdminClient()
    .from("user_roles")
    .update({ status })
    .eq("email", normalizedEmail)
    .eq("role", "lecturer")
    .select("email")
    .maybeSingle();
  if (error) return { ok: false, error: `Could not update lecturer status: ${error.message}` };
  if (!data) return { ok: false, error: "Lecturer account was not found." };

  revalidatePath("/admin");
  revalidatePath("/staff");
  return { ok: true };
}
