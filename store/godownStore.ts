// store/godownStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import api from "../src/api/api"

export interface Godown {
  _id: string;
  company: string;
  client: string;
  code: string;
  name: string;
  address: string;
  state: string;
  city: string;
  country: string;
  isPrimary: boolean;
  status: string; // Active | delete
  capacity: string;
  manager: string;
  contactNumber: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface GodownStore {
  godowns: Godown[];
  loading: boolean;
  error: string | null;

  fetchGodowns: () => Promise<void>;
  addGodown: (data: Partial<Godown>) => Promise<void>;
  updateGodown: (id: string, data: Partial<Godown>) => Promise<void>;
  deleteGodown: (id: string) => Promise<void>;
}

export const useGodownStore = create<GodownStore>()(
  persist(
    (set, get) => ({
      godowns: [],
      loading: false,
      error: null,

      // ✅ Fetch Godowns
      fetchGodowns: async () => {
        try {
          set({ loading: true, error: null });
          const res =await api.getGodowns();
          console.log(res,"godowns")
          set({ godowns: res.data.records || [], loading: false });
        } catch (err: any) {
          set({ error: err.message, loading: false });
          console.log("errrorr in fgodoen")
        }
      },

      // ✅ Add Godown
      addGodown: async (data) => {
        try {
          set({ loading: true, error: null });
          const res = await api.addGodowns(data);
          console.log(res,"resss add godown")
          set({ godowns: [...get().godowns, res.data], loading: false });
        } catch (err: any) {
          set({ error: err.message, loading: false });
        }
      },

      // ✅ Update Godown
      updateGodown: async (id, godown) => {
        console.log(id,"iddddd")
        try {
          set({ loading: true, error: null });
          const res = await api.updateGodown({id:id,godown: godown});
          set({
            godowns: get().godowns.map((g) =>
              g._id === id ? { ...g, ...res.data } : g
            ),
            loading: false,
          });
        } catch (err: any) {
          set({ error: err.message, loading: false });
        }
      },

      // ✅ Delete Godown (soft delete → status: "delete")
      deleteGodown: async (id) => {
        try {
          set({ loading: true, error: null });
        const res=  await api.deleteGodown(id);

          set({
            godowns: get().godowns.filter((g) =>
              g._id !== id  ),
            loading: false,
          });
        } catch (err: any) {
          set({ error: err.message, loading: false });
        }
      },
    }),
    {
      name: "godown-store", // 👈 localStorage key
      getStorage: () => localStorage, // default localStorage hi hai
    }
  )
);
