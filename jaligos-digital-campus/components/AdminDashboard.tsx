"use client";

import { useState } from "react";
import { Copy, X } from "lucide-react";
import PortalShell from "./PortalShell";
import { approveApplication, createAdmin, createLecturer, releaseResult, setLecturerStatus } from "@/app/admin/actions";

export type PendingApplication = {
  id: string;
  created_at: string | null;
  first_name: string;
  surname: string;
  email: string;
  course: string;
  branch: string;
  idUrl: string | null;
  qualUrl: string | null;
};

type PendingResult = { id: string; student_email: string; course: string; mark: number };
type CourseOption = { id: string; title: string };
type Lecturer = { name: string; email: string; status: string; courses: string[] };

export default function AdminDashboard({
  profile,
  applications: initialApplications,
  pendingResults: initialPendingResults,
  courses,
  staff: initialStaff,
}: {
  profile: { name: string; email: string };
  applications: PendingApplication[];
  pendingResults: PendingResult[];
  courses: CourseOption[];
  staff: Lecturer[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pendingResults, setPendingResults] = useState(initialPendingResults);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [lecturers, setLecturers] = useState(initialStaff);
  const [lecturerName, setLecturerName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [creatingLecturer, setCreatingLecturer] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [createdAdmin, setCreatedAdmin] = useState<{ name: string; email: string; password: string } | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [staffMessage, setStaffMessage] = useState<string | null>(null);
  const [updatingLecturer, setUpdatingLecturer] = useState<string | null>(null);

  const handleCreateLecturer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatingLecturer(true);
    setStaffMessage(null);
    try {
      const result = await createLecturer(lecturerName, courseId);
      if (!result.ok) {
        setStaffMessage(result.error);
        return;
      }

      setStaffMessage(`Lecturer created and assigned to a course: ${result.schoolEmail}`);
      window.alert(`Lecturer account created.\n\nName: ${result.name}\nEmail: ${result.schoolEmail}\nTemporary password: ${result.password}\n\nShare these credentials securely.`);
      setLecturerName("");
      setCourseId("");
      window.location.reload();
    } catch (error) {
      setStaffMessage(error instanceof Error ? error.message : "Could not create lecturer.");
    } finally {
      setCreatingLecturer(false);
    }
  };

  const handleCreateAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatingAdmin(true);
    setAdminMessage(null);
    try {
      const result = await createAdmin(adminName);
      if (!result.ok) {
        setAdminMessage(result.error);
        return;
      }

      setCreatedAdmin({ name: result.name, email: result.schoolEmail, password: result.password });
      setAdminName("");
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : "Could not create admin.");
    } finally {
      setCreatingAdmin(false);
    }
  };

  const copyAdminCredentials = async () => {
    if (!createdAdmin) return;
    try {
      await navigator.clipboard.writeText(
        `Name: ${createdAdmin.name}\nEmail: ${createdAdmin.email}\nTemporary password: ${createdAdmin.password}`
      );
      setCopyMessage("Credentials copied.");
    } catch {
      setCopyMessage("Copy was unavailable. Select and copy the credentials above.");
    }
  };

  const handleLecturerStatus = async (lecturer: Lecturer) => {
    const status = lecturer.status === "suspended" ? "active" : "suspended";
    setUpdatingLecturer(lecturer.email);
    setStaffMessage(null);
    try {
      const result = await setLecturerStatus(lecturer.email, status);
      if (!result.ok) {
        setStaffMessage(result.error);
      } else {
        setLecturers((current) => current.map((item) =>
          item.email === lecturer.email ? { ...item, status } : item
        ));
      }
    } catch (error) {
      setStaffMessage(error instanceof Error ? error.message : "Could not update lecturer status.");
    } finally {
      setUpdatingLecturer(null);
    }
  };

  const handleApprove = async (app: PendingApplication) => {
    setLoadingId(app.id);
    
    try {
      const result = await approveApplication(app.id);
      
      if (result && !result.ok) {
        alert("Error approving student: " + result.error);
      } else if (result && result.ok) {
        // USING PROMPT INSTEAD OF ALERT SO YOU CAN COPY THE TEXT
        prompt(
          "Success! Copy these details for the student:", 
          `Email: ${result.schoolEmail} | Password: ${result.password}`
        );
        
        // Remove them from the table
        setApplications((prev) => prev.filter((a) => a.id !== app.id));
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    }
    
    setLoadingId(null);
  };

  const handleRelease = async (resultId: string) => {
    setReleasingId(resultId);
    setResultMessage(null);
    try {
      const response = await releaseResult(resultId);
      if (!response.ok) {
        setResultMessage(response.error);
      } else {
        setPendingResults((current) => current.filter((result) => result.id !== resultId));
        setResultMessage("Result released to the student.");
      }
    } catch (error) {
      setResultMessage(error instanceof Error ? error.message : "Could not release the result.");
    } finally {
      setReleasingId(null);
    }
  };

  return (
    <PortalShell 
      title="Admin Dashboard" 
      profile={{ full_name: profile.name, email: profile.email, role: "admin" }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {createdAdmin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08182B]/70 px-4 py-8">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="created-admin-title"
              className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between bg-navy px-6 py-5 text-white">
                <div>
                  <h2 id="created-admin-title" className="font-serif text-xl font-bold">Admin account created</h2>
                  <p className="mt-1 text-sm text-white/75">Share these temporary credentials securely.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setCreatedAdmin(null); setCopyMessage(null); }}
                  aria-label="Close admin credentials"
                  className="rounded p-1 text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4 p-6">
                <p className="text-sm font-semibold text-navy">{createdAdmin.name}</p>
                <label className="block text-sm font-semibold text-navy">
                  Email
                  <input readOnly value={createdAdmin.email} className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-4 py-2.5 font-normal text-slate-700" />
                </label>
                <label className="block text-sm font-semibold text-navy">
                  Temporary password
                  <input readOnly value={createdAdmin.password} className="mt-1 w-full rounded border border-gray-300 bg-gray-50 px-4 py-2.5 font-mono font-normal text-slate-700" />
                </label>
                {copyMessage && <p role="status" className="text-sm text-navy">{copyMessage}</p>}
                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => { setCreatedAdmin(null); setCopyMessage(null); }}
                    className="rounded border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={copyAdminCredentials}
                    className="inline-flex items-center justify-center gap-2 rounded bg-action px-5 py-2.5 text-sm font-bold text-white transition hover:bg-gold-dark"
                  >
                    <Copy size={16} /> Copy Credentials
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-serif text-xl font-bold text-navy">Staff Management</h2>
            <p className="mt-1 text-sm text-gray-500">Create lecturer accounts, assign courses, and manage access.</p>
          </div>
          <div className="grid gap-6 p-6 lg:grid-cols-2">
            <form onSubmit={handleCreateLecturer} className="space-y-4 rounded-lg border border-gray-200 p-5">
              <h3 className="font-heading text-base font-bold text-navy">Create Lecturer</h3>
              <label className="block text-sm font-semibold text-navy">
                Lecturer Full Name
                <input
                  required
                  minLength={3}
                  value={lecturerName}
                  onChange={(event) => setLecturerName(event.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-4 py-2.5 font-normal"
                  placeholder="First name and surname"
                />
              </label>
              <label className="block text-sm font-semibold text-navy">
                Assigned Course
                <select
                  required
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-4 py-2.5 font-normal"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
              </label>
              <button
                type="submit"
                disabled={creatingLecturer || courses.length === 0}
                className="rounded bg-action px-5 py-2.5 font-bold text-white transition hover:bg-gold-dark disabled:opacity-50"
              >
                {creatingLecturer ? "Creating..." : "Create Lecturer"}
              </button>
            </form>

            <form onSubmit={handleCreateAdmin} className="space-y-4 rounded-lg border border-gold/40 bg-[#F5F3EE]/60 p-5">
              <h3 className="font-heading text-base font-bold text-navy">Create New Admin</h3>
              <label className="block text-sm font-semibold text-navy">
                Full Name
                <input
                  required
                  minLength={3}
                  value={adminName}
                  onChange={(event) => setAdminName(event.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-4 py-2.5 font-normal"
                  placeholder="First name and surname"
                />
              </label>
              <button
                type="submit"
                disabled={creatingAdmin}
                className="rounded bg-action px-5 py-2.5 font-bold text-white transition hover:bg-gold-dark disabled:opacity-50"
              >
                {creatingAdmin ? "Creating..." : "Create New Admin"}
              </button>
              {adminMessage && <p role="status" className="text-sm text-red-700">{adminMessage}</p>}
            </form>
          </div>
          {staffMessage && <p role="status" className="px-6 pb-5 text-sm text-navy">{staffMessage}</p>}
          <div className="overflow-x-auto border-t">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Assigned Course</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lecturers.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No lecturers have been created.</td></tr>
                ) : lecturers.map((lecturer) => (
                  <tr key={lecturer.email}>
                    <td className="p-4 font-medium text-navy">{lecturer.name}</td>
                    <td className="p-4">{lecturer.email}</td>
                    <td className="p-4">{lecturer.courses.join(", ") || "No course assigned"}</td>
                    <td className="p-4 capitalize">{lecturer.status}</td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => void handleLecturerStatus(lecturer)}
                        disabled={updatingLecturer === lecturer.email}
                        className="rounded border border-navy px-3 py-1.5 text-xs font-bold text-navy disabled:opacity-50"
                      >
                        {updatingLecturer === lecturer.email ? "Updating..." : lecturer.status === "suspended" ? "Reactivate" : "Suspend"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-serif text-xl font-bold text-navy">Pending Results for Release</h2>
            <p className="mt-1 text-sm text-gray-500">Review marks submitted by lecturers before publishing them to students.</p>
          </div>
          {resultMessage && <p role="status" className="px-6 pt-4 text-sm text-navy">{resultMessage}</p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4 font-semibold">Student Email</th>
                  <th className="p-4 font-semibold">Course</th>
                  <th className="p-4 font-semibold">Mark</th>
                  <th className="p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingResults.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">There are no pending results.</td></tr>
                ) : pendingResults.map((result) => (
                  <tr key={result.id}>
                    <td className="p-4 font-medium text-navy">{result.student_email}</td>
                    <td className="p-4">{result.course}</td>
                    <td className="p-4 font-bold text-navy">{result.mark}%</td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => void handleRelease(result.id)}
                        disabled={releasingId === result.id}
                        className="rounded bg-navy px-4 py-2 text-xs font-bold text-white transition hover:bg-navy-light disabled:opacity-50"
                      >
                        {releasingId === result.id ? "Releasing..." : "Release to Student"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div>
          <h1 className="text-3xl font-bold text-navy">Pending Applications</h1>
          <p className="text-gray-500 mt-1">Review and approve new student registrations.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Student Name</th>
                <th className="p-4 font-semibold">Course</th>
                <th className="p-4 font-semibold">Branch</th>
                <th className="p-4 font-semibold">Documents</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {applications.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No pending applications found in the database.</td></tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-500">{app.created_at ? new Date(app.created_at).toLocaleDateString() : "—"}</td>
                    <td className="p-4 font-medium text-navy">
                      {app.first_name} {app.surname}
                      <br/>
                      <span className="text-xs text-gray-400 font-normal">{app.email}</span>
                    </td>
                    <td className="p-4">{app.course}</td>
                    <td className="p-4">{app.branch}</td>
                    <td className="p-4 space-y-1">
                      {app.idUrl && (
                        <a href={app.idUrl} target="_blank" rel="noreferrer" className="block text-blue-600 hover:underline text-xs">View ID</a>
                      )}
                      {app.qualUrl && (
                        <a href={app.qualUrl} target="_blank" rel="noreferrer" className="block text-blue-600 hover:underline text-xs">View Qualification</a>
                      )}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleApprove(app)}
                        disabled={loadingId === app.id}
                        className="bg-navy text-white px-4 py-2 rounded text-xs font-bold hover:bg-navy-light transition disabled:opacity-50"
                      >
                        {loadingId === app.id ? "Approving..." : "Approve & Enroll"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}