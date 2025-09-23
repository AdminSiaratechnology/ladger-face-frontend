import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api";

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

interface Ledger {
  id: number;
  _id?: string;
  ledgerType: string;
  ledgerCode: string;
  ledgerName: string;
  shortName: string;
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
}

interface LedgerForm {
  ledgerType: string;
  ledgerCode: string;
  ledgerName: string;
  shortName: string;
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
  loading: boolean;
  error: boolean;
  errorMessage: string | null;
  fetchLedgers: () => Promise<void>;
  addLedger: (ledger: LedgerForm) => Promise<void>;
  updateLedger: (params: { id: string; ledger: LedgerForm }) => Promise<void>;
  deleteLedger: (id: string) => Promise<void>;
}

export const useLedgerStore = create<LedgerStore>()(
  persist(
    (set, get) => ({
      ledgers: [],
      loading: false,
      error: false,
      errorMessage: null,

      fetchLedgers: async () => {
        set({ loading: true, error: false });
        try {
          const result = await api.fetchLedgers();
          set({
            ledgers: result?.data || [],
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to fetch ledgers",
          });
        }
      },

      addLedger: async (ledger) => {
        set({ loading: true });
        try {
          const result = await api.createLedger(ledger);
          set({
            ledgers: [...get().ledgers, result?.data],
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to add ledger",
          });
        }
      },

      updateLedger: async ({ id, ledger }) => {
        console.log(id,ledger,"idledggerrrr")
        set({ loading: true });
        try {
          const result = await api.updateLedger(id, ledger);
          set({
            ledgers: get().ledgers.map((l) =>
              l._id === id ? result?.data : l
            ),
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to update ledger",
          });
        }
      },

      deleteLedger: async (id) => {
        set({ loading: true });
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
            errorMessage:
              error?.response?.data?.message || "Failed to delete ledger",
          });
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