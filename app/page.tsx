"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  documents,
  getSlaStatus,
  formatDeadline,
  type DocumentStatus,
} from "@/data";
import { useApproved } from "@/lib/approved-store";
import {
  AlertTriangle,
  Clock,
  FileText,
  CheckCircle2,
  RotateCcw,
  Circle,
  RefreshCw,
  FileSearch,
  Send,
} from "lucide-react";

const STATUS_LABELS: Record<DocumentStatus, string> = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  returned: "Returned",
};

const STATUS_STYLES: Record<DocumentStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  in_review: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  returned: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const STATUS_ICONS: Record<DocumentStatus, React.ReactNode> = {
  pending: <Circle className="w-3 h-3" />,
  in_review: <Clock className="w-3 h-3" />,
  approved: <CheckCircle2 className="w-3 h-3" />,
  returned: <RotateCcw className="w-3 h-3" />,
};

type FilterTab = "all" | DocumentStatus;

/** Effective status: approved from store overrides; pending + any flag reviewed → in_review */
function useEffectiveDocuments() {
  const { isApproved, isInReview } = useApproved();
  return useMemo(
    () =>
      documents.map((d) => {
        if (isApproved(d.id)) return { ...d, status: "approved" as const };
        if (d.status === "pending" && isInReview(d.id))
          return { ...d, status: "in_review" as const };
        return { ...d };
      }),
    [isApproved, isInReview]
  );
}

export default function QueuePage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const { hasHydrated, resetToDefault } = useApproved();
  const docsWithStatus = useEffectiveDocuments();

  const filtered =
    filter === "all"
      ? docsWithStatus
      : docsWithStatus.filter((d) => d.status === filter);
  const pendingCount = docsWithStatus.filter(
    (d) => d.status === "pending",
  ).length;
  const inReviewCount = docsWithStatus.filter(
    (d) => d.status === "in_review",
  ).length;
  const approvedCount = docsWithStatus.filter(
    (d) => d.status === "approved",
  ).length;

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: "all", label: "All", count: docsWithStatus.length },
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "in_review", label: "In Review", count: inReviewCount },
    { key: "approved", label: "Approved", count: approvedCount },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-8 pt-8 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">
              Review Queue
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">
              AI-generated documents awaiting attorney review before client
              delivery
            </p>
            {hasHydrated && (
              <button
                type="button"
                onClick={resetToDefault}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                title="Clear all approved documents (reset to seed data)"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset to default data
              </button>
            )}
          </div>
          {!hasHydrated ? (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 min-h-[2.25rem]"
              aria-hidden
            >
              <span className="w-4 h-4 shrink-0 rounded bg-stone-200 animate-pulse" />
              <span className="h-4 w-44 rounded bg-stone-200 animate-pulse" />
            </div>
          ) : (
            pendingCount > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-3 py-2 rounded-lg min-h-[2.25rem]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {pendingCount} document{pendingCount !== 1 ? "s" : ""} awaiting
                  review
                </span>
              </div>
            )
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                filter === tab.key
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              {tab.label}
              {tab.count != null &&
                (hasHydrated ? (
                  <span
                    className={`ml-2 inline-flex min-w-[1.5rem] h-5 items-center justify-center text-xs px-1.5 py-0.5 rounded-full ${
                      filter === tab.key
                        ? "bg-amber-100 text-amber-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                ) : (
                  <span
                    className="ml-2 min-w-[1.5rem] h-5 rounded-full bg-stone-200 animate-pulse inline-block"
                    aria-hidden
                  />
                ))}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-stone-400">
            <FileText className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No documents in this category</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
                    Document
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
                    Client
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
                    SLA Deadline
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
                    AI Flags
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
                    Assigned To
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((doc: (typeof docsWithStatus)[0]) => {
                  const sla = getSlaStatus(doc.slaDeadline);
                  const criticalFlags = doc.flags.filter(
                    (f) => f.severity === "critical",
                  ).length;
                  const warningFlags = doc.flags.filter(
                    (f) => f.severity === "warning",
                  ).length;

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-stone-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-stone-500" />
                          </div>
                          <span className="font-medium text-stone-800">
                            {doc.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-stone-600">
                        {doc.clientName}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Clock
                            className={`w-3.5 h-3.5 ${
                              sla === "critical"
                                ? "text-red-500"
                                : sla === "warning"
                                  ? "text-amber-500"
                                  : "text-stone-400"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              sla === "critical"
                                ? "text-red-600"
                                : sla === "warning"
                                  ? "text-amber-600"
                                  : "text-stone-600"
                            }`}
                          >
                            {formatDeadline(doc.slaDeadline)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {doc.flags.length === 0 ? (
                          <span className="text-stone-400 text-xs">None</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {criticalFlags > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 ring-1 ring-red-200 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {criticalFlags} critical
                              </span>
                            )}
                            {warningFlags > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 ring-1 ring-amber-200 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {warningFlags} warning
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                            {doc.assignedTo
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span className="text-stone-600 text-xs">
                            {doc.assignedTo}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {hasHydrated ? (
                          <span
                            className={`inline-flex min-w-[5.5rem] h-6 items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[doc.status]}`}
                          >
                            {STATUS_ICONS[doc.status]}
                            {STATUS_LABELS[doc.status]}
                          </span>
                        ) : (
                          <span
                            className="inline-block min-w-[5.5rem] h-6 rounded-full bg-stone-200 animate-pulse"
                            aria-hidden
                          />
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {hasHydrated ? (
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/review/${doc.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 rounded px-2 py-1.5 -mx-2 -my-1.5 hover:bg-amber-50 transition-colors min-w-[5.25rem]"
                              title="Review document"
                            >
                              <FileSearch className="w-3.5 h-3.5 shrink-0" />
                              Review
                            </Link>
                            {doc.status === "approved" ? (
                              <Link
                                href={`/approved/${doc.id}`}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 rounded px-2 py-1.5 -mx-2 -my-1.5 hover:bg-amber-50 transition-colors min-w-[5.25rem]"
                                title="Deliver to client"
                              >
                                <Send className="w-3.5 h-3.5 shrink-0" />
                                Deliver
                              </Link>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 rounded px-2 py-1.5 -mx-2 -my-1.5 min-w-[5.25rem] cursor-not-allowed"
                                title="Approve the document first to deliver"
                              >
                                <Send className="w-3.5 h-3.5 shrink-0" />
                                Deliver
                              </span>
                            )}
                          </div>
                        ) : (
                          <span
                            className="inline-block min-w-[10rem] h-5 rounded bg-stone-200 animate-pulse"
                            aria-hidden
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
