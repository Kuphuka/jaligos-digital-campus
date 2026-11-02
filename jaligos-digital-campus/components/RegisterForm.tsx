"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { branches } from "@/lib/data";
import { formatCoursePrice, getCoursePrice } from "@/lib/course-prices";
import { prepareApplicationUploads, submitApplication } from "@/app/register/actions";

export type CourseOption = { id: string; title: string; level: string | null; price: number | null };

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];

const input =
  "w-full rounded border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-gold/50";
const label = "mb-1.5 block text-sm font-semibold text-navy";

function FileField({ name, title }: { name: string; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-center">
      <Upload className="text-gold-dark" size={22} />
      <span className="mt-2 text-sm font-semibold text-navy">{title}</span>
      <span className="text-xs text-slate-500">PDF, JPG or PNG, max 5MB</span>
      <input type="file" name={name} required accept=".pdf,.jpg,.jpeg,.png" className="mt-3 max-w-full text-xs" />
    </div>
  );
}

export default function RegisterForm({ courses }: { courses: CourseOption[] }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group the course dropdown by level
  const groups = courses.reduce<Record<string, CourseOption[]>>((acc, c) => {
    const key = c.level || "Courses";
    (acc[key] ||= []).push(c);
    return acc;
  }, {});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const idDoc = fd.get("idDoc") as File | null;
    const qualification = fd.get("qualification") as File | null;
    const idNumber = String(fd.get("idNumber") ?? "").trim();

    if (!/^\d{13}$/.test(idNumber)) return setError("Your ID number must be 13 digits.");
    if (!idDoc || !qualification) return setError("Please attach both documents.");
    for (const f of [idDoc, qualification]) {
      if (f.size === 0) return setError("Please attach both documents.");
      if (f.size > MAX_BYTES) return setError(`"${f.name}" is larger than 5MB.`);
      if (!ALLOWED.includes(f.type)) return setError(`"${f.name}" must be a PDF, JPG or PNG.`);
    }

    setSubmitting(true);
    try {
      const prep = await prepareApplicationUploads(idDoc.name, qualification.name);
      if (!prep.ok) throw new Error(prep.error);

      const bucket = createClient().storage.from("documents");
      const up1 = await bucket.uploadToSignedUrl(prep.idPath, prep.idToken, idDoc, { contentType: idDoc.type });
      if (up1.error) throw new Error("We could not upload your ID document. Please try again.");
      const up2 = await bucket.uploadToSignedUrl(prep.qualPath, prep.qualToken, qualification, { contentType: qualification.type });
      if (up2.error) throw new Error("We could not upload your qualification. Please try again.");

      const res = await submitApplication({
        firstName: String(fd.get("firstName")),
        surname: String(fd.get("surname")),
        idNumber,
        phone: String(fd.get("phone")),
        email: String(fd.get("email")),
        courseId: String(fd.get("course")),
        branch: String(fd.get("branch")),
        idPath: prep.idPath,
        qualPath: prep.qualPath,
      });
      if (!res.ok) throw new Error(res.error);

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-gray-100 px-4 py-14">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-xl bg-white shadow-md">
        <div className="bg-navy px-8 py-6">
          <h1 className="font-heading text-2xl text-white">Apply to <span className="text-gold">Jaligos</span></h1>
          <p className="mt-1 text-sm text-white/70">Complete the form below and our admissions team will be in touch.</p>
        </div>

        {done ? (
          <div className="space-y-3 p-12 text-center">
            <CheckCircle2 className="mx-auto text-green-600" size={48} />
            <h2 className="font-heading text-2xl text-navy">Application received</h2>
            <p className="text-slate-600">
              Thank you. Our admissions team will review your documents and contact you once a decision is made.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-8 p-8">
            {error && <p className="rounded bg-red-50 px-4 py-3 text-sm text-action">{error}</p>}

            <section>
              <h2 className="mb-4 border-b pb-2 font-heading text-lg text-navy">Personal Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={label}>First Name</label><input className={input} name="firstName" required /></div>
                <div><label className={label}>Surname</label><input className={input} name="surname" required /></div>
                <div><label className={label}>ID Number</label><input className={input} name="idNumber" inputMode="numeric" maxLength={13} required /></div>
                <div><label className={label}>Phone</label><input className={input} name="phone" type="tel" required /></div>
                <div className="sm:col-span-2"><label className={label}>Email</label><input className={input} name="email" type="email" required /></div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 border-b pb-2 font-heading text-lg text-navy">Course &amp; Branch</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Course</label>
                  <select className={input} name="course" defaultValue="" required>
                    <option value="" disabled>{courses.length ? "Select a course" : "No courses available yet"}</option>
                    {Object.entries(groups).map(([level, items]) => (
                      <optgroup key={level} label={level}>
                        {items.map((c) => {
                          const price = getCoursePrice(c.title, c.level, c.price);
                          return (
                            <option key={c.id} value={c.id}>
                              {c.title}{price == null ? "" : ` - ${formatCoursePrice(price)}`}
                            </option>
                          );
                        })}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Branch</label>
                  <select className={input} name="branch" defaultValue="" required>
                    <option value="" disabled>Select a branch</option>
                    {branches.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 border-b pb-2 font-heading text-lg text-navy">Documents</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FileField name="idDoc" title="Certified ID Copy" />
                <FileField name="qualification" title="Highest Qualification" />
              </div>
            </section>

            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input type="checkbox" required className="mt-1" />
              <span>
                I consent to Jaligos collecting and processing my personal information and documents for the
                purpose of my application, in line with POPIA.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || courses.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded bg-action py-3.5 font-heading font-bold text-white transition hover:bg-action-dark disabled:opacity-70"
            >
              {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : "Submit Application"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
