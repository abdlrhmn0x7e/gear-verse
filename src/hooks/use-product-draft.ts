"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  useDraftStore,
  DRAFT_CONFIG,
  type ProductDraft,
} from "~/app/admin/_stores/draft";
import type { ProductFormValues } from "~/app/admin/_components/forms/product";
import { useDebounce } from "./use-debounce";

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
  const [formValues, setFormValues] =
    useState<ProductFormValues>(EMPTY_FORM_VALUES);
  const isInitialMount = useRef(true);
  const previousValuesRef = useRef<string>("");

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
    if (!form) return;

    const subscription = form.watch((values) => {
      setFormValues(values as ProductFormValues);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const debouncedValues = useDebounce(
    formValues,
    DRAFT_CONFIG.AUTO_SAVE_DELAY_MS,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
    cleanExpiredDrafts();
  }, [cleanExpiredDrafts]);

  useEffect(() => {
    if (!enabled || !isHydrated) {
      return;
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousValuesRef.current = JSON.stringify(debouncedValues);
      return;
    }

    const currentValuesStr = JSON.stringify(debouncedValues);
    if (currentValuesStr === previousValuesRef.current) {
      return;
    }
    previousValuesRef.current = currentValuesStr;

    const hasContent =
      debouncedValues.title?.trim() ||
      debouncedValues.summary?.trim() ||
      (debouncedValues.media && debouncedValues.media.length > 0) ||
      (debouncedValues.options && debouncedValues.options.length > 0);

    if (!hasContent) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSaving(true);

    if (activeDraftId) {
      updateDraft(activeDraftId, debouncedValues);
    } else {
      createDraftInStore(debouncedValues);
    }

    setLastSaved(new Date());
    setIsSaving(false);
  }, [
    debouncedValues,
    activeDraftId,
    enabled,
    isHydrated,
    updateDraft,
    createDraftInStore,
  ]);

  const createNewDraft = useCallback(() => {
    form?.reset(EMPTY_FORM_VALUES);
    createDraftInStore();
    setLastSaved(null);
    previousValuesRef.current = JSON.stringify(EMPTY_FORM_VALUES);
  }, [form, createDraftInStore]);

  const switchToDraft = useCallback(
    (draftId: string) => {
      const draft = drafts.find((d) => d.id === draftId);
      if (draft) {
        setActiveDraft(draftId);
        form?.reset(draft.data as ProductFormValues);
        setLastSaved(new Date(draft.updatedAt));
        previousValuesRef.current = JSON.stringify(draft.data);
      }
    },
    [drafts, setActiveDraft, form],
  );

  const handleDeleteDraft = useCallback(
    (draftId: string) => {
      const isActive = draftId === activeDraftId;
      deleteDraftFromStore(draftId);

      if (isActive) {
        form?.reset(EMPTY_FORM_VALUES);
        setLastSaved(null);
        previousValuesRef.current = JSON.stringify(EMPTY_FORM_VALUES);
      }
    },
    [activeDraftId, deleteDraftFromStore, form],
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
    form?.reset(EMPTY_FORM_VALUES);
    setLastSaved(null);
    previousValuesRef.current = JSON.stringify(EMPTY_FORM_VALUES);
  }, [activeDraftId, deleteDraftFromStore, setActiveDraft, form]);

  const clearDraftOnSubmit = useCallback(() => {
    if (activeDraftId) {
      deleteDraftFromStore(activeDraftId);
    }
    setActiveDraft(null);
    setLastSaved(null);
  }, [activeDraftId, deleteDraftFromStore, setActiveDraft]);

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
