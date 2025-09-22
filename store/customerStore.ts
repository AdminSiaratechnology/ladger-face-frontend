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
  loading: boolean;
  error: boolean;
  errorMessage: string | null;
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: Customer) => Promise<void>;
  updateCustomer: (params: { id: number; customer: Customer }) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
}


export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customers: [],
      loading: false,
      error: false,
      errorMessage: null,

     
      fetchCustomers: async () => {
        set({ loading: true, error: false });
        try {
          const result = await api.fetchCustomers();
          set({
            customers: result?.data || [],
            loading: false,
          });
          console.log(result?.data,"result?.data?")
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
          set({
            customers: [...get().customers, result?.data],
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
            customers: get().customers.map((c) =>
              c.id === id ? result?.data : c
            ),
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
            customers: get().customers.filter((c) => c.id !== id),
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
