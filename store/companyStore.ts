import { create } from "zustand";
import axios from "axios";

import api from "../src/api/api"

// Types
export interface Bank {
  name: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
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
}

interface CompanyStore {
  companies: Company[];
  loading: boolean;
  error: string | null;
  fetchCompanies: (agentId: string) => Promise<void>;
  addCompany: (companyData: Company) => Promise<void>;
  updateCompany: (params: { companyId: string; companyData: Company }) => Promise<void>;
  deleteCompany: (companyId: string) => Promise<void>;

}

// Zustand store
export const useCompanyStore = create<CompanyStore>((set, get) => ({
  companies: [],
  loading: false,
  error: null,

  fetchCompanies: async (agentId: string) => {
    console.log("Fetching companies for agentId:", agentId);
    try {
      set({ loading: true, error: null });

   
    
      const res=await api.getCompanies()
      console.log("Fetched companies response:", res);
   


      set({
        companies: res.data,
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
    console.log("Creating new companyyyyyy:", companyData);
    try {
      set({ loading: true, error: null });

   
   const  res=await api.createCompany(companyData)
   console.log("Created company responseeeeee:", res);

      const newCompany: Company = res.data;

      // Push new company into state
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
  updateCompany: async ({ companyId, companyData }:{ companyId: string; companyData: Company }) => {
    console.log("Updating company:", companyId, companyData);
    try {
      set({ loading: true, error: null });

      const res=await api.updateCompany(companyId,companyData)
      console.log("Updated company response:", res);

      const updatedCompany: Company = res.data;

      // Update company in state
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
        const  res=await api.deleteCompany(companyId)
        console.log("Deleted company response:", res);

        // Remove company from state
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
    }

}));
