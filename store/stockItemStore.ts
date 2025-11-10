import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StockItemStore {
  stockItems: any[];
  pagination: Pagination;
  loading: boolean;
  error: boolean;
  errormessage: null | string;

  fetchStockItems: (
    page?: number,
    limit?: number,
    companyId?: number | string
  ) => Promise<void>;

  filterStockItems: (
    searchTerm: string,
    statusFilter: "all" | "active" | "inactive",
    sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
    companyId?: number | string,
    page?: number,
    limit?: number
  ) => Promise<void>;

  initialLoading: () => void;
  resetStockItems: () => void;
}

export const useStockItemStore = create<StockItemStore>()(
  persist(
    (set, get) => ({
      stockItems: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },

      loading: true,
      error: false,
      errormessage: null,

      // ✅ FETCH STOCK ITEMS
      fetchStockItems: async (page = 1, limit = 10, companyId) => {
        set({ loading: true, error: false, errormessage: null });

        try {
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
          });

          const result = await api.fetchStockItems(
            { companyId: companyId?.toString() || "" },
            { queryParams: queryParams.toString() }
          );
          set({
            stockItems: result?.data?.items || [],
            pagination: result?.data?.pagination || get().pagination,
            loading: false,
          });
        } catch (err: any) {
          set({
            loading: false,
            error: true,
            errormessage: err.message || "Failed to fetch stock items",
          });
        }
      },

      // ✅ FILTER STOCK ITEMS
      filterStockItems: async (
        searchTerm,
        statusFilter,
        sortBy,
        companyId,
        page = 1,
        limit = 10
      ) => {
        set({ loading: true, error: false, errormessage: null });
        try {
          const queryParams = new URLSearchParams({
            search: searchTerm,
            status: statusFilter,
            sort: sortBy,
            page: String(page),
            limit: String(limit),
          });
          const result = await api.fetchStockItems(
            { companyId: companyId?.toString() || "" },
            { queryParams: queryParams.toString() }
          );

          set({
            stockItems: result?.data?.items || [],
            pagination: result?.data?.pagination || get().pagination,
            loading: false,
          });
        } catch (err: any) {
          set({
            loading: false,
            error: true,
            errormessage: err.message || "Failed to filter stock items",
          });
        }
      },

      // ✅ Set loading state before initial load
      initialLoading: () => {
        set({ loading: true });
      },

      // ✅ Reset store
      resetStockItems: () => {
        set({
          stockItems: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
          loading: false,
          error: false,
          errormessage: null,
        });
      },
    }),

    { name: "stock-item-storage" } // ✅ persist key
  )
);
