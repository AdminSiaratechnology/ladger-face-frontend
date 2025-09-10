import { create } from "zustand";
import axios from "axios";

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
}

// Zustand store
export const useCompanyStore = create<CompanyStore>((set) => ({
  companies: [],
  loading: false,
  error: null,

  fetchCompanies: async (agentId: string) => {
    console.log("Fetching companies for agentId:", agentId);
    try {
      set({ loading: true, error: null });

      const res = await axios.get(
        "http://localhost:5000/api/company/agent/companies",
        { _id: agentId }
      );

      set({
        companies: res.data.data,
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
}));
