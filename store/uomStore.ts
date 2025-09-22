// stores/useUOMStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api";

// ==== Interfaces ====
interface Unit {
  _id?: string;
  name: string;
  type: "simple" | "compound";
  // Simple unit fields
  symbol?: string;
  decimalPlaces?: number;
  UQC?:string,
  // Compound unit fields
  firstUnit?: string;
  conversion?: number;
  secondUnit?: string;
  createdAt?: string;
}

interface UnitStore {
  units: Unit[];
  loading: boolean;
  error: boolean;
  errorMessage: string | null;
  fetchUnits: () => Promise<void>;
  addUnit: (unit: Unit) => Promise<void>;
  updateUnit: (params: { unitId: string; data: Unit }) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
}

// ==== Store ====
export const useUOMStore = create<UnitStore>()(
  persist(
    (set, get) => ({
      units: [],
      loading: false,
      error: false,
      errorMessage: null,

      // Fetch all UOM
      fetchUnits: async () => {
        set({ loading: true, error: false });
        try {
          const result = await api.fetchUOM();
          set({
            units: result?.data || [],
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
          set({
            units: [...get().units, result?.data],
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
      updateUnit: async ({unitId,data}) => {
      
        
        set({ loading: true, error: false });
        console.log("dahsdsa",unitId,data)
        try {
          const result = await api.updateUOM({unitId,data});
          set({
            units: get().units.map((u) =>
              u._id === id ? result?.data : u
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
    }),
    {
      name: "uom-storage", // storage key
      getStorage: () => localStorage, // default localStorage
      partialize: (state) => ({
        units: state.units, // sirf units persist honge
      }),
    }
  )
);
