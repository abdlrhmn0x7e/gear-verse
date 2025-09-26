import { createContext, useContext, useState } from "react";
import type { CreateProductMediaInput } from "~/lib/schemas/entities";

export type SelectedMedia = CreateProductMediaInput & { url: string };
export const MediaContext = createContext<{
  selectedMedia: SelectedMedia[];
  setSelectedMedia: React.Dispatch<React.SetStateAction<SelectedMedia[]>>;

  mediaPreviewUrl: string | null;
  setMediaPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
} | null>(null);

export function MediaContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);

  return (
    <MediaContext.Provider
      value={{
        selectedMedia,
        setSelectedMedia,
        mediaPreviewUrl,
        setMediaPreviewUrl,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}

export function useMediaContext() {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error(
      "useMediaPreview must be used within a MediaPreviewProvider",
    );
  }

  return context;
}
