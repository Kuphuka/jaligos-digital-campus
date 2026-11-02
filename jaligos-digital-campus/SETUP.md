# Jaligos Digital Campus: Setup & Deploy

This version works with your existing Supabase tables:
`user_roles`, `courses`, `applications`, `enrollments`, `materials`, and the `documents` storage bucket.

## 0. Security first
- If you ever pasted your keys anywhere (chat, WhatsApp, email), rotate them: Supabase -> Project Settings -> API Keys.
- Keys go ONLY in `.env.local` (your computer) and Vercel Environment Variables. Never in code or GitHub.
- Copy the project URL from the dashboard instead of retyping it. A single wrong letter breaks everything.

## 1. Run the migration
Supabase -> SQL Editor -> New query -> paste all of `supabase/migration.sql` -> Run.
It adds missing columns, creates a `submissions` table, turns on row level security (so the public key can't read your data), and makes the `documents` bucket private.

For lecturer course assignments and account suspension, also run `supabase/staff-management.sql` in the SQL Editor.

Then Storage -> Policies: delete any policies you created on the `documents` bucket. The website uses server-side access, so it doesn't need them.

For the Black Friday 2026 course prices, run `supabase/black-friday-prices.sql` in the SQL Editor. Its title matches must correspond to the existing `courses.title` values.

## 2. Add your courses
The registration dropdown reads the `courses` table. Add rows in the Table Editor (title, level, price), or use SQL
(adjust to your column types):
```sql
insert into courses (title, level, price) values
  ('SHEMTRAC', 'Safety', 2500),
  ('SHE Representative', 'Safety', 2500),
  ('Caregiver Level 3', 'Home Based Care', 4500);
```

## 3. Create your first admin
1. Authentication -> Users -> Add user -> Create new user (your email + password, tick Auto Confirm).
2. Table Editor -> `user_roles` -> insert a row: `email` = that email in lowercase, `role` = `admin`, `full_name` = your name.
   (If `id` must equal the user's id, copy it from the Users list.)

## 4. Environment variables
Copy `.env.example` to `.env.local` and fill it in. Add the same four variables on Vercel.

## 5. Run and test
```bash
npm install
npm run dev
```
1. `/register`: apply as a test student (use PDF/JPG/PNG files under 5MB).
2. `/login` as admin -> `/admin` -> view documents -> **Approve & Create Account**.
3. Copy the school email + temporary password shown, log in as the student -> `/portal`.
4. In `/admin` use **Add Lecturer**, log in as the lecturer -> `/staff`, upload a material.
5. Log back in as the student: the material appears. Upload an assignment; the lecturer sees it under Student Submissions.

## 6. Deploy
Push to GitHub -> import in Vercel -> add the 4 env variables -> Deploy.

## Things to know
- School emails like `thabo.mokoena@jaligos.co.za` are only login names. No mailbox is created, so credentials are shown to the admin to pass on (WhatsApp/phone). If a student forgets their password, reset it in Supabase -> Authentication -> Users.
- Columns assumed: `applications.course_id` / `enrollments.course_id` / `materials.course_id` match the type of `courses.id`; `materials.uploaded_by` is text (stores the lecturer's email). If an action shows a database error, it will name the column.
- `/register` is public. Add a captcha or rate limit if spam appears.
- You store ID numbers and documents: add a privacy policy page (POPIA).
