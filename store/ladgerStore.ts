import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import api from "../src/api/api"; // Adjust the import path as needed
import { toast } from "sonner";

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
  counts: any;
  fetchLedgers: (page?: number, limit?: number, companyId?: number | string) => Promise<void>;
  addLedger: (ledger: FormData) => Promise<void>;
  updateLedger: (params: { id: string; ledger: FormData }) => Promise<void>;
  deleteLedger: (id: string) => Promise<void>;
  filterLedgers: (
    searchTerm: string,
    statusFilter: "all" | "active" | "inactive" | "suspended",
    sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
    companyId?: number | string,
    page?: number,
    limit?: number
  ) => Promise<Ledger[]>;
  getLedgerById : (id: string) => Promise<Ledger>;
  initialLoading: () => void;
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
      loading: true,
      error: false,
      errorMessage: null,
      counts: null,
      fetchLedgers: async (page = 1, limit = 10,companyId) => {
        set({ loading: true, error: false });
        try {
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });

          const result = await api.fetchLedgers({companyId}, { queryParams: queryParams.toString() });
          set({
            ledgers: result?.data?.ledgers || [],
            pagination: result?.data?.pagination || {
              total: 0,
              page: 1,
              limit: 10,
              totalPages: 0,
            },
            counts: result?.data?.counts,
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
                toast.success("Ledger added successfully");

        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage: error?.response?.data?.message || "Failed to add ledger",
          });
          toast.error(error?.response?.data?.message || "Failed to add ledger");
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
          toast.success("Ledger updated successfully");
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage: error?.response?.data?.message || "Failed to update ledger",
          });
          toast.error(error?.response?.data?.message || "Failed to update ledger");
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
          toast.success("Ledger deleted successfully");
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage: error?.response?.data?.message || "Failed to delete ledger",
          });
          toast.error(error?.response?.data?.message || "Failed to delete ledger");
        }
      },

      filterLedgers: async (
        searchTerm: string,
        statusFilter: "all" | "active" | "inactive" | "suspended",
        sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
        page = 1,
        limit = 10,
        companyId
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

          const result = await api.fetchLedgers({companyId},{ queryParams: queryParams.toString() });
          set({
            ledgers: result?.data?.ledgers || [],
            pagination: result?.data?.pagination || {
              total: 0,
              page: 1,
              limit: 10,
              totalPages: 0,
            },
            counts: result?.data?.counts,
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

      getLedgerById: async (id) => {
        set({ loading: true, error: false });
        try {
          const result = await api.getLedgerById(id);
          set({
            ledger: result?.data,
            loading: false,
          });
          return result?.data;
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage: error?.response?.data?.message || "Failed to fetch ledger",
          });
          return null;
        }
      },
      initialLoading: () => {
        set({ loading: true });
      },
    }),
    {
      name: "ledger-storage",
      // getStorage: () => localStorage,
       storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ledgers: state.ledgers,
        counts: state.counts,
      }),
    }
  )
);