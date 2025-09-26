import { createStore } from "zustand/vanilla";
import type { CreateProductMediaInput } from "~/lib/schemas/entities";

export type SelectedMedia = CreateProductMediaInput & { url: string };
export type MediaState = {
  selectedMedia: SelectedMedia[];
  previewUrl: string | null;
};

export type MediaActions = {
  setSelectedMedia: (media: SelectedMedia[]) => void;
  setPreviewUrl: (url: string | null) => void;
};

export type MediaStore = MediaState & MediaActions;

export const defaultInitState: MediaState = {
  selectedMedia: [],
  previewUrl: null,
};

export const createMediaStore = (initState: MediaState = defaultInitState) => {
  return createStore<MediaStore>()((set) => ({
    ...initState,
    setSelectedMedia: (media) => set({ selectedMedia: media }),
    setPreviewUrl: (url) => set({ previewUrl: url }),
  }));
};
