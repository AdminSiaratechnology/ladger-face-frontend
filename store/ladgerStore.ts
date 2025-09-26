import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api"; // Adjust the import path as needed

// Define interfaces for Ledger
interface Bank {
  id: number;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  swiftCode: string;
  micrNumber: string;
  bankName: string;
  branch: string;
}

interface RegistrationDocument {
  id: number;
  type: string;
  file: File;
  previewUrl: string;
  fileName: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Ledger {
  id: number;
  _id?: string;
  ledgerType: string;
  ledgerCode: string;
  ledgerName: string;
  shortName: string;
  companyId: string;
  ledgerGroup: string;
  industryType: string;
  territory: string;
  ledgerStatus: string;
  companySize: string;
  contactPerson: string;
  designation: string;
  phoneNumber: string;
  mobileNumber: string;
  emailAddress: string;
  faxNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website: string;
  currency: string;
  taxId: string;
  vatNumber: string;
  gstNumber: string;
  panNumber: string;
  tanNumber: string;
  taxCategory: string;
  taxTemplate: string;
  withholdingTaxCategory: string;
  isTaxExempt: boolean;
  reverseCharge: boolean;
  isFrozenAccount: boolean;
  disabled: boolean;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  swiftCode: string;
  banks: Bank[];
  externalSystemId: string;
  dataSource: string;
  ledgerPriority: string;
  leadSource: string;
  internalNotes: string;
  logo: string | null;
  notes: string;
  createdAt: string;
  registrationDocs: RegistrationDocument[];
  isDeleted?: boolean;
}

interface LedgerForm {
  ledgerType: string;
  ledgerCode: string;
  ledgerName: string;
  shortName: string;
  companyId: string;
  ledgerGroup: string;
  industryType: string;
  territory: string;
  ledgerStatus: string;
  companySize: string;
  contactPerson: string;
  designation: string;
  phoneNumber: string;
  mobileNumber: string;
  emailAddress: string;
  faxNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website: string;
  currency: string;
  taxId: string;
  vatNumber: string;
  gstNumber: string;
  panNumber: string;
  tanNumber: string;
  taxCategory: string;
  taxTemplate: string;
  withholdingTaxCategory: string;
  isTaxExempt: boolean;
  reverseCharge: boolean;
  isFrozenAccount: boolean;
  disabled: boolean;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  swiftCode: string;
  banks: Bank[];
  externalSystemId: string;
  dataSource: string;
  ledgerPriority: string;
  leadSource: string;
  internalNotes: string;
  logoFile?: File;
  logoPreviewUrl?: string;
  notes: string;
  registrationDocs: RegistrationDocument[];
}

interface LedgerStore {
  ledgers: Ledger[];
  pagination: Pagination;
  loading: boolean;
  error: boolean;
  errorMessage: string | null;
  fetchLedgers: (page?: number, limit?: number) => Promise<void>;
  addLedger: (ledger: FormData) => Promise<void>;
  updateLedger: (params: { id: string; ledger: FormData }) => Promise<void>;
  deleteLedger: (id: string) => Promise<void>;
  filterLedgers: (
    searchTerm: string,
    statusFilter: "all" | "active" | "inactive" | "suspended",
    sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
    page?: number,
    limit?: number
  ) => Promise<Ledger[]>;
}

export const useLedgerStore = create<LedgerStore>()(
  persist(
    (set, get) => ({
      ledgers: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      loading: false,
      error: false,
      errorMessage: null,

      fetchLedgers: async (page = 1, limit = 10) => {
        set({ loading: true, error: false });
        try {
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });

          const result = await api.fetchLedgers({ queryParams: queryParams.toString() });
          set({
            ledgers: result?.data?.ledgers || [],
            pagination: result?.data?.pagination || {
              total: 0,
              page: 1,
              limit: 10,
              totalPages: 0,
            },
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage: error?.response?.data?.message || "Failed to fetch ledgers",
          });
        }
      },

      addLedger: async (ledger) => {
        set({ loading: true, error: false });
        try {
          const result = await api.createLedger(ledger);
          const newLedger: Ledger = result.data;
          set({
            ledgers: [...get().ledgers, newLedger],
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage: error?.response?.data?.message || "Failed to add ledger",
          });
        }
      },

      updateLedger: async ({ id, ledger }) => {
        set({ loading: true, error: false });
        try {
          const result = await api.updateLedger(id, ledger);
          set({
            ledgers: get().ledgers.map((l) => (l._id === id ? result?.data : l)),
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage: error?.response?.data?.message || "Failed to update ledger",
          });
        }
      },

      deleteLedger: async (id) => {
        set({ loading: true, error: false });
        try {
          await api.deleteLedger(id);
          set({
            ledgers: get().ledgers.filter((l) => l._id !== id),
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage: error?.response?.data?.message || "Failed to delete ledger",
          });
        }
      },

      filterLedgers: async (
        searchTerm: string,
        statusFilter: "all" | "active" | "inactive" | "suspended",
        sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
        page = 1,
        limit = 10
      ) => {
        try {
          set({ loading: true, error: false });

          const queryParams = new URLSearchParams({
            search: searchTerm,
            status: statusFilter !== "all" ? statusFilter : "",
            sortBy: sortBy.includes("name") ? "ledgerName" : "createdAt",
            sortOrder: sortBy.includes("Desc") ? "desc" : "asc",
            page: page.toString(),
            limit: limit.toString(),
          });

          const result = await api.fetchLedgers({ queryParams: queryParams.toString() });
          set({
            ledgers: result?.data?.ledgers || [],
            pagination: result?.data?.pagination || {
              total: 0,
              page: 1,
              limit: 10,
              totalPages: 0,
            },
            loading: false,
          });

          return result?.data?.ledgers || [];
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage: error?.response?.data?.message || "Failed to filter ledgers",
          });
          return [];
        }
      },
    }),
    {
      name: "ledger-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({
        ledgers: state.ledgers,
      }),
    }
  )
);