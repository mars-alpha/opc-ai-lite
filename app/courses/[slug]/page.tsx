import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { CourseRedirect } from "../../../components/CourseRedirect";
import { courses, getCourse } from "../../../lib/courses";
import { getSessionUser, SESSION_COOKIE } from "../../../lib/server/auth/service";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value ?? null);
  if (!user) {
    const returnTo = "/courses/" + course.slug;
    redirect("/auth?mode=login&returnTo=" + encodeURIComponent(returnTo));
  }

  return <CourseRedirect course={course} />;
}

