// store/useCustomerGroupStore.ts

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import api from "../src/api/api";

interface CustomerGroup {
  _id: string;
  groupName: string;
  groupCode: string;
  status: "active" | "inactive";
  createdAt: string;
  companyId: string;
}

interface Counts {
  total: number;
  active: number;
  inactive: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CustomerGroupStore {
  groups: CustomerGroup[];
  counts: Counts | null;        // Real counts (never affected by search/filter)
  listTotal: number;            // Filtered total (for pagination)
  pagination: Pagination | null;
  loading: boolean;

  fetchGroups: (companyId: string, params?: any) => Promise<void>;
  createGroup: (data: any) => Promise<CustomerGroup>;
  updateGroup: (id: string, data: any) => Promise<CustomerGroup>;
  deleteGroup: (id: string) => Promise<void>;
  resetGroups: () => void;
}

export const useCustomerGroupStore = create<CustomerGroupStore>()(
  persist(
    (set, get) => ({
      groups: [],
      counts: null,
      listTotal: 0,
      pagination: null,
      loading: false,

      fetchGroups: async (companyId, params = {}) => {
        set({ loading: true });
        try {
          const query = new URLSearchParams({
            page: "1",
            limit: "1000",
            ...params,
          }).toString();

          const res = await api.fetchCustomerGroups(
            { companyId },
            { queryParams: query }
          );

          const d = res.data;

          set({
            groups: d.groups || [],
            listTotal: d.total || 0,                    // ← for "Showing X of Y"
            counts: d.stats || { total: 0, active: 0, inactive: 0 }, // ← REAL counts
            pagination: {
              total: d.total || 0,
              page: d.page || 1,
              limit: d.limit || 10,
              totalPages: d.totalPages || 1,
            },
            loading: false,
          });
        } catch (err) {
          set({ loading: false });
          console.error("Failed to fetch customer groups:", err);
          throw err;
        }
      },

      createGroup: async (data) => {
        const res = await api.createCustomerGroup(data);
        const newGroup = res.data;

        set((state) => ({
          groups: [newGroup, ...state.groups],
          listTotal: state.listTotal + 1,
          counts: {
            total: state.counts!.total + 1,
            active: data.status === "active" ? state.counts!.active + 1 : state.counts!.active,
            inactive: data.status === "inactive" ? state.counts!.inactive + 1 : state.counts!.inactive,
          },
        }));
        return newGroup;
      },

      updateGroup: async (id, data) => {
        const res = await api.updateCustomerGroup({ groupId: id, data });
        const updated = res.data;

        set((state) => {
          const old = state.groups.find((g) => g._id === id);
          const wasActive = old?.status === "active";
          const nowActive = data.status === "active";

          return {
            groups: state.groups.map((g) => (g._id === id ? updated : g)),
            counts: {
              ...state.counts!,
              active:
                wasActive && !nowActive
                  ? state.counts!.active - 1
                  : !wasActive && nowActive
                  ? state.counts!.active + 1
                  : state.counts!.active,
            },
          };
        });
        return updated;
      },

      deleteGroup: async (id) => {
        await api.deleteCustomerGroup(id);
        set((state) => {
          const group = state.groups.find((g) => g._id === id);
          const wasActive = group?.status === "active";

          return {
            groups: state.groups.filter((g) => g._id !== id),
            listTotal: state.listTotal - 1,
            counts: {
              total: state.counts!.total - 1,
              active: wasActive ? state.counts!.active - 1 : state.counts!.active,
              inactive: !wasActive ? state.counts!.inactive - 1 : state.counts!.inactive,
            },
          };
        });
      },

      resetGroups: () => {
        set({
          groups: [],
          counts: null,
          listTotal: 0,
          pagination: null,
          loading: false,
        });
      },
    }),
    {
      name: "customer-group-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        groups: state.groups,   // Persist groups
        counts: state.counts,   // Persist counts
      }),
    }
  )
);