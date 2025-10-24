// stores/useUOMStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import api from "../src/api/api";

// ==== Interfaces ====
interface Unit {
  _id?: string;
  name: string;
  type: "simple" | "compound";
  status: 'active' | 'inactive';
  // Simple unit fields
  symbol?: string;
  decimalPlaces?: number;
  UQC?:string,
  // Compound unit fields
  firstUnit?: string;
  conversion?: number;
  secondUnit?: string;
  createdAt?: string;
  companyId: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UnitStore {
  units: Unit[];
  pagination: Pagination;
  loading: boolean;
  error: boolean;
  errorMessage: string | null;
  fetchUnits: (page?: number, limit?: number, companyId?:number | string) => Promise<void>;
  addUnit: (unit: Unit) => Promise<void>;
  updateUnit: (params: { unitId: string; data: Unit }) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  filterUnits: (
    searchTerm: string,
    statusFilter: 'all' | 'active' | 'inactive',
    sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
    companyId?:number | string,
    page?: number,
    limit?: number
  ) => Promise<Unit[]>;
}

// ==== Store ====
export const useUOMStore = create<UnitStore>()(
  persist(
    (set, get) => ({
      units: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      },
      loading: false,
      error: false,
      errorMessage: null,

      // Fetch all UOM
      fetchUnits: async (page = 1, limit = 10, companyId) => {
        console.log("Fetching units page:", page, "limit:", limit);
        set({ loading: true, error: false });
        try {
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          const id  = companyId?.toLocaleString();
          const result = await api.fetchUOM({companyId:id}, { queryParams: queryParams.toString() }); // Adjust api call
          set({
            units: result?.data.units || [],
            pagination: result?.data.pagination,
            loading: false,
            error: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to fetch units",
          });
        }
      },

      // Add UOM
      addUnit: async (unit) => {
        set({ loading: true, error: false });
        try {
          const result = await api.createUOM(unit);
          const newUnit: Unit = result.data;
          set({
            units: [...get().units, newUnit],
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to add unit",
          });
        }
      },

      // Update UOM
      updateUnit: async ({unitId, data}) => {
        set({ loading: true, error: false });
        console.log("dahsdsa",unitId,data)
        try {
          const result = await api.updateUOM({unitId, data});
          const updatedUnit: Unit = result.data;
          set({
            units: get().units.map((u) =>
              u._id === unitId ? updatedUnit : u
            ),
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to update unit",
          });
        }
      },

      // Delete UOM
      deleteUnit: async (id) => {
        set({ loading: true, error: false });
        try {
          await api.deleteUOM(id);
          set({
            units: get().units.filter((u) => u._id !== id),
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to delete unit",
          });
        }
      },

      filterUnits: async (
        searchTerm: string,
        statusFilter: 'all' | 'active' | 'inactive',
        sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
        page = 1,
        limit = 10,
        companyId
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

          const result = await api.fetchUOM({companyId}, { queryParams: queryParams.toString() }); // Adjust api call
          console.log("Filter result for units:", result);

          set({
            units: result?.data.units || [],
            pagination: result?.data.pagination,
            loading: false,
          });

          return result?.data.units || [];
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to filter units",
          });
          return [];
        }
      },
    }),
    {
      name: "uom-storage", // storage key
      // getStorage: () => localStorage, // default localStorage
       storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        units: state.units, // sirf units persist honge
      }),
    }
  )
);