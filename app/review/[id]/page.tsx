"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getDocument } from "@/data";
import type { ReviewDocument, Flag, FlagSeverity } from "@/data";
import { useApproved } from "@/lib/approved-store";
import { downloadAsPdf } from "@/lib/pdf";

/** Format ISO date for display in diff */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { HighlightWithField } from "@/lib/highlight-with-field";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Download,
  FileDown,
  AlertTriangle,
  Info,
  Edit3,
  Eye,
} from "lucide-react";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Flag style map
// ---------------------------------------------------------------------------
const FLAG_STYLES: Record<
  FlagSeverity,
  {
    bg: string;
    border: string;
    badge: string;
    icon: React.ReactNode;
    label: string;
    highlightColor: string;
  }
> = {
  critical: {
    bg: "bg-red-50",
    border: "border-l-red-500",
    badge: "bg-red-100 text-red-700 ring-red-200",
    icon: <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />,
    label: "Critical",
    highlightColor: "#fee2e2",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-l-amber-500",
    badge: "bg-amber-100 text-amber-700 ring-amber-200",
    icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
    label: "Warning",
    highlightColor: "#fef3c7",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-l-blue-500",
    badge: "bg-blue-100 text-blue-700 ring-blue-200",
    icon: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
    label: "Info",
    highlightColor: "#dbeafe",
  },
};

/** Light green for template substitutions (party names, jurisdiction, date) */
const TEMPLATE_HIGHLIGHT_COLOR = "#dcfce7";

// ---------------------------------------------------------------------------
// Remove highlight marks from nodes with dataJumpPhrase in reviewedPhrases.
// Preserves current text (including user edits); only removes the highlight.
// ---------------------------------------------------------------------------
function removeTemplateHighlightMarks(
  editor: ReturnType<typeof useEditor>,
  reviewedPhrases: Set<string>,
) {
  if (!editor || reviewedPhrases.size === 0) return;
  const { state } = editor;
  const { schema } = state;
  const highlightMarkType = schema.marks.highlight;
  if (!highlightMarkType) return;

  const tr = state.tr;
  let modified = false;

  state.doc.descendants((node, pos) => {
    if (!node.isText || !node.marks.length) return;
    for (const mark of node.marks) {
      if (mark.type === highlightMarkType) {
        const phrase = mark.attrs?.dataJumpPhrase;
        if (phrase && reviewedPhrases.has(phrase)) {
          const from = pos;
          const to = pos + node.nodeSize;
          tr.removeMark(from, to, mark);
          modified = true;
          break;
        }
      }
    }
  });

  if (modified) editor.view.dispatch(tr);
}

// ---------------------------------------------------------------------------
// Phrase-based highlight: find ranges and build segments
// ---------------------------------------------------------------------------
function findPhraseRanges(
  body: string,
  phrases: string[],
): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = [];
  for (const phrase of phrases) {
    if (!phrase) continue;
    let idx = body.indexOf(phrase);
    while (idx !== -1) {
      ranges.push({ start: idx, end: idx + phrase.length });
      idx = body.indexOf(phrase, idx + 1);
    }
  }
  if (ranges.length === 0) return [];
  ranges.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const prev = merged[merged.length - 1];
    if (ranges[i].start <= prev.end) {
      prev.end = Math.max(prev.end, ranges[i].end);
    } else {
      merged.push(ranges[i]);
    }
  }
  return merged;
}

function getSegments(
  body: string,
  ranges: { start: number; end: number }[],
): { text: string; highlight: boolean }[] {
  if (ranges.length === 0) return [{ text: body, highlight: false }];
  const out: { text: string; highlight: boolean }[] = [];
  let pos = 0;
  for (const r of ranges) {
    if (r.start > pos) {
      out.push({ text: body.slice(pos, r.start), highlight: false });
    }
    out.push({ text: body.slice(r.start, r.end), highlight: true });
    pos = r.end;
  }
  if (pos < body.length) {
    out.push({ text: body.slice(pos), highlight: false });
  }
  return out;
}

/** Build segments with colors: flag ranges use flagColor, template ranges use templateColor; flag wins on overlap */
function getSegmentsWithColors(
  body: string,
  flagRanges: { start: number; end: number }[],
  templateRanges: { start: number; end: number }[],
  flagColor: string,
  templateColor: string,
): { text: string; color: string | null }[] {
  type R = { start: number; end: number; type: "flag" | "template" };
  const combined: R[] = [
    ...flagRanges.map((r) => ({ ...r, type: "flag" as const })),
    ...templateRanges.map((r) => ({ ...r, type: "template" as const })),
  ].sort((a, b) => a.start - b.start);

  const result: { start: number; end: number; color: string }[] = [];
  for (const r of combined) {
    const color = r.type === "flag" ? flagColor : templateColor;
    let s = r.start;
    const end = r.end;
    for (const existing of [...result]) {
      if (existing.end <= s || existing.start >= end) continue;
      if (existing.start > s) {
        result.push({ start: s, end: existing.start, color });
      }
      s = Math.max(s, existing.end);
    }
    if (s < end) result.push({ start: s, end, color });
  }
  result.sort((a, b) => a.start - b.start);

  if (result.length === 0) return [{ text: body, color: null }];
  const out: { text: string; color: string | null }[] = [];
  let pos = 0;
  for (const r of result) {
    if (r.start > pos) out.push({ text: body.slice(pos, r.start), color: null });
    out.push({ text: body.slice(r.start, r.end), color: r.color });
    pos = r.end;
  }
  if (pos < body.length) out.push({ text: body.slice(pos), color: null });
  return out;
}

// ---------------------------------------------------------------------------
// Build TipTap JSON from document sections + flag highlights + template highlights
// ---------------------------------------------------------------------------
function buildEditorContent(
  doc: ReviewDocument,
  /** Phrases to exclude from template highlighting (e.g. when flag is marked reviewed) */
  reviewedTemplatePhrases: Set<string> = new Set(),
) {
  const flagMap = new Map(doc.flags.map((f) => [f.clauseId, f]));
  const disclosing = doc.parties.find((p) => p.label === "Disclosing Party");
  const receiving = doc.parties.find((p) => p.label === "Receiving Party");
  const effectiveStr = formatDate(doc.submittedAt);
  const allTemplatePhrases = [
    disclosing?.name,
    receiving?.name,
    doc.jurisdiction,
    effectiveStr,
  ].filter(Boolean) as string[];
  const templatePhrases = allTemplatePhrases.filter(
    (p) => !reviewedTemplatePhrases.has(p),
  );

  const nodes: object[] = [];

  for (const section of doc.content) {
    nodes.push({
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: section.title }],
    });

    if (section.id === "signatures") {
      const blocks = section.body.split(/\n\n+/).filter(Boolean);
      for (const block of blocks) {
        const templateRanges = findPhraseRanges(block, templatePhrases);
        if (templateRanges.length > 0) {
          const segs = getSegments(block, templateRanges);
          const content = segs.map((seg) => {
            const node: Record<string, unknown> = {
              type: "text",
              text: seg.text,
            };
            if (seg.highlight) {
              node.marks = [
                {
                  type: "highlight",
                  attrs: {
                    color: TEMPLATE_HIGHLIGHT_COLOR,
                    dataJumpPhrase: seg.text,
                  },
                },
              ];
            }
            return node;
          });
          nodes.push({ type: "paragraph", content });
        } else {
          nodes.push({
            type: "paragraph",
            content: [{ type: "text", text: block }],
          });
        }
      }
      continue;
    }

    const flag = flagMap.get(section.id);
    const flagColor = flag
      ? FLAG_STYLES[flag.severity].highlightColor
      : TEMPLATE_HIGHLIGHT_COLOR;
    const flagRanges = flag?.highlightPhrases?.length
      ? findPhraseRanges(section.body, flag.highlightPhrases!)
      : [];
    const templateRanges = findPhraseRanges(section.body, templatePhrases);

    const paragraphContent: object[] = [];
    if (flagRanges.length > 0 || templateRanges.length > 0) {
      const segs = getSegmentsWithColors(
        section.body,
        flagRanges,
        templateRanges,
        flagColor,
        TEMPLATE_HIGHLIGHT_COLOR,
      );
      for (const seg of segs) {
        const textNode: Record<string, unknown> = {
          type: "text",
          text: seg.text,
        };
        if (seg.color) {
          const attrs: Record<string, unknown> = { color: seg.color };
          if (seg.color === TEMPLATE_HIGHLIGHT_COLOR) {
            attrs.dataJumpPhrase = seg.text;
          }
          textNode.marks = [{ type: "highlight", attrs }];
        }
        paragraphContent.push(textNode);
      }
    } else if (flag && flagColor !== TEMPLATE_HIGHLIGHT_COLOR) {
      paragraphContent.push({
        type: "text",
        text: section.body,
        marks: [{ type: "highlight", attrs: { color: flagColor } }],
      });
    } else {
      paragraphContent.push({ type: "text", text: section.body });
    }

    nodes.push({ type: "paragraph", content: paragraphContent });
  }

  return { type: "doc", content: nodes };
}

// ---------------------------------------------------------------------------
// Synthetic flags for template substitutions (party names, jurisdiction, date)
// ---------------------------------------------------------------------------
type DisplayFlag = Flag & { jumpPhrase?: string };

function getTemplateFlags(doc: ReviewDocument): DisplayFlag[] {
  const disclosing = doc.parties.find((p) => p.label === "Disclosing Party");
  const receiving = doc.parties.find((p) => p.label === "Receiving Party");
  const effectiveStr = formatDate(doc.submittedAt);
  const flags: DisplayFlag[] = [];

  if (disclosing?.name) {
    flags.push({
      id: "template-disclosing",
      severity: "info",
      clauseId: "clause-1",
      clauseTitle: "1. Parties",
      issue: `Disclosing Party: ${disclosing.name}. Please confirm this value is correct.`,
      suggestion: "No change needed if correct.",
      documentValue: disclosing.name,
      jumpPhrase: disclosing.name,
    });
  }
  if (receiving?.name) {
    flags.push({
      id: "template-receiving",
      severity: "info",
      clauseId: "clause-1",
      clauseTitle: "1. Parties",
      issue: `Receiving Party: ${receiving.name}. Please confirm this value is correct.`,
      suggestion: "No change needed if correct.",
      documentValue: receiving.name,
      jumpPhrase: receiving.name,
    });
  }
  if (doc.jurisdiction) {
    flags.push({
      id: "template-governing",
      severity: "info",
      clauseId: "clause-12",
      clauseTitle: "12. Governing Law",
      issue: `Governing law: ${doc.jurisdiction}. Please confirm this is correct.`,
      suggestion: "No change needed if correct.",
      documentValue: doc.jurisdiction,
      jumpPhrase: doc.jurisdiction,
    });
  }
  if (effectiveStr) {
    flags.push({
      id: "template-effective",
      severity: "info",
      clauseId: "signatures",
      clauseTitle: "Signatures",
      issue: `Effective date: ${effectiveStr}. Please confirm this is correct.`,
      suggestion: "No change needed if correct.",
      documentValue: effectiveStr,
      jumpPhrase: effectiveStr,
    });
  }
  return flags;
}

// ---------------------------------------------------------------------------
// Download helper
// ---------------------------------------------------------------------------
function downloadDocument(doc: ReviewDocument, editorText: string) {
  const header = [
    doc.type,
    `Client: ${doc.clientName}`,
    `Parties: ${doc.parties.map((p) => `${p.label}: ${p.name}`).join(", ")}`,
    `Jurisdiction: ${doc.jurisdiction}`,
    "",
  ].join("\n");

  const blob = new Blob([header + editorText], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `NDA-${doc.clientName.replace(/\s+/g, "-")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------
function EditorToolbar({
  editor,
  isEditable,
  onToggleEditable,
}: {
  editor: ReturnType<typeof useEditor> | null;
  isEditable: boolean;
  onToggleEditable: () => void;
}) {
  if (!editor) return null;

  const btn = (
    label: string,
    action: () => void,
    isActive: boolean,
    title?: string,
  ) => (
    <button
      type="button"
      onClick={action}
      title={title ?? label}
      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
        isActive
          ? "bg-stone-800 text-white"
          : "text-stone-600 hover:bg-stone-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-stone-200 bg-stone-50 flex-wrap">
      {isEditable ? (
        <>
          {btn(
            "B",
            () => editor.chain().focus().toggleBold().run(),
            editor.isActive("bold"),
            "Bold",
          )}
          {btn(
            "I",
            () => editor.chain().focus().toggleItalic().run(),
            editor.isActive("italic"),
            "Italic",
          )}
          {btn(
            "S",
            () => editor.chain().focus().toggleStrike().run(),
            editor.isActive("strike"),
            "Strikethrough",
          )}
          <div className="w-px h-4 bg-stone-200 mx-1" />
          {btn(
            "H2",
            () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            editor.isActive("heading", { level: 2 }),
            "Heading 2",
          )}
          {btn(
            "H3",
            () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            editor.isActive("heading", { level: 3 }),
            "Heading 3",
          )}
          <div className="w-px h-4 bg-stone-200 mx-1" />
          {btn(
            "UL",
            () => editor.chain().focus().toggleBulletList().run(),
            editor.isActive("bulletList"),
            "Bullet list",
          )}
          {btn(
            "OL",
            () => editor.chain().focus().toggleOrderedList().run(),
            editor.isActive("orderedList"),
            "Ordered list",
          )}
          <div className="w-px h-4 bg-stone-200 mx-1" />
          {btn("—", () => editor.chain().focus().undo().run(), false, "Undo")}
          {btn("↷", () => editor.chain().focus().redo().run(), false, "Redo")}
        </>
      ) : (
        <span className="text-xs text-stone-400 italic px-1">
          Read-only — click Edit to make changes
        </span>
      )}
      <div className="ml-auto">
        <button
          type="button"
          onClick={onToggleEditable}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium border transition-colors ${
            isEditable
              ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
          }`}
        >
          {isEditable ? (
            <>
              <Eye className="w-3.5 h-3.5" /> Preview
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function FlagCard({
  flag,
  onJump,
  isReviewed,
  onToggleReviewed,
}: {
  flag: DisplayFlag;
  onJump: (flag: DisplayFlag) => void;
  isReviewed?: boolean;
  onToggleReviewed?: (id: string) => void;
}) {
  const style = FLAG_STYLES[flag.severity];
  const hasDiff =
    flag.templateValue != null ||
    flag.documentValue != null ||
    flag.standardValue != null;
  return (
    <div
      className={`rounded-lg border border-stone-200 bg-white p-3 ${style.bg}`}
    >
      <div className="flex items-start gap-2">
        {style.icon}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ring-1 ${style.badge}`}
            >
              {style.label}
            </span>
            <p className="text-xs font-medium text-stone-600">
              {flag.clauseTitle}
            </p>
            {onToggleReviewed && (
              <button
                type="button"
                onClick={() => onToggleReviewed(flag.id)}
                className={`ml-auto text-xs font-medium px-2 py-0.5 rounded transition-colors ${
                  isReviewed
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-amber-700 hover:bg-amber-50"
                }`}
              >
                {isReviewed ? "✓ Reviewed" : "Mark reviewed"}
              </button>
            )}
          </div>
          {hasDiff && (
            <div className="mt-2 p-2 rounded border border-stone-100 bg-white/60 text-xs space-y-1">
              <p className="text-stone-500 font-medium">Template vs document</p>
              {flag.templateValue != null && (
                <div className="flex gap-2">
                  <span className="text-stone-400 shrink-0">Template:</span>
                  <span className="text-stone-500 truncate">
                    {flag.templateValue}
                  </span>
                </div>
              )}
              {flag.documentValue != null && (
                <div className="flex gap-2">
                  <span className="text-stone-400 shrink-0">Document:</span>
                  <span className="text-stone-700 font-medium truncate">
                    {flag.documentValue}
                  </span>
                </div>
              )}
              {flag.standardValue != null && (
                <div className="flex gap-2">
                  <span className="text-stone-400 shrink-0">Standard:</span>
                  <span className="text-amber-700 truncate">
                    {flag.standardValue}
                  </span>
                </div>
              )}
            </div>
          )}
          <p className="text-sm text-stone-800 mt-2">{flag.issue}</p>
          <p className="text-sm text-stone-600 mt-2 pt-2 border-t border-stone-100">
            <span className="font-medium">Suggestion: </span>
            {flag.suggestion}
          </p>
          <button
            type="button"
            onClick={() => onJump(flag)}
            className="mt-2 text-xs font-medium text-amber-700 hover:text-amber-900"
          >
            {flag.jumpPhrase ? "Jump to value →" : "Jump to clause →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const doc = id ? getDocument(id) : undefined;
  const { approve: markApproved, markInReview } = useApproved();

  const [isEditable, setIsEditable] = useState(false);
  const [reviewedFlagIds, setReviewedFlagIds] = useState<Set<string>>(
    new Set(),
  );

  const handleToggleFlagReviewed = useCallback(
    (flagId: string) => {
      const isAdding = !reviewedFlagIds.has(flagId);
      setReviewedFlagIds((prev) => {
        const next = new Set(prev);
        if (next.has(flagId)) next.delete(flagId);
        else next.add(flagId);
        return next;
      });
      if (isAdding && doc) markInReview(doc.id);
    },
    [doc, markInReview, reviewedFlagIds],
  );

  const allFlags = useMemo(
    (): DisplayFlag[] =>
      doc ? [...getTemplateFlags(doc), ...doc.flags] : [],
    [doc],
  );

  const reviewedTemplatePhrases = useMemo(() => {
    const phrases = new Set<string>();
    for (const flag of allFlags) {
      if (flag.jumpPhrase && reviewedFlagIds.has(flag.id)) {
        phrases.add(flag.jumpPhrase);
      }
    }
    return phrases;
  }, [allFlags, reviewedFlagIds]);

  const prevReviewedPhrasesRef = useRef<Set<string>>(new Set());

  const allFlagsReviewed =
    allFlags.length === 0 || allFlags.every((f) => reviewedFlagIds.has(f.id));

  const canApprove = doc && allFlagsReviewed;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      HighlightWithField.configure({ multicolor: true }),
    ],
    content: doc ? buildEditorContent(doc, new Set()) : "",
    editable: isEditable,
    editorProps: {
      attributes: {
        class:
          "prose prose-stone max-w-none focus:outline-none font-serif text-stone-800 text-[15px] leading-relaxed",
      },
    },
  });

  useEffect(() => {
    if (!editor || !doc) return;
    const prev = prevReviewedPhrasesRef.current;
    const curr = reviewedTemplatePhrases;
    const lostPhrases = [...prev].filter((p) => !curr.has(p));
    if (lostPhrases.length > 0) {
      // Un-mark: need to rebuild to add highlights back (will revert edits in those areas)
      editor.commands.setContent(
        buildEditorContent(doc, reviewedTemplatePhrases),
      );
    } else if (curr.size > 0) {
      // Mark as reviewed: remove highlight marks only, preserve current text
      removeTemplateHighlightMarks(editor, curr);
    }
    prevReviewedPhrasesRef.current = new Set(curr);
  }, [editor, doc, reviewedTemplatePhrases]);

  const toggleEditable = useCallback(() => {
    setIsEditable((prev) => {
      const next = !prev;
      editor?.setEditable(next);
      return next;
    });
  }, [editor]);

  // Scroll editor to the paragraph that contains the clause text
  const jumpToClause = useCallback(
    (clauseId: string) => {
      if (!editor || !doc) return;
      const section = doc.content.find((s) => s.id === clauseId);
      if (!section) return;

      // Find the text position of the clause title heading in the doc
      const { state } = editor;
      let targetPos: number | null = null;
      state.doc.descendants((node, pos) => {
        if (
          targetPos === null &&
          node.isText &&
          node.text?.includes(section.title)
        ) {
          targetPos = pos;
        }
      });

      if (targetPos !== null) {
        editor.commands.setTextSelection(targetPos);
        const domNode = editor.view.domAtPos(targetPos).node as HTMLElement;
        domNode?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      }
    },
    [editor, doc],
  );

  const jumpToPhrase = useCallback(
    (phrase: string) => {
      if (!editor || !phrase) return;

      const editorDom = editor.view.dom;
      const candidates = editorDom.querySelectorAll("[data-jump-phrase]");
      const el = Array.from(candidates).find(
        (e) => e.getAttribute("data-jump-phrase") === phrase,
      ) as HTMLElement | undefined;

      if (el) {
        editor.commands.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
        return;
      }

      const { state } = editor;
      const fullText = state.doc.textContent;
      const charOffset = fullText.indexOf(phrase);
      if (charOffset === -1) return;

      let currentOffset = 0;
      let targetPos: number | null = null;
      state.doc.descendants((node, pos) => {
        if (targetPos !== null) return;
        if (node.isText && node.text) {
          const len = node.text.length;
          if (
            charOffset >= currentOffset &&
            charOffset < currentOffset + len
          ) {
            targetPos = pos + 1 + (charOffset - currentOffset);
            return false;
          }
          currentOffset += len;
        }
      });

      if (targetPos !== null) {
        editor
          .chain()
          .focus()
          .setTextSelection({
            from: targetPos,
            to: targetPos + phrase.length,
          })
          .run();
        const domNode = editor.view.domAtPos(targetPos).node as HTMLElement;
        domNode?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      }
    },
    [editor],
  );

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

  const criticalCount = allFlags.filter(
    (f) => f.severity === "critical",
  ).length;
  const warningCount = allFlags.filter((f) => f.severity === "warning").length;

  return (
    <div className="h-screen flex flex-col bg-stone-50">
      {/* Top bar */}
      <header className="bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to queue
          </Link>
          <span className="text-stone-300">|</span>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-stone-500" />
            <span className="font-medium text-stone-900">{doc.type}</span>
            <span className="text-stone-500">— {doc.clientName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Flag summary */}
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 ring-1 ring-red-200 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 ring-1 ring-amber-200 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {warningCount} warning
            </span>
          )}
          <button
            type="button"
            onClick={() => downloadDocument(doc, editor?.getText() ?? "")}
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg px-3 py-1.5 ml-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            type="button"
            onClick={() => downloadAsPdf(doc, editor?.getText() ?? undefined)}
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg px-3 py-1.5"
          >
            <FileDown className="w-4 h-4" />
            PDF
          </button>
        </div>
      </header>

      {/* Split pane */}
      <div className="flex-1 flex min-h-0">
        {/* Left: TipTap rich text editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-stone-200 bg-white">
          <EditorToolbar
            editor={editor}
            isEditable={isEditable}
            onToggleEditable={toggleEditable}
          />
          <div className="flex-1 overflow-auto relative">
            <div className="max-w-2xl mx-auto py-10 px-10">
              {/* Document header */}
              <div className="mb-8 pb-6 border-b border-stone-100">
                <h1 className="text-2xl font-semibold text-stone-900 mb-1">
                  {doc.type}
                </h1>
                <p className="text-sm text-stone-500">
                  {doc.parties.map((p) => `${p.label}: ${p.name}`).join(" · ")}{" "}
                  · {doc.jurisdiction}
                </p>
                {allFlags.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    Highlighted sections have AI-flagged issues — review all flags
                    in the panel on the right
                  </div>
                )}
              </div>
              {/* TipTap editor */}
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Right: AI flags + actions */}
        <aside className="w-[380px] shrink-0 flex flex-col bg-stone-50 border-l border-stone-200">
          <div className="p-4 border-b border-stone-200 bg-white">
            <h2 className="text-sm font-semibold text-stone-900">
              AI review flags
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {doc.flags.length === 0
                ? "No issues flagged"
                : `${allFlags.length} issue${allFlags.length !== 1 ? "s" : ""} — flagged clauses are highlighted in the editor`}
            </p>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {allFlags.length === 0 ? (
              <p className="text-sm text-stone-500 italic">
                No flags for this document. You can approve when ready.
              </p>
            ) : (
              allFlags.map((flag) => (
                <FlagCard
                  key={flag.id}
                  flag={flag}
                  onJump={(f) =>
                    f.jumpPhrase
                      ? jumpToPhrase(f.jumpPhrase)
                      : jumpToClause(f.clauseId)
                  }
                  isReviewed={reviewedFlagIds.has(flag.id)}
                  onToggleReviewed={handleToggleFlagReviewed}
                />
              ))
            )}
          </div>

          <div className="p-4 border-t border-stone-200 bg-white">
            <button
              type="button"
              onClick={() => {
                markApproved(doc.id);
                router.push(`/approved/${doc.id}`);
              }}
              disabled={!canApprove}
              title={
                !canApprove
                  ? "Mark all AI flags as reviewed first"
                  : undefined
              }
              className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                canApprove
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-stone-200 text-stone-500 cursor-not-allowed"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Document
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
