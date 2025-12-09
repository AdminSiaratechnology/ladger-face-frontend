// store/CustomerWiseReportStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/api/api";

interface Transaction {
  _id: string;
  type: "Order" | "Payment";
  date: string;
  customerName: string;
  salesmanName: string;
  orderAmount: number | null;
  paymentAmount: number | null;
  status: string;
  remarks: string;
}

interface Stats {
  totalTransactions: number;
  totalSales: number;
  totalReceived: number;
  outstanding: number;
}

interface Filters {
  search: string;
  salesmanId: string;
  status?: string;
  mode?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

interface CustomerWiseReportStore {
  data: Transaction[];
  stats: Stats | null;
  loading: boolean;
  pagination: { total: number; totalPages: number };
  filters: Filters;

  setFilter: (key: keyof Filters, value: any) => void;
  resetFilters: () => void;
  fetchReport: (companyId: string) => Promise<void>;
  fetchAllReport: (companyId: string) => Promise<Transaction[]>;
}

export const useCustomerWiseReportStore = create<CustomerWiseReportStore>()(
  persist(
    (set, get) => ({
      data: [],
      stats: null,
      loading: false,
      pagination: { total: 0, totalPages: 0 },

      filters: {
        search: "",
        salesmanId: "all",
        status: "all",
        mode: "all",
        startDate: undefined,
        endDate: undefined,
        page: 1,
        limit: 15,
      },

      setFilter: (key, value) =>{
        console.log(key,value ,"keyvalue")

      
        set((state) => ({

          filters: {
            ...state.filters,
            [key]: value,
            page: key !== "page" ? 1 : value,
          },
        }))},

      resetFilters: () =>
        set({
          filters: {
            search: "",
            salesmanId: "all",
            status: "all",
            mode: "all",
            startDate: undefined,
            endDate: undefined,
            page: 1,
            limit: 15,
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
          if (filters.salesmanId && filters.salesmanId !== "all") params.append("salesmanId", filters.salesmanId);
          if (filters.status && filters.status !== "all") params.append("status", filters.status);
          if (filters.mode && filters.mode !== "all") params.append("mode", filters.mode);
          if (filters.startDate) params.append("startDate", filters.startDate);
          if (filters.endDate) params.append("endDate", filters.endDate);

          const res = await api.customerWiseReport(params);
          
          set({
            data: res.data|| [],
            stats: res.stats || null,
            pagination: res.pagination || { total: 0, totalPages: 0 },
            loading: false,
          });
        } catch (error) {
          console.error("Failed to fetch customer wise report:", error);
          set({ loading: false, data: [], stats: null });
        }
      },

      fetchAllReport: async (companyId: string) => {
        const { filters } = get();
        const params = new URLSearchParams({
          companyId,
          limit: "10000",
          page: "1",
        });

        if (filters.search) params.append("search", filters.search);
        if (filters.salesmanId && filters.salesmanId !== "all") params.append("salesmanId", filters.salesmanId);
        if (filters.status && filters.status !== "all") params.append("status", filters.status);
        if (filters.mode && filters.mode !== "all") params.append("mode", filters.mode);
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);

        const res = await api.customerWiseReport(params);
        console.log(res,"customerWiseReport")
        return res.data || [];
      },
    }),
    {
      name: "customer-wise-report",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);