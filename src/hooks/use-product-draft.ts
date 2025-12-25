"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  useDraftStore,
  DRAFT_CONFIG,
  type ProductDraft,
} from "~/app/admin/_stores/draft";
import type { ProductFormValues } from "~/app/admin/_components/forms/product";

type UseProductDraftOptions = {
  form: UseFormReturn<ProductFormValues> | null;
  enabled?: boolean;
};

type UseProductDraftReturn = {
  isHydrated: boolean;
  activeDraft: ProductDraft | null;
  allDrafts: ProductDraft[];
  lastSaved: Date | null;
  isSaving: boolean;

  createNewDraft: () => void;
  switchToDraft: (draftId: string) => void;
  deleteDraft: (draftId: string) => void;
  renameDraft: (draftId: string, name: string) => void;
  discardCurrentDraft: () => void;
  clearDraftOnSubmit: () => void;

  hasDraftsToRestore: boolean;
};

const EMPTY_FORM_VALUES: ProductFormValues = {
  title: "",
  summary: "",
  description: {},
  published: false,
  price: 0,
  categoryId: 0,
  brandId: 0,
  attributeIds: [],
  media: [],
  options: [],
  originalCost: 0,
};

export function useProductDraft({
  form,
  enabled = true,
}: UseProductDraftOptions): UseProductDraftReturn {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const suppressionRef = useRef(false);
  const lastSavedSnapshotRef = useRef<string>(safeStringify(EMPTY_FORM_VALUES));

  const drafts = useDraftStore((s) => s.drafts);
  const activeDraftId = useDraftStore((s) => s.activeDraftId);
  const createDraftInStore = useDraftStore((s) => s.createDraft);
  const updateDraft = useDraftStore((s) => s.updateDraft);
  const deleteDraftFromStore = useDraftStore((s) => s.deleteDraft);
  const renameDraftInStore = useDraftStore((s) => s.renameDraft);
  const setActiveDraft = useDraftStore((s) => s.setActiveDraft);
  const getActiveDraft = useDraftStore((s) => s.getActiveDraft);
  const cleanExpiredDrafts = useDraftStore((s) => s.cleanExpiredDrafts);

  useEffect(() => {
    cleanExpiredDrafts();
    setIsHydrated(true);
  }, [cleanExpiredDrafts]);

  const [scheduleAutoSave, cancelAutoSave] = useDebouncedEffectEvent(
    (values: ProductFormValues) => {
      if (!enabled || !isHydrated || suppressionRef.current) {
        setIsSaving(false);
        return;
      }

      if (!hasMeaningfulContent(values)) {
        setIsSaving(false);
        return;
      }

      if (activeDraftId) {
        updateDraft(activeDraftId, values);
      } else {
        createDraftInStore(values);
      }

      lastSavedSnapshotRef.current = safeStringify(values);
      setLastSaved(new Date());
      setIsSaving(false);
    },
    DRAFT_CONFIG.AUTO_SAVE_DELAY_MS,
  );

  useEffect(() => {
    if (!enabled) {
      cancelAutoSave();
      setIsSaving(false);
    }
  }, [enabled, cancelAutoSave]);

  useEffect(() => {
    if (!form || !enabled) return;

    const subscription = form.watch((values) => {
      if (!values || suppressionRef.current) {
        return;
      }

      const typedValues = values as ProductFormValues;
      const serialized = safeStringify(typedValues);
      if (serialized === lastSavedSnapshotRef.current) {
        return;
      }

      setIsSaving(true);
      scheduleAutoSave(typedValues);
    });

    return () => subscription.unsubscribe();
  }, [form, enabled, scheduleAutoSave]);

  const suppressAutoSave = useCallback(
    (operation: () => void) => {
      suppressionRef.current = true;
      cancelAutoSave();
      setIsSaving(false);

      try {
        operation();
      } finally {
        setTimeout(() => {
          suppressionRef.current = false;
        }, 0);
      }
    },
    [cancelAutoSave],
  );

  const resetFormValues = useCallback(
    (values: ProductFormValues) => {
      if (!form) return;

      suppressAutoSave(() => {
        form.reset(values);
      });
    },
    [form, suppressAutoSave],
  );

  const createNewDraft = useCallback(() => {
    resetFormValues(EMPTY_FORM_VALUES);
    createDraftInStore();
    lastSavedSnapshotRef.current = safeStringify(EMPTY_FORM_VALUES);
    setLastSaved(null);
  }, [resetFormValues, createDraftInStore]);

  const switchToDraft = useCallback(
    (draftId: string) => {
      const draft = drafts.find((d) => d.id === draftId);
      if (!draft) return;

      const draftValues = {
        ...EMPTY_FORM_VALUES,
        ...draft.data,
      } as ProductFormValues;

      setActiveDraft(draftId);
      resetFormValues(draftValues);
      setLastSaved(new Date(draft.updatedAt));
      lastSavedSnapshotRef.current = safeStringify(draftValues);
    },
    [drafts, resetFormValues, setActiveDraft],
  );

  const handleDeleteDraft = useCallback(
    (draftId: string) => {
      const wasActive = draftId === activeDraftId;
      deleteDraftFromStore(draftId);

      if (wasActive) {
        setActiveDraft(null);
        resetFormValues(EMPTY_FORM_VALUES);
        setLastSaved(null);
        lastSavedSnapshotRef.current = safeStringify(EMPTY_FORM_VALUES);
      }
    },
    [activeDraftId, deleteDraftFromStore, resetFormValues, setActiveDraft],
  );

  const handleRenameDraft = useCallback(
    (draftId: string, name: string) => {
      renameDraftInStore(draftId, name);
    },
    [renameDraftInStore],
  );

  const discardCurrentDraft = useCallback(() => {
    if (activeDraftId) {
      deleteDraftFromStore(activeDraftId);
    }

    setActiveDraft(null);
    resetFormValues(EMPTY_FORM_VALUES);
    setLastSaved(null);
    lastSavedSnapshotRef.current = safeStringify(EMPTY_FORM_VALUES);
  }, [activeDraftId, deleteDraftFromStore, resetFormValues, setActiveDraft]);

  const clearDraftOnSubmit = useCallback(() => {
    cancelAutoSave();
    setIsSaving(false);

    if (activeDraftId) {
      deleteDraftFromStore(activeDraftId);
    }

    setActiveDraft(null);
    lastSavedSnapshotRef.current = safeStringify(EMPTY_FORM_VALUES);
  }, [activeDraftId, cancelAutoSave, deleteDraftFromStore, setActiveDraft]);

  return {
    isHydrated,
    activeDraft: getActiveDraft(),
    allDrafts: drafts,
    lastSaved,
    isSaving,

    createNewDraft,
    switchToDraft,
    deleteDraft: handleDeleteDraft,
    renameDraft: handleRenameDraft,
    discardCurrentDraft,
    clearDraftOnSubmit,

    hasDraftsToRestore: drafts.length > 0 && !activeDraftId,
  };
}

function hasMeaningfulContent(values: ProductFormValues) {
  return (
    Boolean(values.title?.trim()) ||
    Boolean(values.summary?.trim()) ||
    (Array.isArray(values.media) && values.media.length > 0) ||
    (Array.isArray(values.options) && values.options.length > 0)
  );
}

function safeStringify(values: ProductFormValues) {
  try {
    return JSON.stringify(values);
  } catch {
    return "";
  }
}

function useDebouncedEffectEvent<T extends (...args: never[]) => void>(
  handler: T,
  delay: number,
) {
  const handlerRef = useRef(handler);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  const trigger = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        handlerRef.current(...args);
      }, delay);
    },
    [cancel, delay],
  );

  return [trigger, cancel] as const;
}
