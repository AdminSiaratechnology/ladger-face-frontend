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

  fetchStockCategory: (page?: number, limit?: number) => Promise<void>;
  addStockCategory: (data: StockCategory) => Promise<void>;
  updateStockCategory: (params: { stockCategoryId: string; data: StockCategory }) => Promise<void>;
  deleteStockCategory: (stockCategoryId: string) => Promise<void>;
  filterStockCategories: (
    searchTerm: string,
    statusFilter: 'all' | 'active' | 'inactive',
    sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
    page?: number,
    limit?: number
  ) => Promise<StockCategory[]>;
}

export const useStockCategory = create<StockCategoryStore>()(
  persist(
    (set, get) => ({
      stockCategories: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      },
      loading: false,
      error: false,
      errormessage: null,

      fetchStockCategory: async (page = 1, limit = 10) => {
        console.log("Fetching stock categories page:", page, "limit:", limit);
        set({ loading: true, error: false });
        try {
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });

          const result = await api.getStockCategory({ queryParams: queryParams.toString() }); // Adjust api call
          if (result?.statusCode === 200) {
            set({ stockCategories: result.data?.categories, pagination: result.data.pagination, loading: false });
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
        } catch (err: any) {
          set({ loading: false, error: true, errormessage: err.message });
        }
      },

      updateStockCategory: async ({ stockCategoryId, data }) => {
        set({ loading: true, error: false });
        try {
          console.log(stockCategoryId, data, "stockCategoryId, data");
          const result = await api.updateStockCategory({ stockCategoryId, data });
          const updatedStockCategory: StockCategory = result.data;
          set({
            stockCategories: get().stockCategories.map((cat) =>
              cat._id === stockCategoryId ? updatedStockCategory : cat
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

      filterStockCategories: async (
        searchTerm: string,
        statusFilter: 'all' | 'active' | 'inactive',
        sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
        page = 1,
        limit = 10
      ) => {
        try {
          set({ loading: true, error: false });

          const queryParams = new URLSearchParams({
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : '',
            sortBy: sortBy.includes('name') ? 'name' : 'createdAt',
            sortOrder: sortBy.includes('Desc') ? 'desc' : 'asc',
            page: page.toString(),
            limit: limit.toString(),
          });

          const result = await api.getStockCategory({ queryParams: queryParams.toString() }); // Adjust api call
          console.log("Filter result:", result);

          set({
            stockCategories: result.data.categories,
            pagination: result.data.pagination,
            loading: false,
          });

          return result.data.categories;
        } catch (err: any) {
          set({ loading: false, error: true, errormessage: err.message });
          return [];
        }
      },
    }),
    {
      name: "stockCategory-storage",
    }
  )
);