import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api";
import { useEffect, useMemo } from "react";

// Types
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
interface Pagination{
  
  "total": number,
  "page": number,
  "limit": number,
  "totalPages": number

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
  status: 'active' | 'inactive';
}

interface CompanyStore {
  companies: Company[];
   pagination:Pagination;
  loading: boolean;
  error: string | null;
  fetchCompanies: (agentId: string) => Promise<void>;
  addCompany: (companyData: FormData) => Promise<void>;
  updateCompany: (params: { companyId: string; companyData: FormData }) => Promise<void>;
  deleteCompany: (companyId: string) => Promise<void>;
  filterCompanies: (
    searchTerm: string,
    statusFilter: 'all' | 'active' | 'inactive',
    sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
    agentId: string
  ) => Promise<Company[]>;
}

// Zustand store with persistence
export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      companies: [],

      loading: false,
      error: null,
      pagination:{
          "total": 0,
  "page": 0,
  "limit": 0,
  "totalPages": 0
      },
      

      fetchCompanies: async (agentId: string) => {
        console.log("Fetching companies for agentId:", agentId);
        try {
          set({ loading: true, error: null });

          const res = await api.getCompanies({agentId});
          console.log("Fetched companies response:", res);

          set({
            companies: res.data.companies,
            loading: false,
            error: null,
             pagination: res?.data?.pagination
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

          const newCompany: Company = res.data.data;

          set({
            companies: [...get().companies, newCompany],
            loading: false,
            error: null,
          });
        } catch (error: any) {
          console.log("Error creating company:", error);
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to create company",
          });
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
        statusFilter: 'all' | 'active' | 'inactive',
        sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
        agentId: string
      ) => {
        let list = [...get().companies];

        // Local filtering
        if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          list = list.filter((c) =>
            c.namePrint.toLowerCase().includes(lowerTerm) ||
            c.nameStreet.toLowerCase().includes(lowerTerm) ||
            c.email.toLowerCase().includes(lowerTerm) ||
            c.client.toLowerCase().includes(lowerTerm)
          );
        }

        if (statusFilter !== 'all') {
          list = list.filter((c) => c.status === statusFilter);
        }

        // If no results found locally and searchTerm is provided, query the database
        // if (list.length === 0 && searchTerm) {
        // if ( searchTerm) {
          try {
            set({ loading: true, error: null });

            // Construct query parameters for API call
            const queryParams = new URLSearchParams({
              search: searchTerm,
              status: statusFilter !== 'all' ? statusFilter : '',
              sortBy: sortBy.includes('name') ? 'namePrint' : 'createdAt',
              sortOrder: sortBy.includes('Desc') ? 'desc' : 'asc',
            });

            const res = await api.getCompanies({agentId:agentId, queryParams:queryParams.toString()});
            console.log("Database search response:", res);

            list = res.data.companies;

            // Update store with new results
            set({
              companies: list,
              loading: false,
              error: null,
            });
          } catch (error: any) {
            set({
              loading: false,
              error: error.response?.data?.message || "Failed to search companies",
            });
            return [];
          }
        // }

        // Sorting
        list.sort((a, b) => {
          let valA: string | Date, valB: string | Date;
          let order = 1; // asc by default

          if (sortBy === 'nameDesc' || sortBy === 'dateDesc') {
            order = -1;
          }

          if (sortBy === 'nameAsc' || sortBy === 'nameDesc') {
            valA = a.namePrint.toLowerCase();
            valB = b.namePrint.toLowerCase();
          } else {
            valA = new Date(a.createdAt);
            valB = new Date(b.createdAt);
          }

          if (valA < valB) return -1 * order;
          if (valA > valB) return 1 * order;
          return 0;
        });

        return list;
      },
    }),
    {
      name: "company-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({
        companies: state.companies,
      }),
    }
  )
);

// Custom hook to fetch a single company
export const useGetCompany = (id: string) => {
  const companies = useCompanyStore((state) => state.companies);
  const fetchCompanies = useCompanyStore((state) => state.fetchCompanies);
  const filterCompanies = useCompanyStore((state) => state.filterCompanies);
  const loading = useCompanyStore((state) => state.loading);

  useEffect(() => {
    const companyExists = companies.some((c) => c._id === id);
    if (!companies.length || !companyExists) {
      // Try to find by ID in a targeted search
      filterCompanies(id, 'all', 'nameAsc', "68c1503077fd742fa21575df").catch(() => {
        // Fallback to fetching all companies if targeted search fails
        fetchCompanies("68c1503077fd742fa21575df");
      });
    }
  }, [id, companies, fetchCompanies, filterCompanies]);

  const company = useMemo(() => {
    return companies.find((c) => c._id === id);
  }, [companies, id]);

  return { company, loading };
};