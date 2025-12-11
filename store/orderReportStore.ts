// src/store/orderReportStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../src/api/api";

export interface OrderStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  cancelledOrders: number;
}

interface OrderFilterParams {
  search: string;
  status: string;
  userId: string;
  startDate: string | undefined;
  endDate: string | undefined;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

interface OrderReportStore {
  data: any[];
  stats: OrderStats | null;
  loading: boolean;
  pagination: {
    total: number;
    totalPages: number;
  };
  filters: OrderFilterParams;

  setFilter: (key: keyof OrderFilterParams, value: any) => void;
  resetFilters: () => void;
  fetchReport: (companyId: string) => Promise<void>;
  fetchAllReport: (companyId: string) => Promise<void>;
}

export const useOrderReportStore = create<OrderReportStore>()(
  persist(
    (set, get) => ({
      data: [],
      stats: null,
      loading: false,
      pagination: { total: 0, totalPages: 0 },

      filters: {
        search: "",
        status: "all",
        userId: "all",
        startDate: undefined,
        endDate: undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
        page: 1,
        limit: 12,
      },

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value, page: key !== "page" ? 1 : value || state.filters.page},
        })),

      resetFilters: () =>
        set({
          filters: {
            search: "",
            status: "all",
            userId: "all",
            startDate: undefined,
            endDate: undefined,
            sortBy: "createdAt",
            sortOrder: "desc",
            page: 1,
            limit: 12,
          },
        }),

      fetchReport: async (companyId: string) => {
        console.log("ljasfdklashklfhkll")
        const { filters } = get();
        set({ loading: true });

        try {
          const params = new URLSearchParams({
            companyId,
            page: filters.page.toString(),
            limit: filters.limit.toString(),
            search: filters.search,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
          });

          if (filters.status && filters.status !== "all") params.append("status", filters.status);
          if (filters.userId && filters.userId !== "all") params.append("userId", filters.userId);
          if (filters.startDate) params.append("startDate", filters.startDate);
          if (filters.endDate) params.append("endDate", filters.endDate);

          const res = await api.orderReport(params.toString());
          console.log("fetching recodsssss")

          set({
            data: res.data.orders || [],
            stats: res.data.stats || null,
            pagination: res.data.pagination || { total: 0, totalPages: 0 },
            loading: false,
          });
        } catch (error) {
          console.error("Failed to fetch orders:", error);
          set({ loading: false, data: [], stats: null });
        }
      },
      fetchAllReport: async (companyId: string) => {
        console.log("ljasfdklashklfhkll")
        const { filters } = get();
        // set({ loading: true });
        

        try {
          const params = new URLSearchParams({
            companyId,
            page: filters.page.toString(),
            limit: "1000",
            search: filters.search,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
          });

          if (filters.status && filters.status !== "all") params.append("status", filters.status);
          if (filters.userId && filters.userId !== "all") params.append("userId", filters.userId);
          if (filters.startDate) params.append("startDate", filters.startDate);
          if (filters.endDate) params.append("endDate", filters.endDate);

          const res = await api.orderReport(params.toString());
          console.log("fetching recodsssss")
          return res.data.orders

          // set({
          //   data: res.data.orders || [],
          //   stats: res.data.stats || null,
          //   pagination: res.data.pagination || { total: 0, totalPages: 0 },
          //   loading: false,
          // });
        } catch (error) {
          console.error("Failed to fetch orders:", error);
          set({ loading: false, data: [], stats: null });
        }
      },
    }),
    {
      name: "order-report-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);