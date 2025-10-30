// Updated useCustomerStore with pagination and filter support
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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Customer {
  id: number;
  _id?: string;
  customerType?: string;
  customerCode?: string;
  code: string;
  customerName: string;
  shortName: string;
  customerGroup: string;
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
  logo: string | null; // Will handle as previewUrl or file
  notes: string;
  createdAt: string;
  registrationDocs: RegistrationDocument[];
  isDeleted: boolean;
}

interface CustomerForm {
  customerType?: string;
  customerCode?: string;
  code: string;
  customerName: string;
  shortName: string;
  customerGroup: string;
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
  banks: Bank[];
  logoFile?: File; // For logo upload
  logoPreviewUrl?: string;
  notes: string;
  registrationDocs: RegistrationDocument[];
}

interface CustomerStore {
  customers: Customer[];
  pagination: Pagination;
  loading: boolean;
  error: boolean;
  errorMessage: string | null;
  companyId?: number | string;
  fetchCustomers: (
    page?: number,
    limit?: number,
    companyId?: number | string
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
    companyId?: number | string
  ) => Promise<Customer[]>;
}

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
      loading: false,
      error: false,
      errorMessage: null,

      fetchCustomers: async (page = 1, limit = 10, companyId?:string|number) => {
        console.log("first, ", companyId);
        set({ loading: true, error: false });
        try {
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          const id = companyId?.toLocaleString();
          const result = await api.fetchCustomers(
            { companyId: id },
            {
              queryParams: queryParams.toString(),
            }
          ); // Adjust api call
          set({
            customers: result?.data?.customers || [],
            pagination: result?.data?.pagination,
            loading: false,
          });
          console.log(result?.data?.customers, "result?.data?");
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
        }
      },

      updateCustomer: async ({ id, customer }) => {
        set({ loading: true });
        try {
          const result = await api.updateCustomer(id, customer);

          set({
            customers: get().customers.map((c) => {
              console.log(id, result, c, "idresult");
              return c?.["_id"] == id ? result?.data : c;
            }),
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to update customer",
          });
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
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to delete customer",
          });
        }
      },

      filterCustomers: async (
        searchTerm: string,
        statusFilter: "all" | "active" | "inactive" | "suspended" | "prospect",
        sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
        page = 1,
        limit = 10,
        companyId?: string
      ) => {
        try {
          set({ loading: true, error: false });

          const queryParams = new URLSearchParams({
            search: searchTerm,
            status: statusFilter !== "all" ? statusFilter : "",
            sortBy: sortBy.includes("name") ? "customerName" : "createdAt",
            sortOrder: sortBy.includes("Desc") ? "desc" : "asc",
            page: page.toString(),
            limit: limit.toString(),
          });

          const result = await api.fetchCustomers(
            { companyId },
            {
              queryParams: queryParams.toString(),
            }
          ); // Adjust api call
          console.log("Filter result for customers:", result);

          set({
            customers: result?.data?.customers || [],
            pagination: result?.data?.pagination,
            loading: false,
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
    }),
    {
      name: "customer-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({
        customers: state.customers,
      }),
    }
  )
);
