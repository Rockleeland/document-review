import { jsPDF } from "jspdf";
import type { ReviewDocument } from "@/data";

/** Build full document body text from doc.content (for PDF when editor text not available). */
export function buildDocumentText(doc: ReviewDocument): string {
  const parts: string[] = [];
  for (const section of doc.content) {
    parts.push(section.title);
    parts.push("");
    if (section.id === "signatures") {
      const blocks = section.body.split(/\n\n+/).filter(Boolean);
      parts.push(blocks.join("\n\n"));
    } else {
      parts.push(section.body);
    }
    parts.push("");
  }
  return parts.join("\n");
}

/** Full text for PDF: header + body. */
export function getFullTextForPdf(doc: ReviewDocument, bodyText: string): string {
  const header = [
    doc.type,
    `Client: ${doc.clientName}`,
    `Parties: ${doc.parties.map((p) => `${p.label}: ${p.name}`).join(", ")}`,
    `Jurisdiction: ${doc.jurisdiction}`,
    "",
    "",
  ].join("\n");
  return header + bodyText;
}

const MARGIN = 20;
const LINE_HEIGHT = 6;
const PAGE_HEIGHT = 297; // A4
const MAX_WIDTH = 210 - MARGIN * 2;

/**
 * Generate and download document as PDF.
 * @param doc - Review document
 * @param bodyText - Optional; if omitted, built from doc.content
 */
export function downloadAsPdf(
  doc: ReviewDocument,
  bodyText?: string
): void {
  const text = getFullTextForPdf(
    doc,
    bodyText ?? buildDocumentText(doc)
  );
  const pdf = new jsPDF({ format: "a4", unit: "mm" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const lines = pdf.splitTextToSize(text, MAX_WIDTH);
  let y = MARGIN;

  for (const line of lines) {
    if (y > PAGE_HEIGHT - MARGIN - LINE_HEIGHT) {
      pdf.addPage();
      y = MARGIN;
    }
    pdf.text(line, MARGIN, y);
    y += LINE_HEIGHT;
  }

  const filename = `NDA-${doc.clientName.replace(/\s+/g, "-")}.pdf`;
  pdf.save(filename);
}
