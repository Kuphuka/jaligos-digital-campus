"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Trash2 } from "lucide-react";
import PortalShell from "@/components/PortalShell";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/data";
import {
  deleteMaterial,
  getSubmissionDownloadUrl,
  prepareMaterialUpload,
  saveMaterial,
  submitMark,
} from "@/app/staff/actions";

export type CourseRow = { id: string; title: string };
export type StudentRow = { id: string; email: string; courseId: string; course: string; branch: string; status: string };
export type MaterialRow = { id: string; title: string; created_at: string | null; course: string };
export type SubmissionRow = { id: string; student_email: string; courseId: string; file_name: string; file_url: string; created_at: string | null };
export type ResultRow = { student_email: string; course_id: string; mark: number; status: string };

const field =
  "w-full rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-gold/50";

export default function StaffPortal({
  profile,
  courses,
  students,
  materials,
  submissions,
  results,
}: {
  profile: { name: string; email: string; role: string };
  courses: CourseRow[];
  students: StudentRow[];
  materials: MaterialRow[];
  submissions: SubmissionRow[];
  results: ResultRow[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [submittingMark, setSubmittingMark] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [markMessage, setMarkMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);

  function resultFor(studentEmail: string, courseId: string) {
    return results.find((result) => result.student_email.toLowerCase() === studentEmail.toLowerCase() && result.course_id === courseId);
  }

  async function saveMark(studentEmail: string, studentCourseId: string) {
    const key = `${studentEmail}-${studentCourseId}`;
    const student = students.find((item) => item.email.toLowerCase() === studentEmail.toLowerCase() && item.courseId === studentCourseId);
    if (!student) {
      setMarkMessage({ type: "error", text: "The student is not enrolled in the selected course." });
      return;
    }
    const rawMark = marks[key] ?? String(resultFor(student.email, student.courseId)?.mark ?? "");
    const mark = Number(rawMark);
    if (rawMark.trim() === "" || !Number.isFinite(mark) || mark < 0 || mark > 100) {
      setMarkMessage({ type: "error", text: "Enter a mark between 0 and 100." });
      return;
    }

    setSubmittingMark(key);
    setMarkMessage(null);
    try {
      const saved = await submitMark({ studentEmail, courseId: studentCourseId, mark });
      if (!saved.ok) {
        setMarkMessage({ type: "error", text: saved.error });
        return;
      }
      setMarkMessage({ type: "ok", text: `Mark submitted to the office for ${studentEmail}.` });
      router.refresh();
    } catch (error) {
      setMarkMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not submit the mark.",
      });
    } finally {
      setSubmittingMark(null);
    }
  }

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;
    const form = e.currentTarget;
    setUploading(true);
    setMessage(null);

    try {
      const prep = await prepareMaterialUpload(file.name);
      if (!prep.ok) throw new Error(prep.error);

      const { error: upError } = await createClient()
        .storage.from("documents")
        .uploadToSignedUrl(prep.path, prep.token, file, { contentType: file.type || undefined });
      if (upError) throw new Error("Upload failed. Please try again.");

      const saved = await saveMaterial({ title, path: prep.path, courseId: courseId || null });
      if (!saved.ok) throw new Error(saved.error);

      form.reset();
      setTitle("");
      setCourseId("");
      setFile(null);
      setMessage({ type: "ok", text: "Material uploaded. Students can now download it." });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setUploading(false);
    }
  }

  async function remove(m: MaterialRow) {
    if (!window.confirm(`Delete "${m.title}"?`)) return;
    const res = await deleteMaterial(m.id);
    if (!res.ok) return setMessage({ type: "error", text: res.error });
    router.refresh();
  }

  async function downloadSubmission(path: string) {
    const downloadWindow = window.open("about:blank", "_blank");
    if (!downloadWindow) {
      setSubmissionMessage("Your browser blocked the download window. Allow pop-ups and try again.");
      return;
    }
    downloadWindow.opener = null;
    try {
      const res = await getSubmissionDownloadUrl(path);
      if (!res.ok) {
        downloadWindow.close();
        setSubmissionMessage(res.error);
        return;
      }
      downloadWindow.location.href = res.url;
    } catch (error) {
      downloadWindow.close();
      setSubmissionMessage(error instanceof Error ? error.message : "Could not create the download link.");
    }
  }

  const courseStudents = students.filter((student) => student.courseId === selectedCourseId);
  const courseSubmissions = submissions.filter((submission) => submission.courseId === selectedCourseId);

  return (
    <PortalShell
      title="Staff & Lecturer Portal"
      subtitle="Manage students and course materials"
      profile={profile}
    >
      <section className="rounded-xl bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-serif text-xl text-navy">Submit Marks to Office</h2>
          <p className="mt-1 text-sm text-slate-500">Marks are held for review until an administrator releases them.</p>
          <label className="mt-4 block max-w-md text-sm font-semibold text-navy">
            Course
            <select
              value={selectedCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
              className={`${field} mt-1`}
            >
              <option value="">Select a course</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </label>
        </div>
        {markMessage && (
          <p role="status" className={`mx-6 mt-4 rounded px-4 py-3 text-sm ${markMessage.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-action"}`}>
            {markMessage.text}
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Student Email</th>
                <th className="px-6 py-3">Course</th>
                <th className="px-6 py-3">Mark (%)</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courseStudents.map((student) => {
                const key = `${student.email}-${student.courseId}`;
                const existing = resultFor(student.email, student.courseId);
                return (
                  <tr key={student.id}>
                    <td className="px-6 py-4 font-semibold text-navy">{student.email}</td>
                    <td className="px-6 py-4">{student.course}</td>
                    <td className="px-6 py-4">
                      <input
                        aria-label={`Mark for ${student.email} in ${student.course}`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={marks[key] ?? String(existing?.mark ?? "")}
                        onChange={(event) => setMarks((prev) => ({ ...prev, [key]: event.target.value }))}
                        className={`${field} max-w-32`}
                      />
                      {existing?.status === "pending_release" && <span className="ml-2 text-xs font-semibold text-gold-dark">Pending release</span>}
                      {existing?.status === "released" && <span className="ml-2 text-xs font-semibold text-green-700">Released</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => void saveMark(student.email, student.courseId)}
                        disabled={submittingMark === key || existing?.status === "released"}
                        className="rounded bg-navy px-4 py-2 text-xs font-bold text-white transition hover:bg-navy-light disabled:opacity-50"
                      >
                        {existing?.status === "released" ? "Already Released" : submittingMark === key ? "Submitting..." : "Submit Marks to Office"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!selectedCourseId || courseStudents.length === 0 ? <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">{selectedCourseId ? "No students enrolled in this course." : "Select a course to view enrolled students."}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-heading text-xl text-navy">Enrolled Students</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Student Email</th>
                <th className="px-6 py-3">Course</th>
                <th className="px-6 py-3">Branch</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-navy">{s.email}</td>
                  <td className="px-6 py-4">{s.course}</td>
                  <td className="px-6 py-4">{s.branch}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.status.toLowerCase() === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">No enrolled students yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-heading text-xl text-navy">Upload Materials</h2>
        </div>
        <form onSubmit={upload} className="space-y-4 p-6">
          {message && (
            <p className={`rounded px-4 py-3 text-sm ${message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-action"}`}>
              {message.text}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Material Title</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. SHEMTRAC Module 1" className={field} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Course</label>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={field}>
                <option value="">All courses</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">File</label>
            <input
              required
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-navy file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-navy-light"
            />
          </div>
          <button
            type="submit"
            disabled={!title || !file || uploading}
            className="inline-flex items-center gap-2 rounded bg-gold px-6 py-2.5 font-heading font-bold text-navy transition hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading && <Loader2 size={16} className="animate-spin" />} Upload
          </button>
        </form>

        {materials.length > 0 && (
          <ul className="divide-y border-t">
            {materials.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                <div>
                  <span className="font-semibold text-navy">{m.title}</span>
                  <span className="ml-2 text-xs text-slate-500">{m.course} {m.created_at ? `· ${formatDate(m.created_at)}` : ""}</span>
                </div>
                <button onClick={() => remove(m)} className="text-slate-400 hover:text-action" aria-label={`Delete ${m.title}`}>
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-heading text-xl text-navy">Student Submissions</h2>
          <p className="mt-1 text-sm text-slate-500">Submissions and grading are filtered to the selected course.</p>
        </div>
        {submissionMessage && <p role="status" className="mx-6 mt-4 rounded bg-red-50 px-4 py-3 text-sm text-action">{submissionMessage}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Student Email</th>
                <th className="px-6 py-3">Course</th>
                <th className="px-6 py-3">File Name</th>
                <th className="px-6 py-3">Date Submitted</th>
                <th className="px-6 py-3">Mark</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courseSubmissions.map((s) => {
                const existing = resultFor(s.student_email, s.courseId);
                const submissionCourse = courses.find((course) => course.id === s.courseId)?.title ?? "course";
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-navy">{s.student_email}</td>
                    <td className="px-6 py-4">{submissionCourse}</td>
                    <td className="px-6 py-4">{s.file_name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">{formatDate(s.created_at)}</td>
                    <td className="px-6 py-4">
                      <input
                        aria-label={`Mark for ${s.student_email} in ${submissionCourse}`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={marks[`${s.student_email}-${s.courseId}`] ?? String(existing?.mark ?? "")}
                        disabled={existing?.status === "released"}
                        onChange={(event) => setMarks((previous) => ({ ...previous, [`${s.student_email}-${s.courseId}`]: event.target.value }))}
                        className={`${field} max-w-28`}
                      />
                      {existing?.status === "released" && <span className="ml-1 text-xs font-semibold text-green-700">Released</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button type="button" onClick={() => void downloadSubmission(s.file_url)} className="inline-flex items-center gap-1 text-xs font-semibold text-navy-light hover:underline">
                        <Download size={14} /> Download
                      </button>
                      <button
                        type="button"
                        onClick={() => void saveMark(s.student_email, s.courseId)}
                        disabled={submittingMark === `${s.student_email}-${s.courseId}` || existing?.status === "released"}
                        className="ml-3 text-xs font-bold text-navy hover:underline disabled:opacity-50"
                      >
                        {existing?.status === "released" ? "Already Released" : "Submit to Office"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {(!selectedCourseId || courseSubmissions.length === 0) && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">{selectedCourseId ? "No submissions for this course yet." : "Select a course to view submissions."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PortalShell>
  );
}
