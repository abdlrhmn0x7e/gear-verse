import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DRAFT_CONFIG, type DraftStore, type ProductDraft } from "./types";
import type { ProductFormValues } from "~/app/admin/_components/forms/product";

function generateDraftName(drafts: ProductDraft[]): string {
  const existingNumbers = drafts
    .map((d) => d.name.match(/^Draft (\d+)$/)?.[1])
    .filter(Boolean)
    .map(Number);

  const nextNumber =
    existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

  return `Draft ${nextNumber}`;
}

function generateExpirationTime(): number {
  return Date.now() + DRAFT_CONFIG.EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
}

export const useDraftStore = create<DraftStore>()(
  persist(
    (set, get) => ({
      drafts: [],
      activeDraftId: null,

      createDraft: (data: Partial<ProductFormValues> = {}) => {
        const id = crypto.randomUUID();
        const now = Date.now();
        const drafts = get().drafts;

        const newDraft: ProductDraft = {
          id,
          name: generateDraftName(drafts),
          data,
          createdAt: now,
          updatedAt: now,
          expiresAt: generateExpirationTime(),
        };

        set((state) => ({
          drafts: [newDraft, ...state.drafts].slice(0, DRAFT_CONFIG.MAX_DRAFTS),
          activeDraftId: id,
        }));

        return id;
      },

      updateDraft: (id, data) => {
        set((state) => ({
          drafts: state.drafts.map((draft) =>
            draft.id === id
              ? {
                  ...draft,
                  data,
                  updatedAt: Date.now(),
                  expiresAt: generateExpirationTime(),
                }
              : draft,
          ),
        }));
      },

      deleteDraft: (id) => {
        set((state) => ({
          drafts: state.drafts.filter((draft) => draft.id !== id),
          activeDraftId:
            state.activeDraftId === id ? null : state.activeDraftId,
        }));
      },

      renameDraft: (id, name) => {
        set((state) => ({
          drafts: state.drafts.map((draft) =>
            draft.id === id ? { ...draft, name } : draft,
          ),
        }));
      },

      setActiveDraft: (id) => {
        set({ activeDraftId: id });
      },

      getActiveDraft: () => {
        const { drafts, activeDraftId } = get();
        return drafts.find((d) => d.id === activeDraftId) ?? null;
      },

      getDraft: (id) => {
        return get().drafts.find((d) => d.id === id) ?? null;
      },

      cleanExpiredDrafts: () => {
        const now = Date.now();
        set((state) => ({
          drafts: state.drafts.filter((draft) => draft.expiresAt > now),
        }));
      },

      clearAllDrafts: () => {
        set({ drafts: [], activeDraftId: null });
      },
    }),
    {
      name: DRAFT_CONFIG.STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.cleanExpiredDrafts();
      },
    },
  ),
);
