// Updated useCustomerStore with pagination and filter support
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../src/api/api";
import { toast } from "sonner";

// --- Interfaces ---

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

export interface Customer {
  id: number;
  _id?: string;
  type?: string;
  customerCode?: string;
  code: string;
  name: string;
  shortName: string;
  group: string;
  industryType: string;
  territory: string;
  salesPerson: string;
  customerStatus: string;
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
  priceList: string;
  paymentTerms: string;
  creditLimit: string;
  creditDays: string;
  discount: string;
  agent: string;
  isFrozenAccount: boolean;
  disabled: boolean;
  allowZeroValuation: boolean;
  taxId: string;
  vatNumber: string;
  gstNumber: string;
  panNumber: string;
  tanNumber: string;
  taxCategory: string;
  taxTemplate: string;
  withholdingTaxCategory: string;
  msmeRegistration: string;
  isTaxExempt: boolean;
  reverseCharge: boolean;
  exportCustomer: boolean;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  swiftCode: string;
  preferredPaymentMethod: string;
  acceptedPaymentMethods: string[];
  creditCardDetails: string;
  paymentInstructions: string;
  banks: Bank[];
  approvalWorkflow: string;
  creditLimitApprover: string;
  documentRequired: string;
  externalSystemId: string;
  crmIntegration: string;
  dataSource: string;
  customerPriority: string;
  leadSource: string;
  internalNotes: string;
  allowPartialShipments: boolean;
  allowBackOrders: boolean;
  autoInvoice: boolean;
  logo: string | null;
  notes: string;
  createdAt: string;
  registrationDocs: RegistrationDocument[];
  isDeleted: boolean;
}

// Interface for API responses involving counts
interface CustomerCounts {
  gstRegistered: number;
  msmeRegistered: number;
  activeCustomers: number;
  vatRegistered: number;
  [key: string]: number;
}

interface CustomerStore {
  customers: Customer[];
  pagination: Pagination;
  loading: boolean;
  error: boolean;
  counts: CustomerCounts | null;
  errorMessage: string | null;
  
  // Actions
  fetchCustomers: (
    page?: number,
    limit?: number,
    companyId?: number | string,
    isCustomer?: boolean
  ) => Promise<void>;

  addCustomer: (customer: FormData) => Promise<void>;
  
  updateCustomer: (params: { id: string; customer: FormData }) => Promise<void>;
  
  deleteCustomer: (id: string) => Promise<void>;
  
  filterCustomers: (
    searchTerm: string,
    statusFilter: "all" | "active" | "inactive" | "suspended" | "prospect",
    sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
    page?: number,
    limit?: number,
    companyId?: number | string,
    isCustomer?: boolean
  ) => Promise<Customer[]>;
  
  initialLoading: () => void;
}

// --- Store Implementation ---

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customers: [],
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

      fetchCustomers: async (page = 1, limit = 10, companyId, isCustomer = false) => {
        set({ loading: true, error: false });
        try {
          // URLSearchParams requires strings
          const params: Record<string, string> = {
            page: page.toString(),
            limit: limit.toString(),
            isCustomer: String(isCustomer), // Explicit string conversion
          };
          console.log(params,"params")

          const queryParams = new URLSearchParams(params);

          const result = await api.fetchCustomers(
            { companyId },
            {
              queryParams: queryParams.toString(),
            }
          );

          set({
            customers: result?.data?.customers || [],
            pagination: result?.data?.pagination,
            loading: false,
            counts: result?.data?.counts,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to fetch customers",
          });
        }
      },

      addCustomer: async (customer) => {
        set({ loading: true });
        try {
          const result = await api.createCustomer(customer);
          const newCustomer: Customer = result.data;
          toast.success("Customer added successfully");
          set({
            customers: [...get().customers, newCustomer],
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to add customer",
          });
          toast.error(error?.response?.data?.message || "Failed to add customer");
        }
      },

      updateCustomer: async ({ id, customer }) => {
        set({ loading: true });
        try {
          const result = await api.updateCustomer(id, customer);

          set({
            customers: get().customers.map((c) => {
              return c?.["_id"] === id ? result?.data : c;
            }),
            loading: false,
          });
          toast.success("Customer updated successfully");
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to update customer",
          });
          toast.error(
            error?.response?.data?.message || "Failed to update customer"
          );
        }
      },

      deleteCustomer: async (id) => {
        set({ loading: true });
        try {
          await api.deleteCustomer(id);
          set({
            customers: get().customers.filter((c) => c._id !== id),
            loading: false,
          });
          toast.success("Customer deleted successfully");
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to delete customer",
          });
          toast.error(
            error?.response?.data?.message || "Failed to delete customer"
          );
        }
      },

      filterCustomers: async (
        searchTerm,
        statusFilter,
        sortBy,
        page = 1,
        limit = 10,
        companyId,
        isCustomer = false
      ) => {
        try {
          set({ loading: true, error: false });
          console.log(isCustomer,"isCustomer")
          

          const params: Record<string, string> = {
            search: searchTerm,
            status: statusFilter !== "all" ? statusFilter : "",
            sortBy: sortBy.includes("name") ? "name" : "createdAt",
            sortOrder: sortBy.includes("Desc") ? "desc" : "asc",
            page: page.toString(),
            limit: limit.toString(),
            isCustomer: String(isCustomer),
          };

          const queryParams = new URLSearchParams(params);
          console.log(queryParams,"queryParamsnnn")


          const result = await api.fetchCustomers(
            { companyId },
            {
              queryParams: queryParams.toString(),
            }
          );

          set({
            customers: result?.data?.customers || [],
            pagination: result?.data?.pagination,
            loading: false,
            counts: result?.data?.counts,
          });

          return result?.data?.customers || [];
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to filter customers",
          });
          return [];
        }
      },

      initialLoading: () => set({ loading: true, error: false }),
    }),
    {
      name: "customer-storage",
      storage: createJSONStorage(() => localStorage), // Updated for newer Zustand versions, falls back to getStorage if strictly needed
      partialize: (state) => ({
        customers: state.customers,
        counts: state.counts,
      }),
    }
  )
);