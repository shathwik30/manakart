import { create } from "zustand";
import { categoriesApi, Category } from "@/lib/api";

interface CategoryState {
  navCategories: Category[];
  isLoaded: boolean;
  isLoading: boolean;
  fetchNavCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  navCategories: [],
  isLoaded: false,
  isLoading: false,
  fetchNavCategories: async () => {
    if (get().isLoaded || get().isLoading) return;
    try {
      set({ isLoading: true });
      const data = await categoriesApi.getAll({ nav: true });
      set({
        navCategories: data.categories,
        isLoaded: true,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));
