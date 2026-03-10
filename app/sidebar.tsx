"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, FileText, CheckCircle, Settings, Scale } from "lucide-react";
import { documents } from "@/data";

const pendingCount = documents.filter((d) => d.status === "pending").length;

const nav = [
  { href: "/queue", label: "Review Queue", icon: Inbox, badge: pendingCount },
  { href: "/documents", label: "All Documents", icon: FileText },
  { href: "/approved", label: "Approved", icon: CheckCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-stone-950 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-600 rounded flex items-center justify-center">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white tracking-tight">
              Document
            </p>
            <p className="text-xs text-stone-500 -mt-0.5">Review Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon, badge }) => {
          const active =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                active
                  ? "bg-white/10 text-white"
                  : "text-stone-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge != null && badge > 0 && (
                <span className="bg-amber-500 text-stone-950 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-amber-700 flex items-center justify-center text-xs font-semibold text-white shrink-0">
            SM
          </div>
          <div className="min-w-0">
            <p className="text-xs text-white font-medium truncate">
              Sarah Mitchell
            </p>
            <p className="text-xs text-stone-500 truncate">Senior Attorney</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
