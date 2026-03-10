"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY_APPROVED = "document-review-approved-ids";
const STORAGE_KEY_IN_REVIEW = "document-review-in-review-ids";

function loadApprovedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPROVED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveApprovedIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_APPROVED, JSON.stringify(ids));
  } catch {}
}

function loadInReviewIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_IN_REVIEW);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveInReviewIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_IN_REVIEW, JSON.stringify(ids));
  } catch {}
}

type ApprovedContextValue = {
  approvedIds: string[];
  isApproved: (id: string) => boolean;
  approve: (id: string) => void;
  /** Mark a document as "In Review" (user has clicked Mark reviewed on at least one flag). */
  markInReview: (id: string) => void;
  isInReview: (id: string) => boolean;
  /** Clear all approved document IDs (reset to default). */
  resetToDefault: () => void;
  /** True after localStorage has been read (avoids count flash on queue). */
  hasHydrated: boolean;
};

const ApprovedContext = createContext<ApprovedContextValue | null>(null);

export function ApprovedProvider({ children }: { children: React.ReactNode }) {
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [inReviewIds, setInReviewIds] = useState<string[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setApprovedIds(loadApprovedIds());
    setInReviewIds(loadInReviewIds());
    setHasHydrated(true);
  }, []);

  const isApproved = useCallback(
    (id: string) => approvedIds.includes(id),
    [approvedIds]
  );

  const approve = useCallback((id: string) => {
    setApprovedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveApprovedIds(next);
      return next;
    });
  }, []);

  const markInReview = useCallback((id: string) => {
    setInReviewIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveInReviewIds(next);
      return next;
    });
  }, []);

  const isInReview = useCallback(
    (id: string) => inReviewIds.includes(id),
    [inReviewIds]
  );

  const resetToDefault = useCallback(() => {
    setApprovedIds([]);
    setInReviewIds([]);
    saveApprovedIds([]);
    saveInReviewIds([]);
  }, []);

  const value = useMemo(
    () => ({
      approvedIds,
      isApproved,
      approve,
      markInReview,
      isInReview,
      resetToDefault,
      hasHydrated,
    }),
    [approvedIds, isApproved, approve, markInReview, isInReview, resetToDefault, hasHydrated]
  );

  return (
    <ApprovedContext.Provider value={value}>
      {children}
    </ApprovedContext.Provider>
  );
}

export function useApproved() {
  const ctx = useContext(ApprovedContext);
  if (!ctx) throw new Error("useApproved must be used within ApprovedProvider");
  return ctx;
}
