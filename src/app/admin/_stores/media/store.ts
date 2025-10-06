import { createStore } from "zustand/vanilla";
import type { CreateProductMediaInput } from "~/lib/schemas/entities";

export type SelectedMedia = CreateProductMediaInput & { url: string };
export type MediaState = {
  selectedMedia: SelectedMedia[];
  previewUrl: string | null;
  maxFiles?: number;
};

export type MediaActions = {
  setSelectedMedia: (media: SelectedMedia[]) => void;
  setPreviewUrl: (url: string | null) => void;

  addSelectedMedia: (media: SelectedMedia[]) => void;
  deleteSelectedMedia: (mediaId: number) => void;
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
    addSelectedMedia: (media) => {
      set((state) => ({
        selectedMedia: [...state.selectedMedia, ...media],
      }));
    },
    deleteSelectedMedia: (mediaId) =>
      set((state) => ({
        selectedMedia: state.selectedMedia.filter(
          (media) => media.mediaId !== mediaId,
        ),
      })),
  }));
};
