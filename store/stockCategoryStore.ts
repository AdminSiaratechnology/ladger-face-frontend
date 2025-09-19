// store/stockCategoryStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api"; // api functions

export interface StockCategory {
  id: number;
  _id?: string;
  name: string;
  description: string;
  parent: string;
  status: string;
  createdAt: string;
  companyId: string;
  stockGroupId: string;
}

interface StockCategoryStore {
  stockCategories: StockCategory[];
  loading: boolean;
  error: boolean;
  errormessage: null | string;

  fetchStockCategory: () => Promise<void>;
  addStockCategory: (data: StockCategory) => Promise<void>;
  updateStockCategory: (params: { stockCategoryId: string; data: StockCategory }) => Promise<void>;
  deleteStockCategory: (stockCategoryId: string) => Promise<void>;
}

export const useStockCategory = create<StockCategoryStore>()(
  persist(
    (set, get) => ({
      stockCategories: [],
      loading: false,
      error: false,
      errormessage: null,

      fetchStockCategory: async () => {
        set({ loading: true, error: false });
        try {
          const result = await api.getStockCategory();
          if (result?.statusCode === 200) {
            set({ stockCategories: result.data, loading: false });
          }
        } catch (err: any) {
          set({ loading: false, error: true, errormessage: err.message });
        }
      },

      addStockCategory: async (data) => {
        set({ loading: true, error: false });
        try {
          const result = await api.createStockCategory(data);
          set({
            stockCategories: [...get().stockCategories, result.data],
            loading: false,
          });
        } catch (err: any) {
          set({ loading: false, error: true, errormessage: err.message });
        }
      },

      updateStockCategory: async ({ stockCategoryId, data }) => {
        set({ loading: true, error: false });
        try {
            console.log(stockCategoryId,data,"stockCategoryId,data")
          const result = await api.updateStockCategory({ stockCategoryId, data });
          set({
            stockCategories: get().stockCategories.map((cat) =>
              cat._id === stockCategoryId ? result.data : cat
            ),
            loading: false,
          });
        } catch (err: any) {
          set({ loading: false, error: true, errormessage: err.message });
        }
      },

      deleteStockCategory: async (stockCategoryId) => {
        set({ loading: true, error: false });
        try {
          await api.deleteStockCategory(stockCategoryId);
          set({
            stockCategories: get().stockCategories.filter((cat) => cat._id !== stockCategoryId),
            loading: false,
          });
        } catch (err: any) {
          set({ loading: false, error: true, errormessage: err.message });
        }
      },
    }),
    {
      name: "stockCategory-storage",
    }
  )
);
