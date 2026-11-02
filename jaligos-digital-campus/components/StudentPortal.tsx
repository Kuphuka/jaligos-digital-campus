"use client";

import { useState } from "react";
import PortalShell from "@/components/PortalShell";
import { createClient } from "@/lib/supabase/client";
import { prepareSubmissionUpload, recordSubmission } from "@/app/portal/actions";

export type Material = {
  id: string;
  title: string;
  file_url: string;
  uploaded_by_name: string;
};
export type StudentResult = { id: string; course: string; mark: number };
export type StudentCourse = { id: string; title: string };

interface StudentPortalProps {
  profile: { name: string; email: string };
  courses: StudentCourse[];
  materials: Material[];
  results: StudentResult[];
}

export default function StudentPortal({ profile, courses, materials, results }: StudentPortalProps) {
  const [uploading, setUploading] = useState(false);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [uploadMessage, setUploadMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const supabase = createClient();

  const handleUploadAssignment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage(null);
    try {
      if (!courseId) throw new Error("You need an active course enrollment to submit an assignment.");
      const prepared = await prepareSubmissionUpload(file.name, courseId);
      if (!prepared.ok) throw new Error(prepared.error);

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .uploadToSignedUrl(prepared.path, prepared.token, file, { contentType: file.type || undefined });
      if (uploadError) throw new Error(`Could not upload the assignment: ${uploadError.message}`);

      const saved = await recordSubmission(prepared.path, file.name, courseId);
      if (!saved.ok) throw new Error(saved.error);
      setUploadMessage({ type: "ok", text: "Assignment submitted successfully." });
    } catch (error) {
      setUploadMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not submit the assignment.",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <PortalShell title="Student Portal" profile={{ full_name: profile.name, email: profile.email, role: "student" }}>
      <div className="space-y-10">
        
        {/* Hero Banner */}
        <div className="bg-navy rounded-2xl p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-action opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <h1 className="text-4xl font-serif font-bold mb-3 text-white">Welcome back, {profile.name?.split(' ')[0]}</h1>
          <p className="text-gray-300 font-sans text-lg">Your academic journey continues here.</p>
          <p className="text-sm text-gray-400 mt-2 font-sans">Email: {profile.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Study Materials */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
              <h2 className="text-2xl font-serif font-bold text-navy mb-6">Study Materials</h2>
              <div className="space-y-4">
                {materials.length > 0 ? materials.map((mat) => (
                  <div key={mat.id} className="flex justify-between items-center bg-[#F5F3EE] p-5 rounded-xl border border-gray-100 hover:border-gold transition-colors duration-300">
                    <div>
                      <span className="font-heading font-bold text-navy block text-lg">{mat.title}</span>
                      <span className="text-xs text-gray-500 font-sans mt-1 block">By {mat.uploaded_by_name}</span>
                    </div>
                    <a href={mat.file_url} target="_blank" rel="noreferrer" className="bg-navy text-white px-6 py-2.5 rounded-lg text-sm font-heading font-semibold hover:bg-navy-light transition-colors shadow-md">
                      Download
                    </a>
                  </div>
                )) : (
                  <p className="text-gray-500 font-sans text-center py-8">No study materials available yet.</p>
                )}
              </div>
            </div>

            {/* Upload Assignment */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
              <h2 className="text-2xl font-serif font-bold text-navy mb-6">Submit Assignment</h2>
              <label className="mb-4 block text-sm font-semibold text-navy">
                Course
                <select
                  required
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                  disabled={uploading || courses.length === 0}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-gold focus:outline-none"
                >
                  <option value="">Select an enrolled course</option>
                  {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-[#F5F3EE] hover:border-gold transition-all duration-300">
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleUploadAssignment} disabled={uploading || !courseId} className="mx-auto text-sm text-gray-500 file:mr-6 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-heading file:font-bold file:bg-action file:text-white hover:file:bg-gold-dark file:transition-colors file:cursor-pointer" />
              </div>
              {uploading && <p className="text-center text-sm text-green-600 mt-4 font-heading font-semibold">Uploading...</p>}
              {uploadMessage && <p role="status" className={`mt-4 rounded-lg px-4 py-3 text-sm ${uploadMessage.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{uploadMessage.text}</p>}
            </div>
          </div>

          {/* Results Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
              <h2 className="text-2xl font-serif font-bold text-navy mb-6">My Results</h2>
              <div className="space-y-4">
                {results.length ? results.map((result) => (
                  <div key={result.id} className="rounded-xl border border-gray-100 bg-[#F5F3EE] p-5">
                    <p className="font-heading font-bold text-navy">{result.course}</p>
                    <p className="mt-1 font-sans text-sm text-gray-500">
                      Mark: <span className="text-lg font-bold text-green-700">{result.mark}%</span>
                    </p>
                  </div>
                )) : <p className="py-6 text-center font-sans text-sm text-gray-500">No released results yet.</p>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </PortalShell>
  );
}