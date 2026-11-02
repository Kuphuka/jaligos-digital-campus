import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegisterForm, { type CourseOption } from "@/components/RegisterForm";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function Register() {
  const { data } = await createAdminClient()
    .from("courses")
    .select("id,title,level,price")
    .order("title");

  const courses: CourseOption[] = (data ?? []).map((c) => ({
    id: String(c.id),
    title: c.title as string,
    level: c.level == null ? null : String(c.level),
    price: c.price == null ? null : Number(c.price),
  }));

  return (
    <>
      <Header />
      <RegisterForm courses={courses} />
      <Footer />
    </>
  );
}
