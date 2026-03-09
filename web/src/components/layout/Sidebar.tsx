 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/course", label: "Course" },
  { href: "/assessment/1", label: "Assessments" },
  { href: "/exam", label: "Exam Simulation" },
];

function NavLink({ href, label }: NavItem) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-slate-100 text-slate-900"
          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-600" />
      {label}
    </Link>
  );
}

export function Sidebar(): ReactNode {
  return (
    <aside className="glass-panel sticky top-0 flex h-screen w-64 flex-shrink-0 flex-col border-r border-slate-200 px-4 py-5">
      <div className="mb-8 flex items-center gap-2 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold">
          AW
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-slate-900">
            Academic Workload
          </p>
          <p className="text-xs text-slate-500">Behavior Simulator</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <div className="mt-auto pt-6 text-xs text-slate-500">
        <p className="mb-1 font-medium text-slate-700">Today&apos;s Focus</p>
        <p className="text-slate-600">
          Track study blocks, procrastination, and stress levels to calibrate
          your academic workload.
        </p>
      </div>
    </aside>
  );
}

