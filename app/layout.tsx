import type { Metadata } from "next";
import "./globals.css";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Providers } from "./providers";
import { courses } from "../lib/courses";

export const metadata: Metadata = {
  title: {
    default: "OPC AI · 持续更新的 AI 学习平台",
    template: "%s · OPC AI"
  },
  description: "面向普通人的持续更新型 AI 学习与知识平台。"
};

const headerCatalog = courses.map((course) => ({
  slug: course.slug,
  title: course.title,
  stageLabel: course.stageLabel,
  lessons: course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, summary: lesson.summary }))
  )
}));

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="site-shell">
          <div className="ambient ambient-one" aria-hidden="true" />
          <div className="ambient ambient-two" aria-hidden="true" />
          <Providers>
            <Header catalog={headerCatalog} />
            <main>{children}</main>
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  );
}

