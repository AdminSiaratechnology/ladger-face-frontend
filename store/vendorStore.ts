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

interface Vendor {
  id: number;
  _id?: string;
  vendorType: string;
  vendorCode: string;
  code: string;
  vendorName: string;
  shortName: string;
  vendorGroup: string;
  industryType: string;
  territory: string;
  procurementPerson: string;
  vendorStatus: string;
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
  exportVendor: boolean;
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
  vendorPriority: string;
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

interface VendorForm {
  vendorType: string;
  vendorCode: string;
  code: string;
  vendorName: string;
  shortName: string;
  vendorGroup: string;
  industryType: string;
  territory: string;
  procurementPerson: string;
  vendorStatus: string;
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
  exportVendor: boolean;
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
  vendorPriority: string;
  leadSource: string;
  internalNotes: string;
  allowPartialShipments: boolean;
  allowBackOrders: boolean;
  autoInvoice: boolean;
  banks: Bank[];
  logoFile?: File;
  logoPreviewUrl?: string;
  notes: string;
  registrationDocs: RegistrationDocument[];
}

interface VendorStore {
  vendors: Vendor[];
  loading: boolean;
  error: boolean;
  errorMessage: string | null;
  fetchVendors: () => Promise<void>;
  addVendor: (vendor: VendorForm) => Promise<void>;
  updateVendor: (params: { id: string; vendor: VendorForm }) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
}

export const useVendorStore = create<VendorStore>()(
  persist(
    (set, get) => ({
      vendors: [],
      loading: false,
      error: false,
      errorMessage: null,

      fetchVendors: async () => {
        set({ loading: true, error: false });
        try {
          const result = await api.fetchVendors();
          set({
            vendors: result?.data || [],
            loading: false,
          });
          console.log(result?.data,"result?.data?")
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to fetch vendors",
          });
        }
      },

      addVendor: async (vendor) => {
        set({ loading: true });
        try {
          const result = await api.createVendor(vendor);
          set({
            vendors: [...get().vendors, result?.data],
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to add vendor",
          });
        }
      },

      updateVendor: async ({ id, vendor }) => {
        set({ loading: true });
        try {
          const result = await api.updateVendor(id, vendor);
         
          set({
            vendors: get().vendors.map((v) =>{

           console.log(id,result,v,"idresult")
            return   v?._id == id ? result?.data : v
            }),
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to update vendor",
          });
        }
      },

      deleteVendor: async (id) => {
        set({ loading: true });
        try {
          await api.deleteVendor(id);
          set({
            vendors: get().vendors.filter((v) => v._id !== id),
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to delete vendor",
          });
        }
      },
    }),
    {
      name: "vendor-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({
        vendors: state.vendors,
      }),
    }
  )
);