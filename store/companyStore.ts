// Updated companyStore with pagination support
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import api from "../src/api/api";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

// Types (unchanged, but included for completeness)
export interface Bank {
  id: number;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  swiftCode: string;
  micrNumber: string;
  bankName: string;
  branch: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Company {
  _id: string;
  namePrint: string;
  nameStreet: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  telephone: string;
  mobile: string;
  fax: string;
  email: string;
  website: string;
  gstNumber: string;
  panNumber: string;
  tanNumber: string;
  msmeNumber: string;
  udyamNumber: string;
  defaultCurrency: string;
  banks: Bank[];
  logo: string;
  notes: string;
  registrationDocs: string[];
  client: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  status: "active" | "inactive";
  maintainGodown: Boolean;
  maintainBatch: Boolean;
  closingQuantityOrder: Boolean;
  negativeOrder: Boolean;
}

interface CompanyStore {
  companies: Company[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  defaultSelected: string | null;
  resetCompanies: () => Promise<void>;
  setDefaultCompany: (companyId: Company) => Promise<void>;
  fetchCompanies: (
    agentId: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  addCompany: (companyData: FormData) => Promise<void>;
  updateCompany: (params: {
    companyId: string;
    companyData: FormData;
  }) => Promise<void>;
  deleteCompany: (companyId: string) => Promise<void>;
  filterCompanies: (
    searchTerm: string,
    statusFilter: "all" | "active" | "inactive",
    sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
    agentId: string,
    page?: number,
    limit?: number
  ) => Promise<Company[]>;
}

// Zustand store with persistence
export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      companies: [],
      loading: false,
      error: null,
      defaultSelected: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },

      resetCompanies: async () => {
        set({
          companies: [],
          defaultSelected: null,
          loading: false,
          error: null,
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        });
        let cm = get().companies;
        console.log(cm, "cm");
      },
      fetchCompanies: async (agentId: string, page = 1, limit = 10) => {
        console.log(
          "Fetching companies for agentId:",
          agentId,
          "page:",
          page,
          "limit:",
          limit
        );
        try {
          set({ loading: true, error: null });

          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });

          const res = await api.getCompanies({
            agentId,
            queryParams: queryParams.toString(),
          });
          console.log("Fetched companies response:", res);

          set({
            companies: res.data.companies,
            pagination: res?.data?.pagination,
            loading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to fetch companies",
          });
        }
      },
      addCompany: async (companyData) => {
        console.log("Creating new company:", companyData);
        try {
          set({ loading: true, error: null });

          const res = await api.createCompany(companyData);
          console.log("Created company response:", res);

          const newCompany: Company = res.data;

          set({
            companies: [...get().companies, newCompany],
            loading: false,
            error: null,
          });

          return newCompany; // ✅ Return the created company
        } catch (error: any) {
          console.log("Error creating company:", error);
          toast.error(
            `Error creating company: ${error?.response?.data?.error}`
          );

          set({
            loading: false,
            error: error.response?.data?.message || "Failed to create company",
          });

          throw error; // ✅ Optional: rethrow for catch block in handleSubmit
        }
      },

      updateCompany: async ({ companyId, companyData }) => {
        console.log("Updating company:", companyId, companyData);
        try {
          set({ loading: true, error: null });

          const res = await api.updateCompany(companyId, companyData);
          console.log("Updated company response:", res);

          const updatedCompany: Company = res.data;

          set({
            companies: get().companies.map((comp) =>
              comp._id === companyId ? updatedCompany : comp
            ),
            loading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to update company",
          });
        }
      },

      deleteCompany: async (companyId) => {
        console.log("Deleting company:", companyId);
        try {
          set({ loading: true, error: null });

          const res = await api.deleteCompany(companyId);
          console.log("Deleted company response:", res);

          set({
            companies: get().companies.filter((comp) => comp._id !== companyId),
            loading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to delete company",
          });
        }
      },

      filterCompanies: async (
        searchTerm: string,
        statusFilter: "all" | "active" | "inactive",
        sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
        agentId: string,
        page = 1,
        limit = 10
      ) => {
        try {
          set({ loading: true, error: null });

          const queryParams = new URLSearchParams({
            search: searchTerm,
            status: statusFilter !== "all" ? statusFilter : "",
            sortBy: sortBy.includes("name") ? "namePrint" : "createdAt",
            sortOrder: sortBy.includes("Desc") ? "desc" : "asc",
            page: page.toString(),
            limit: limit.toString(),
          });

          const res = await api.getCompanies({
            agentId,
            queryParams: queryParams.toString(),
          });
          console.log("Database search response:", res);

          set({
            companies: res.data.companies,
            pagination: res?.data?.pagination,
            loading: false,
            error: null,
          });

          return res.data.companies;
        } catch (error: any) {
          set({
            loading: false,
            error:
              error.response?.data?.message || "Failed to search companies",
          });
          return [];
        }
      },
      setDefaultCompany: async (companyId: Company) => {
        set({ defaultSelected: companyId });
      },
    }),

    {
      name: "company-storage",
      // getStorage: () => localStorage,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        companies: state.companies,
        defaultSelected: state.defaultSelected,
      }),
    }
  )
);

// Custom hook to fetch a single company (unchanged)
export const useGetCompany = (id: string) => {
  const companies = useCompanyStore((state) => state.companies);
  const fetchCompanies = useCompanyStore((state) => state.fetchCompanies);
  const filterCompanies = useCompanyStore((state) => state.filterCompanies);
  const loading = useCompanyStore((state) => state.loading);

  useEffect(() => {
    const companyExists = companies.some((c) => c._id === id);
    if (!companies.length || !companyExists) {
      // Try to find by ID in a targeted search
      filterCompanies(id, "all", "nameAsc", "68c1503077fd742fa21575df").catch(
        () => {
          // Fallback to fetching all companies if targeted search fails
          fetchCompanies("68c1503077fd742fa21575df");
        }
      );
    }
  }, [id, companies, fetchCompanies, filterCompanies]);

  const company = useMemo(() => {
    return companies.find((c) => c._id === id);
  }, [companies, id]);

  return { company, loading };
};
