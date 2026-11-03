"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ChangePasswordModalProps = {
  onClose: () => void;
};

const field =
  "w-full rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-gold/50";

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSaving(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setSaved(true);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08182B]/70 px-4 py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between bg-navy px-6 py-5 text-white">
          <div>
            <h2 id="change-password-title" className="font-heading text-xl font-bold">
              Change Password
            </h2>
            <p className="mt-1 text-sm text-white/70">Choose a new password for your account.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close change password dialog"
            className="rounded p-1 text-white/75 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-6">
          {error && <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {saved && <p role="status" className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">Your password was updated successfully.</p>}

          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-sm font-semibold text-navy">New Password</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="mb-1.5 block text-sm font-semibold text-navy">Confirm New Password</label>
            <input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={field}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded bg-action px-5 py-2.5 text-sm font-bold text-white transition hover:bg-gold-dark disabled:opacity-70"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
