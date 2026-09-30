"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    label: "平台",
    items: [
      { href: "/admin", label: "运营总览" },
      { href: "/admin/content", label: "官方内容" },
      { href: "/admin/courses", label: "课程" },
      { href: "/admin/learning", label: "学习洞察" }
    ]
  },
  {
    label: "用户",
    items: [
      { href: "/admin/users", label: "用户与权益" }
    ]
  }
] as const;

export function AdminWorkspaceNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-workspace-nav" aria-label="后台导航">
      {groups.map((group) => (
        <div className="admin-nav-group admin-nav-group-secondary" key={group.label}>
          <span className="admin-nav-group-label">{group.label}</span>
          {group.items.map((item) => {
            const baseHref = item.href.split("?")[0];
            const active =
              baseHref === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(baseHref);
            return (
              <Link className={"admin-nav-item " + (active ? "is-active" : "")} href={item.href} key={item.href}>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}

    </nav>
  );
}
