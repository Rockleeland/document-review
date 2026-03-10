/**
 * Standard One-Way Non-Disclosure Agreement Template
 *
 * Source: Based on the standard one-way NDA structure from UpCounsel
 * (https://www.upcounsel.com/one-way-non-disclosure-agreement)
 *
 * This file is the single source of truth for NDA document content.
 * All NDA documents in the application are seeded from these sections.
 * Placeholder values (e.g. [DISCLOSING_PARTY]) are substituted at runtime.
 */

export interface NdaSection {
  id: string;
  title: string;
  body: string;
}

export const NDA_SECTIONS: NdaSection[] = [
  {
    id: "clause-1",
    title: "1. Parties",
    body: 'This Non-Disclosure Agreement ("Agreement") is entered into as of the date last signed below (the "Effective Date") by and between [DISCLOSING_PARTY], a [DISCLOSING_STATE] [DISCLOSING_ENTITY_TYPE] ("Disclosing Party"), and [RECEIVING_PARTY], a [RECEIVING_STATE] [RECEIVING_ENTITY_TYPE] ("Receiving Party"). Disclosing Party and Receiving Party are each referred to herein as a "Party" and collectively as the "Parties."',
  },
  {
    id: "clause-2",
    title: "2. Purpose",
    body: 'The Parties wish to explore a potential business relationship (the "Purpose"). In connection with the Purpose, Disclosing Party may disclose to Receiving Party certain confidential and proprietary information. This Agreement sets forth the terms and conditions under which such information may be disclosed and used.',
  },
  {
    id: "clause-3",
    title: "3. Definition of Confidential Information",
    body: '"Confidential Information" means any information or data, regardless of whether it is in tangible form, disclosed by Disclosing Party that Disclosing Party designates as being confidential or which, under the circumstances of disclosure, ought to be treated as confidential. Confidential Information includes, without limitation, research, product plans, products, services, customers, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, and other business information. Confidential Information disclosed in oral form shall be designated as confidential at the time of disclosure and confirmed in a written summary within thirty (30) days of disclosure.',
  },
  {
    id: "clause-4",
    title: "4. Obligations of Receiving Party",
    body: "The Receiving Party shall: (a) hold the Confidential Information in strict confidence and take all reasonable precautions to protect such Confidential Information (including, without limitation, all precautions the Receiving Party employs with respect to its own confidential materials); (b) not disclose any Confidential Information or any information derived therefrom to any third party without the prior written consent of Disclosing Party; (c) use the Confidential Information solely for the Purpose and for no other purpose whatsoever; (d) not copy or reproduce the Confidential Information except as reasonably necessary for the Purpose; and (e) not reverse engineer, disassemble, or decompile any prototypes, software, or other tangible objects that embody the Confidential Information.",
  },
  {
    id: "clause-5",
    title: "5. Exclusions from Confidential Information",
    body: "Receiving Party's obligations under this Agreement do not apply to information that: (a) was rightfully known to Receiving Party without restriction on disclosure prior to receipt from Disclosing Party; (b) becomes publicly known through no act or omission of the Receiving Party; (c) is rightfully received by Receiving Party from a third party without restriction on disclosure; or (d) is independently developed by Receiving Party without use of or reference to Disclosing Party's Confidential Information. In addition, Receiving Party may disclose Confidential Information to the extent required by applicable law, regulation, or court order, provided that Receiving Party gives Disclosing Party prompt prior written notice and cooperates with Disclosing Party in seeking a protective order.",
  },
  {
    id: "clause-6",
    title: "6. No Reproduction",
    body: 'Receiving Party shall not copy or reproduce the Confidential Information except as reasonably necessary for the Purpose. Any permitted copies shall reproduce any proprietary or confidentiality notices appearing in the original. Receiving Party shall maintain a record of the number and location of all copies made and shall provide such record to Disclosing Party upon request.',
  },
  {
    id: "clause-7",
    title: "7. Term and Termination",
    body: "This Agreement shall be effective as of the Effective Date and shall continue in effect until terminated by either Party upon thirty (30) days prior written notice to the other Party. The obligations of confidentiality set forth in this Agreement shall survive any termination or expiration for a period of five (5) years from the date of termination. Upon termination, Receiving Party shall promptly return or certifiably destroy all Confidential Information and any copies thereof.",
  },
  {
    id: "clause-8",
    title: "8. Return of Information",
    body: "Upon the written request of Disclosing Party, or upon termination or expiration of this Agreement, Receiving Party shall promptly return to Disclosing Party all tangible materials containing Confidential Information. With respect to electronic copies, Receiving Party shall permanently delete all such files and provide written certification of such deletion within five (5) business days of the request.",
  },
  {
    id: "clause-9",
    title: "9. No License",
    body: "Nothing in this Agreement is intended to grant any rights to Receiving Party under any patent, copyright, trade secret, or other intellectual property right of Disclosing Party, nor shall this Agreement grant Receiving Party any rights in or to Disclosing Party's Confidential Information except the limited right to use such information solely for the Purpose. All Confidential Information remains the exclusive property of Disclosing Party.",
  },
  {
    id: "clause-10",
    title: "10. No Warranties",
    body: 'All Confidential Information is provided "AS IS." Disclosing Party makes no warranties, express or implied, with respect to the Confidential Information, including without limitation any warranty of accuracy, completeness, merchantability, or fitness for a particular purpose. Disclosing Party shall not be liable for any damages arising from the use of the Confidential Information by Receiving Party.',
  },
  {
    id: "clause-11",
    title: "11. Remedies",
    body: "Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to Disclosing Party for which monetary damages would be an inadequate remedy, and that Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity, without the requirement to post a bond or other security.",
  },
  {
    id: "clause-12",
    title: "12. Governing Law",
    body: "This Agreement shall be governed by and construed in accordance with the laws of the State of [GOVERNING_STATE], without regard to its conflict of law provisions. The Parties consent to the exclusive jurisdiction and venue of the state and federal courts located in [GOVERNING_STATE] for resolution of any dispute arising under this Agreement.",
  },
  {
    id: "clause-13",
    title: "13. Entire Agreement",
    body: "This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements and understandings, whether written or oral. This Agreement may not be amended or modified except by a written instrument signed by both Parties. If any provision of this Agreement is found to be unenforceable, the remainder shall be enforced as fully as possible and the unenforceable provision shall be deemed modified to the minimum extent required to permit its enforcement in a manner most closely representing the Parties' original intent.",
  },
  {
    id: "signatures",
    title: "Signatures",
    body: "IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date(s) set forth below.\n\n[DISCLOSING_PARTY]\n\nSignature: _________________________\n\nName: [DISCLOSING_SIGNATORY]\n\nTitle: [DISCLOSING_TITLE]\n\nDate: [DISCLOSING_SIGNATURE_DATE]\n\n\n[RECEIVING_PARTY]\n\nSignature: _________________________\n\nName: [RECEIVING_SIGNATORY]\n\nTitle: [RECEIVING_TITLE]\n\nDate: [RECEIVING_SIGNATURE_DATE]",
  },
];

const DEFAULT_SIGNATURE_PLACEHOLDER = "________________";

/** Substitute template placeholders with actual party information. */
export function populateNdaSections(
  sections: NdaSection[],
  vars: {
    disclosingParty: string;
    disclosingState: string;
    disclosingEntityType: string;
    receivingParty: string;
    receivingState: string;
    receivingEntityType: string;
    governingState: string;
    /** Signatory name for Disclosing Party (signature block) */
    disclosingSignatory?: string;
    /** Title for Disclosing Party signatory */
    disclosingTitle?: string;
    /** Signature date for Disclosing Party */
    disclosingSignatureDate?: string;
    /** Signatory name for Receiving Party (signature block) */
    receivingSignatory?: string;
    /** Title for Receiving Party signatory */
    receivingTitle?: string;
    /** Signature date for Receiving Party */
    receivingSignatureDate?: string;
  }
): NdaSection[] {
  const replacements: Record<string, string> = {
    "[DISCLOSING_PARTY]": vars.disclosingParty,
    "[DISCLOSING_STATE]": vars.disclosingState,
    "[DISCLOSING_ENTITY_TYPE]": vars.disclosingEntityType,
    "[RECEIVING_PARTY]": vars.receivingParty,
    "[RECEIVING_STATE]": vars.receivingState,
    "[RECEIVING_ENTITY_TYPE]": vars.receivingEntityType,
    "[GOVERNING_STATE]": vars.governingState,
    "[DISCLOSING_SIGNATORY]": vars.disclosingSignatory ?? DEFAULT_SIGNATURE_PLACEHOLDER,
    "[DISCLOSING_TITLE]": vars.disclosingTitle ?? DEFAULT_SIGNATURE_PLACEHOLDER,
    "[DISCLOSING_SIGNATURE_DATE]": vars.disclosingSignatureDate ?? DEFAULT_SIGNATURE_PLACEHOLDER,
    "[RECEIVING_SIGNATORY]": vars.receivingSignatory ?? DEFAULT_SIGNATURE_PLACEHOLDER,
    "[RECEIVING_TITLE]": vars.receivingTitle ?? DEFAULT_SIGNATURE_PLACEHOLDER,
    "[RECEIVING_SIGNATURE_DATE]": vars.receivingSignatureDate ?? DEFAULT_SIGNATURE_PLACEHOLDER,
  };

  return sections.map((section) => ({
    ...section,
    body: Object.entries(replacements).reduce(
      (text, [placeholder, value]) => text.replaceAll(placeholder, value),
      section.body
    ),
  }));
}
