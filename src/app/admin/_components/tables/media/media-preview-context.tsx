import type { RowSelectionState } from "@tanstack/react-table";
import { createContext, useContext, useState } from "react";

export const MediaContext = createContext<{
  rowSelection: RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;

  mediaPreviewUrl: string | null;
  setMediaPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
} | null>(null);

export function MediaContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  return (
    <MediaContext.Provider
      value={{
        rowSelection,
        setRowSelection,
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
