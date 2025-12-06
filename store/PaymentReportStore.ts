// store/paymentReportStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/api/api";

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  pending: number;
  completed: number;
  failed: number;
}

interface PaymentFilterParams {
  search: string;
  status: string;
  mode: string;
  userId: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

interface PaymentReportStore {
  data: any[];
  stats: PaymentStats | null;
  loading: boolean;
  pagination: { total: number; totalPages: number };
  filters: PaymentFilterParams;

  setFilter: (key: keyof PaymentFilterParams, value: any) => void;
  resetFilters: () => void;
  fetchReport: (companyId: string) => Promise<void>;
  fetchAllReport: (companyId: string) => Promise<any[]>;
}

export const usePaymentReportStore = create<PaymentReportStore>()(
  persist(
    (set, get) => ({
      data: [],
      stats: null,
      loading: false,
      pagination: { total: 0, totalPages: 0 },

      filters: {
        search: "",
        status: "all",
        mode: "all",
        userId: "all",
        startDate: undefined,
        endDate: undefined,
        page: 1,
        limit: 10,
      },

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value, page: key !== "page" ? 1 : value || state.filters.page },
        })),

      resetFilters: () =>
        set({
          filters: {
            search: "",
            status: "all",
            mode: "all",
            userId: "all",
            startDate: undefined,
            endDate: undefined,
            page: 1,
            limit: 10,
          },
        }),

      fetchReport: async (companyId: string) => {
        const { filters } = get();
        set({ loading: true });

        try {
          const params = new URLSearchParams({
            companyId,
            page: filters.page.toString(),
            limit: filters.limit.toString(),
          });

          if (filters.search) params.append("search", filters.search);
          if (filters.status && filters.status !== "all") params.append("status", filters.status);
          if (filters.mode && filters.mode !== "all") params.append("mode", filters.mode);
          if (filters.userId && filters.userId !== "all") params.append("userId", filters.userId);
          if (filters.startDate) params.append("startDate", filters.startDate);
          if (filters.endDate) params.append("endDate", filters.endDate);

          const res = await api.paymentReport(params.toString());

          set({
            data: res.data.payments || [],
            stats: res.data.stats || null,
            pagination: res.data.pagination || { total: 0, totalPages: 0 },
            loading: false,
          });
        } catch (error) {
          console.error("Failed to fetch payments:", error);
          set({ loading: false, data: [], stats: null });
        }
      },

      fetchAllReport: async (companyId: string) => {
        const { filters } = get();
        const params = new URLSearchParams({
          companyId,
          page: "1",
          limit: "10000",
        });

        if (filters.search) params.append("search", filters.search);
        if (filters.status && filters.status !== "all") params.append("status", filters.status);
        if (filters.mode && filters.mode !== "all") params.append("mode", filters.mode);
        if (filters.userId && filters.userId !== "all") params.append("userId", filters.userId);
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);

        const res = await api.paymentReport(params.toString());
        return res.data.payments || [];
      },
    }),
    {
      name: "payment-report-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);