"use client";

import Link from "next/link";
import { documents } from "@/data";
import { useApproved } from "@/lib/approved-store";
import { ArrowLeft, FileText, FileDown, CheckCircle2 } from "lucide-react";

export default function ApprovedPage() {
  const { isApproved } = useApproved();
  const approvedDocs = documents.filter(
    (d) => isApproved(d.id) || d.status === "approved"
  );

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-stone-200 px-8 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to queue
          </Link>
        </div>
        <h1 className="text-xl font-semibold text-stone-900">Approved</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          Documents you’ve approved. Download as PDF for client delivery.
        </p>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        {approvedDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-stone-400">
            <CheckCircle2 className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium text-stone-500">
              No approved documents yet
            </p>
            <p className="text-xs mt-1">
              Approve a document from the review queue to see it here.
            </p>
            <Link
              href="/"
              className="mt-4 text-sm text-amber-700 hover:text-amber-900 font-medium"
            >
              Go to Review Queue →
            </Link>
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
                    Jurisdiction
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {approvedDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-stone-50 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-medium text-stone-800">
                          {doc.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-stone-600">
                      {doc.clientName}
                    </td>
                    <td className="px-5 py-4 text-stone-600">
                      {doc.jurisdiction}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/review/${doc.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/approved/${doc.id}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 border border-amber-200 bg-amber-50 rounded-lg px-3 py-1.5"
                        >
                          <FileDown className="w-4 h-4" />
                          Deliver
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
