// store/stockCategoryStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api"; // api functions
import { toast } from "sonner";

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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StockCategoryStore {
  stockCategories: StockCategory[];
  pagination: Pagination;
  loading: boolean;
  error: boolean;
  errormessage: null | string;
  counts: any;
  fetchStockCategory: (
    page?: number,
    limit?: number,
    companyId?: number | string
  ) => Promise<void>;
  addStockCategory: (data: StockCategory) => Promise<void>;
  updateStockCategory: (params: {
    stockCategoryId: string;
    data: StockCategory;
  }) => Promise<void>;
  deleteStockCategory: (stockCategoryId: string) => Promise<void>;
  filterStockCategories: (
    searchTerm: string,
    statusFilter: "all" | "active" | "inactive",
    sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
    companyId?: number | string,
    page?: number,
    limit?: number
  ) => Promise<StockCategory[]>;
  initialLoading: () => void;
  resetSrockCategories: () => Promise<void>;
}

export const useStockCategory = create<StockCategoryStore>()(
  persist(
    (set, get) => ({
      stockCategories: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      loading: true,
      error: false,
      errormessage: null,
      counts: null,

      fetchStockCategory: async (page = 1, limit = 10, companyId) => {
        set({ loading: true, error: false });
        try {
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          const id = companyId?.toLocaleString();
          const result = await api.getStockCategory(
            { companyId: id },
            { queryParams: queryParams.toString() }
          ); // Adjust api call
          if (result?.statusCode === 200) {
            set({
              stockCategories: result.data?.categories,
              pagination: result.data.pagination,
              counts: result.data.counts,
              loading: false,
            });
          }
        } catch (err: any) {
          set({ loading: false, error: true, errormessage: err.message });
        }
      },

      addStockCategory: async (data) => {
        set({ loading: true, error: false });
        try {
          const result = await api.createStockCategory(data);
          const newStockCategory: StockCategory = result.data;
          set({
            stockCategories: [...get().stockCategories, newStockCategory],
            loading: false,
          });
          toast.success("Stock Category added successfully");
        } catch (err: any) {
          set({ loading: false, error: true, errormessage: err.message });
          
          toast.error(err?.response?.data?.message 
            || err?.message || "Failed to add Stock Category");
        }
      },

      updateStockCategory: async ({ stockCategoryId, data }) => {
        set({ loading: true, error: false });
        try {
          const result = await api.updateStockCategory({
            stockCategoryId,
            data,
          });
          const updatedStockCategory: StockCategory = result.data;
          set({
            stockCategories: get().stockCategories.map((cat) =>
              cat._id === stockCategoryId ? updatedStockCategory : cat
            ),
            loading: false,
          });
          toast.success("Stock Category updated successfully");
        } catch (err: any) {
          console.log(err,"errorrrr")
          set({ loading: false, error: true, errormessage: err.message });
          toast.error(err?.response?.data?.message || err?.message || "Failed to update Stock Category");
        }
      },

      deleteStockCategory: async (stockCategoryId) => {
        set({ loading: true, error: false });
        try {
          await api.deleteStockCategory(stockCategoryId);
          set({
            stockCategories: get().stockCategories.filter(
              (cat) => cat._id !== stockCategoryId
            ),
            loading: false,
          });
          toast.success("Stock Category deleted successfully");
        } catch (err: any) {
          set({ loading: false, error: true, errormessage: err.message });
          toast.error(err.message || "Failed to delete Stock Category");
        }
      },

      filterStockCategories: async (
        searchTerm: string,
        statusFilter: "all" | "active" | "inactive",
        sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
        page = 1,
        limit = 10,
        companyId
      ) => {
        try {
          set({ loading: true, error: false });

          const queryParams = new URLSearchParams({
            search: searchTerm,
            status: statusFilter !== "all" ? statusFilter : "",
            sortBy: sortBy.includes("name") ? "name" : "createdAt",
            sortOrder: sortBy.includes("Desc") ? "desc" : "asc",
            page: page.toString(),
            limit: limit.toString(),
          });
          const result = await api.getStockCategory(
            { companyId },
            { queryParams: queryParams.toString() }
          ); // Adjust api call

          set({
            stockCategories: result.data.categories,
            pagination: result.data.pagination,
            counts: result.data.counts,
            loading: false,
          });

          return result.data.categories;
        } catch (err: any) {
          set({ loading: false, error: true, errormessage: err.message });
          return [];
        }
      },

      initialLoading: () => {
        set({ loading: true, error: false });
      },
      resetSrockCategories: () => {
        set({
          stockCategories: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
          counts: null,
          loading: false,
          error: false,
          errormessage: null,
        });
      },
    }),
    {
      name: "stockCategory-storage",
    }
  )
);
