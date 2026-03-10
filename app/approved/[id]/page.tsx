"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getDocument } from "@/data";
import { useApproved } from "@/lib/approved-store";
import { downloadAsPdf } from "@/lib/pdf";
import {
  ArrowLeft,
  FileText,
  FileDown,
  Send,
} from "lucide-react";

export default function ApprovedDeliveryPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const doc = id ? getDocument(id) : undefined;
  const { isApproved } = useApproved();

  const canDeliver =
    doc && (isApproved(doc.id) || doc.status === "approved");

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <p className="text-stone-600">Document not found</p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-2 text-sm text-amber-700 hover:text-amber-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to queue
          </Link>
        </div>
      </div>
    );
  }

  if (!canDeliver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <p className="text-stone-600">This document is not approved for delivery.</p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-2 text-sm text-amber-700 hover:text-amber-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <div className="bg-white border-b border-stone-200 px-8 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to queue
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-stone-900">
              {doc.type}
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">
              {doc.clientName} · {doc.jurisdiction}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 py-10 max-w-lg">
        <h2 className="text-sm font-semibold text-stone-700 mb-3">
          Deliver to client
        </h2>
        <p className="text-sm text-stone-500 mb-6">
          Download the document as a PDF or send for e-signature.
        </p>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => downloadAsPdf(doc)}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Download PDF
          </button>
          <button
            type="button"
            disabled
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-stone-200 bg-stone-50 text-stone-400 text-sm font-medium cursor-not-allowed"
            title="DocuSign integration not configured"
          >
            <Send className="w-4 h-4" />
            Send to DocuSign
          </button>
        </div>
      </div>
    </div>
  );
}
