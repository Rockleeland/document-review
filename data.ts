import { NDA_SECTIONS, populateNdaSections } from "@/nda-template";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export type DocumentStatus = "pending" | "in_review" | "approved" | "returned";
export type FlagSeverity = "critical" | "warning" | "info";

export interface Flag {
  id: string;
  severity: FlagSeverity;
  clauseId: string;
  clauseTitle: string;
  issue: string;
  suggestion: string;
  /** Template/default value for diff display */
  templateValue?: string;
  /** Actual value in document for diff display */
  documentValue?: string;
  /** Industry standard or recommended value (optional) */
  standardValue?: string;
  /** Exact phrase(s) to highlight in the clause body (highlights only these spans) */
  highlightPhrases?: string[];
}

export interface DocumentSection {
  id: string;
  title: string;
  body: string;
  flagId?: string;
  flagSeverity?: FlagSeverity;
}

export interface ReviewDocument {
  id: string;
  type: string;
  clientName: string;
  parties: { label: string; name: string }[];
  jurisdiction: string;
  submittedAt: string;
  slaDeadline: string;
  status: DocumentStatus;
  assignedTo: string;
  flags: Flag[];
  content: DocumentSection[];
}

// ---------------------------------------------------------------------------
// doc-001: Acme Corp NDA — pending, multiple AI flags
// ---------------------------------------------------------------------------
const acmeSubmittedAt = "2026-03-08T06:00:00Z";
const acmeSections = populateNdaSections(NDA_SECTIONS, {
  disclosingParty: "Acme Corp",
  disclosingState: "Delaware",
  disclosingEntityType: "corporation",
  receivingParty: "Vertex Solutions LLC",
  receivingState: "California",
  receivingEntityType: "limited liability company",
  governingState: "Delaware",
  disclosingSignatureDate: formatDate(acmeSubmittedAt),
  receivingSignatureDate: formatDate(acmeSubmittedAt),
});

const acmeFlags: Flag[] = [
  {
    id: "f1",
    severity: "critical",
    clauseId: "clause-4",
    clauseTitle: "4. Obligations of Receiving Party",
    issue:
      "Clause (e) prohibits reverse engineering but omits the standard carve-out for interoperability permitted under 17 U.S.C. § 1201(f). A California court could strike the entire sub-clause.",
    suggestion:
      'Add: "except to the extent expressly permitted by applicable law, including 17 U.S.C. § 1201(f) regarding interoperability."',
    highlightPhrases: ["reverse engineer, disassemble, or decompile"],
  },
  {
    id: "f2",
    severity: "info",
    clauseId: "clause-12",
    clauseTitle: "12. Governing Law",
    issue:
      "Governing law is set to Delaware. Confirm this matches the parties' intent and the Disclosing Party's state of incorporation.",
    suggestion:
      "Based on Acme Corp's Delaware incorporation, Delaware is appropriate. No change needed unless otherwise agreed.",
    templateValue: "[GOVERNING_STATE]",
    documentValue: "Delaware",
    standardValue: "Delaware",
    highlightPhrases: ["Delaware"],
  },
  {
    id: "f3",
    severity: "warning",
    clauseId: "clause-5",
    clauseTitle: "5. Exclusions from Confidential Information",
    issue:
      'Exclusion (b) uses "becomes publicly known" rather than "becomes publicly known through no act or omission of the Receiving Party." The current wording may inadvertently exclude information leaked by a third-party breach.',
    suggestion:
      'Narrow to: "becomes publicly known through no act or omission of the Receiving Party."',
    highlightPhrases: ["becomes publicly known"],
  },
  {
    id: "f4",
    severity: "info",
    clauseId: "clause-3",
    clauseTitle: "3. Definition of Confidential Information",
    issue:
      "Oral disclosure confirmation window is 30 days. Some clients prefer 7 days for tighter compliance. Confirm this is intentional.",
    suggestion:
      "30 days is the industry standard and recommended. No change needed unless client specifically requests 7 days.",
    highlightPhrases: ["thirty (30) days"],
  },
];

const acmeContent: DocumentSection[] = acmeSections.map((s) => {
  const flag = acmeFlags.find((f) => f.clauseId === s.id);
  return {
    ...s,
    flagId: flag?.id,
    flagSeverity: flag?.severity,
  };
});

// ---------------------------------------------------------------------------
// doc-002: Brightline Tech NDA — pending, one warning flag
// ---------------------------------------------------------------------------
const brightlineSubmittedAt = "2026-03-08T04:30:00Z";
const brightlineSections = populateNdaSections(NDA_SECTIONS, {
  disclosingParty: "Brightline Technologies Inc",
  disclosingState: "Washington",
  disclosingEntityType: "corporation",
  receivingParty: "Nova Dynamics LLC",
  receivingState: "Texas",
  receivingEntityType: "limited liability company",
  governingState: "Washington",
  disclosingSignatureDate: formatDate(brightlineSubmittedAt),
  receivingSignatureDate: formatDate(brightlineSubmittedAt),
});

const brightlineFlags: Flag[] = [
  {
    id: "f5",
    severity: "warning",
    clauseId: "clause-7",
    clauseTitle: "7. Term and Termination",
    issue:
      "The 5-year post-termination confidentiality tail is longer than the default industry standard of 2–3 years. Nova Dynamics may push back.",
    suggestion:
      'Consider reducing to 3 years: "for a period of three (3) years from the date of termination."',
    templateValue: "5 years",
    documentValue: "5 years",
    standardValue: "2–3 years",
    highlightPhrases: ["five (5) years"],
  },
];

const brightlineContent: DocumentSection[] = brightlineSections.map((s) => {
  const flag = brightlineFlags.find((f) => f.clauseId === s.id);
  return {
    ...s,
    flagId: flag?.id,
    flagSeverity: flag?.severity,
  };
});

// ---------------------------------------------------------------------------
// doc-003: Meridian Capital NDA — in_review, no flags
// ---------------------------------------------------------------------------
const meridianSubmittedAt = "2026-03-08T03:00:00Z";
const meridianSections = populateNdaSections(NDA_SECTIONS, {
  disclosingParty: "Meridian Capital Partners LP",
  disclosingState: "New York",
  disclosingEntityType: "limited partnership",
  receivingParty: "Solaris Ventures LLC",
  receivingState: "Florida",
  receivingEntityType: "limited liability company",
  governingState: "New York",
  disclosingSignatureDate: formatDate(meridianSubmittedAt),
  receivingSignatureDate: formatDate(meridianSubmittedAt),
});

const meridianContent: DocumentSection[] = meridianSections.map((s) => ({
  ...s,
}));

// ---------------------------------------------------------------------------
// doc-004: Summit Ventures NDA — in_review, one info flag
// ---------------------------------------------------------------------------
const summitSubmittedAt = "2026-03-07T14:00:00Z";
const summitSections = populateNdaSections(NDA_SECTIONS, {
  disclosingParty: "Summit Ventures Inc",
  disclosingState: "Colorado",
  disclosingEntityType: "corporation",
  receivingParty: "Atlas Consulting LLC",
  receivingState: "Illinois",
  receivingEntityType: "limited liability company",
  governingState: "Colorado",
  disclosingSignatureDate: formatDate(summitSubmittedAt),
  receivingSignatureDate: formatDate(summitSubmittedAt),
});

const summitFlags: Flag[] = [
  {
    id: "f6",
    severity: "info",
    clauseId: "clause-3",
    clauseTitle: "3. Definition of Confidential Information",
    issue:
      "Oral disclosure confirmation window is 30 days. Confirm this is intentional for Summit's workflow.",
    suggestion: "30 days is standard. No change needed unless client requests 7 days.",
    highlightPhrases: ["thirty (30) days"],
  },
];

const summitContent: DocumentSection[] = summitSections.map((s) => {
  const flag = summitFlags.find((f) => f.clauseId === s.id);
  return { ...s, flagId: flag?.id, flagSeverity: flag?.severity };
});

// ---------------------------------------------------------------------------
// doc-005: Northgate Partners NDA — approved, no flags
// ---------------------------------------------------------------------------
const northgateSubmittedAt = "2026-03-06T10:00:00Z";
const northgateSections = populateNdaSections(NDA_SECTIONS, {
  disclosingParty: "Northgate Partners LLC",
  disclosingState: "Massachusetts",
  disclosingEntityType: "limited liability company",
  receivingParty: "Horizon Labs Inc",
  receivingState: "California",
  receivingEntityType: "corporation",
  governingState: "Massachusetts",
  disclosingSignatureDate: formatDate(northgateSubmittedAt),
  receivingSignatureDate: formatDate(northgateSubmittedAt),
});

const northgateContent: DocumentSection[] = northgateSections.map((s) => ({ ...s }));

// ---------------------------------------------------------------------------
// doc-006: Pacific Rim NDA — pending, no flags
// ---------------------------------------------------------------------------
const pacificSubmittedAt = "2026-03-05T08:00:00Z";
const pacificSections = populateNdaSections(NDA_SECTIONS, {
  disclosingParty: "Pacific Rim Industries",
  disclosingState: "California",
  disclosingEntityType: "corporation",
  receivingParty: "Eastern Trade Co LLC",
  receivingState: "New Jersey",
  receivingEntityType: "limited liability company",
  governingState: "California",
  disclosingSignatureDate: formatDate(pacificSubmittedAt),
  receivingSignatureDate: formatDate(pacificSubmittedAt),
});

const pacificContent: DocumentSection[] = pacificSections.map((s) => ({ ...s }));

// ---------------------------------------------------------------------------
// doc-007: Stellar Dynamics NDA — pending, no flags
// ---------------------------------------------------------------------------
const stellarSubmittedAt = "2026-03-08T08:00:00Z";
const stellarSections = populateNdaSections(NDA_SECTIONS, {
  disclosingParty: "Stellar Dynamics Inc",
  disclosingState: "Texas",
  disclosingEntityType: "corporation",
  receivingParty: "Orbit Solutions LLC",
  receivingState: "Georgia",
  receivingEntityType: "limited liability company",
  governingState: "Texas",
  disclosingSignatureDate: formatDate(stellarSubmittedAt),
  receivingSignatureDate: formatDate(stellarSubmittedAt),
});

const stellarContent: DocumentSection[] = stellarSections.map((s) => ({ ...s }));

// ---------------------------------------------------------------------------
// doc-008: Apex Legal NDA — in_review, warnings
// ---------------------------------------------------------------------------
const apexSubmittedAt = "2026-03-07T12:00:00Z";
const apexSections = populateNdaSections(NDA_SECTIONS, {
  disclosingParty: "Apex Legal Services PC",
  disclosingState: "District of Columbia",
  disclosingEntityType: "professional corporation",
  receivingParty: "Benchmark Advisors LLC",
  receivingState: "Virginia",
  receivingEntityType: "limited liability company",
  governingState: "District of Columbia",
  disclosingSignatureDate: formatDate(apexSubmittedAt),
  receivingSignatureDate: formatDate(apexSubmittedAt),
});

const apexFlags: Flag[] = [
  {
    id: "f8",
    severity: "warning",
    clauseId: "clause-7",
    clauseTitle: "7. Term and Termination",
    issue: "5-year confidentiality tail may be longer than counterparty expects.",
    suggestion: 'Consider reducing to 3 years: "for a period of three (3) years from the date of termination."',
    highlightPhrases: ["five (5) years"],
  },
];

const apexContent: DocumentSection[] = apexSections.map((s) => {
  const flag = apexFlags.find((f) => f.clauseId === s.id);
  return { ...s, flagId: flag?.id, flagSeverity: flag?.severity };
});

// ---------------------------------------------------------------------------
// Exported documents array
// ---------------------------------------------------------------------------
export const documents: ReviewDocument[] = [
  {
    id: "doc-001",
    type: "Non-Disclosure Agreement",
    clientName: "Acme Corp",
    parties: [
      { label: "Disclosing Party", name: "Acme Corp" },
      { label: "Receiving Party", name: "Vertex Solutions LLC" },
    ],
    jurisdiction: "Delaware",
    submittedAt: acmeSubmittedAt,
    slaDeadline: "2026-03-08T12:00:00Z",
    status: "pending",
    assignedTo: "Sarah Mitchell",
    flags: acmeFlags,
    content: acmeContent,
  },
  {
    id: "doc-002",
    type: "Non-Disclosure Agreement",
    clientName: "Brightline Technologies",
    parties: [
      { label: "Disclosing Party", name: "Brightline Technologies Inc" },
      { label: "Receiving Party", name: "Nova Dynamics LLC" },
    ],
    jurisdiction: "Washington",
    submittedAt: brightlineSubmittedAt,
    slaDeadline: "2026-03-08T18:00:00Z",
    status: "pending",
    assignedTo: "Sarah Mitchell",
    flags: brightlineFlags,
    content: brightlineContent,
  },
  {
    id: "doc-003",
    type: "Non-Disclosure Agreement",
    clientName: "Meridian Capital",
    parties: [
      { label: "Disclosing Party", name: "Meridian Capital Partners LP" },
      { label: "Receiving Party", name: "Solaris Ventures LLC" },
    ],
    jurisdiction: "New York",
    submittedAt: meridianSubmittedAt,
    slaDeadline: "2026-03-09T09:00:00Z",
    status: "approved",
    assignedTo: "James Okoye",
    flags: [],
    content: meridianContent,
  },
  {
    id: "doc-004",
    type: "Non-Disclosure Agreement",
    clientName: "Summit Ventures",
    parties: [
      { label: "Disclosing Party", name: "Summit Ventures Inc" },
      { label: "Receiving Party", name: "Atlas Consulting LLC" },
    ],
    jurisdiction: "Colorado",
    submittedAt: summitSubmittedAt,
    slaDeadline: "2026-03-09T18:00:00Z",
    status: "in_review",
    assignedTo: "Sarah Mitchell",
    flags: summitFlags,
    content: summitContent,
  },
  {
    id: "doc-005",
    type: "Non-Disclosure Agreement",
    clientName: "Northgate Partners",
    parties: [
      { label: "Disclosing Party", name: "Northgate Partners LLC" },
      { label: "Receiving Party", name: "Horizon Labs Inc" },
    ],
    jurisdiction: "Massachusetts",
    submittedAt: northgateSubmittedAt,
    slaDeadline: "2026-03-08T22:00:00Z",
    status: "approved",
    assignedTo: "James Okoye",
    flags: [],
    content: northgateContent,
  },
  {
    id: "doc-006",
    type: "Non-Disclosure Agreement",
    clientName: "Pacific Rim Industries",
    parties: [
      { label: "Disclosing Party", name: "Pacific Rim Industries" },
      { label: "Receiving Party", name: "Eastern Trade Co LLC" },
    ],
    jurisdiction: "California",
    submittedAt: pacificSubmittedAt,
    slaDeadline: "2026-03-07T12:00:00Z",
    status: "pending",
    assignedTo: "Sarah Mitchell",
    flags: [],
    content: pacificContent,
  },
  {
    id: "doc-007",
    type: "Non-Disclosure Agreement",
    clientName: "Stellar Dynamics",
    parties: [
      { label: "Disclosing Party", name: "Stellar Dynamics Inc" },
      { label: "Receiving Party", name: "Orbit Solutions LLC" },
    ],
    jurisdiction: "Texas",
    submittedAt: stellarSubmittedAt,
    slaDeadline: "2026-03-10T14:00:00Z",
    status: "pending",
    assignedTo: "James Okoye",
    flags: [],
    content: stellarContent,
  },
  {
    id: "doc-008",
    type: "Non-Disclosure Agreement",
    clientName: "Apex Legal",
    parties: [
      { label: "Disclosing Party", name: "Apex Legal Services PC" },
      { label: "Receiving Party", name: "Benchmark Advisors LLC" },
    ],
    jurisdiction: "District of Columbia",
    submittedAt: apexSubmittedAt,
    slaDeadline: "2026-03-09T20:00:00Z",
    status: "in_review",
    assignedTo: "James Okoye",
    flags: apexFlags,
    content: apexContent,
  },
];

export function getDocument(id: string): ReviewDocument | undefined {
  return documents.find((d) => d.id === id);
}

export function getSlaStatus(deadline: string): "critical" | "warning" | "ok" {
  const now = new Date();
  const due = new Date(deadline);
  const hoursRemaining = (due.getTime() - now.getTime()) / 1000 / 60 / 60;
  if (hoursRemaining < 4) return "critical";
  if (hoursRemaining < 12) return "warning";
  return "ok";
}

export function formatDeadline(deadline: string): string {
  const now = new Date();
  const due = new Date(deadline);
  const hoursRemaining = (due.getTime() - now.getTime()) / 1000 / 60 / 60;
  if (hoursRemaining < 0) return "Overdue";
  if (hoursRemaining < 1)
    return `${Math.round(hoursRemaining * 60)}m remaining`;
  if (hoursRemaining < 24) return `${Math.round(hoursRemaining)}h remaining`;
  return `${Math.round(hoursRemaining / 24)}d remaining`;
}
