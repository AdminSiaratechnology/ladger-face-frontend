// store/ProductWiseReportStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/api/api";

interface ProductItem {
  _id: string;
  date: string;
  productName: string;
  hsnCode: string;
  qty: number;
  rate: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  vatRate: number | null;
  vatAmount: number | null;
  total: number;
  salesmanName: string;
}

interface Stats {
  totalQty: number;
  totalRevenue: number;
  totalTax: number;
  uniqueProducts: number;
}

interface ProductWiseReportStore {
  data: ProductItem[];
  stats: Stats | null;
  isIndia: boolean;
  loading: boolean;
  pagination: { total: number; totalPages: number };
  filters: {
    search: string;
    salesmanId: string;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
  };

  setFilter: (key: keyof ProductWiseReportStore["filters"], value: any) => void;
  resetFilters: () => void;
  fetchReport: (companyId: string) => Promise<void>;
  fetchAllReport: (companyId: string) => Promise<ProductItem[]>;
}

export const useProductWiseReportStore = create<ProductWiseReportStore>()(
  persist(
    (set, get) => ({
      data: [],
      stats: null,
      isIndia: true,
      loading: false,
      pagination: { total: 0, totalPages: 0 },
      filters: {
        search: "",
        salesmanId: "all",
        startDate: undefined,
        endDate: undefined,
        page: 1,
        limit: 15,
      },

      setFilter: (key, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
            page: key !== "page" ? 1 : state.filters.page,
          },
        })),

      resetFilters: () =>
        set({
          filters: {
            search: "",
            salesmanId: "all",
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
          if (filters.salesmanId !== "all") params.append("salesmanId", filters.salesmanId);
          if (filters.startDate) params.append("startDate", filters.startDate);
          if (filters.endDate) params.append("endDate", filters.endDate);

          const res = await api.productWiseReport(params);
          set({
            data: res.data ||[],
            stats: res.data|| null,
            isIndia: res.isIndia,
            pagination: res.pagination || { total: 0, totalPages: 0 },
            loading: false,
          });
        } catch (error) {
          console.error("Failed to fetch product report:", error);
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
        if (filters.salesmanId !== "all") params.append("salesmanId", filters.salesmanId);
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);

        const res = await api.productWiseReport(params);
        return res.data || [];
      },
    }),
    {
      name: "product-wise-report",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ filters: state.filters,stats: state.stats, }),
    }
  )
);