"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import { type CategoryStore, createCategoryStore } from ".";

export type CategoryStoreApi = ReturnType<typeof createCategoryStore>;

export const CategoryStoreContext = createContext<CategoryStoreApi | null>(
  null,
);

export interface CategoryStoreProviderProps {
  children: ReactNode;
}

export const CategoryStoreProvider = ({
  children,
}: CategoryStoreProviderProps) => {
  const storeRef = useRef<CategoryStoreApi | null>(null);
   
  if (storeRef.current === null) {
    storeRef.current = createCategoryStore({
      selectedCategory: null,
      parentCategory: null,
    });
  }

  return (
    <CategoryStoreContext.Provider value={storeRef.current}>
      {children}
    </CategoryStoreContext.Provider>
  );
};

export const useCategoryStore = <T,>(
  selector: (store: CategoryStore) => T,
): T => {
  const categoryStoreContext = useContext(CategoryStoreContext);

  if (!categoryStoreContext) {
    throw new Error(
      `useCategoryStore must be used within CategoryStoreProvider`,
    );
  }

  return useStore(categoryStoreContext, selector);
};
