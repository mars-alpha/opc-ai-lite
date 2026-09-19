import { notFound } from "next/navigation";
import { CourseRedirect } from "../../../components/CourseRedirect";
import { courses, getCourse } from "../../../lib/courses";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  return <CourseRedirect course={course} />;
}

