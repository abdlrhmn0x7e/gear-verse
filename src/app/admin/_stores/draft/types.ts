import type { ProductFormValues } from "~/app/admin/_components/forms/product";

export type ProductDraft = {
  id: string;
  name: string;
  data: Partial<ProductFormValues>;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
};

export type DraftState = {
  drafts: ProductDraft[];
  activeDraftId: string | null;
};

export type DraftActions = {
  createDraft: (data?: Partial<ProductFormValues>) => string;
  updateDraft: (id: string, data: Partial<ProductFormValues>) => void;
  deleteDraft: (id: string) => void;
  renameDraft: (id: string, name: string) => void;

  setActiveDraft: (id: string | null) => void;
  getActiveDraft: () => ProductDraft | null;
  getDraft: (id: string) => ProductDraft | null;

  cleanExpiredDrafts: () => void;
  clearAllDrafts: () => void;
};

export type DraftStore = DraftState & DraftActions;

export const DRAFT_CONFIG = {
  EXPIRATION_DAYS: 7,
  MAX_DRAFTS: 10,
  STORAGE_KEY: "gear-verse-product-drafts",
  AUTO_SAVE_DELAY_MS: 1500,
} as const;
