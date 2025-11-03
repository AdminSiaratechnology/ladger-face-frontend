// Updated useVendorStore with pagination and filter support
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import api from "../src/api/api"; 
import { toast } from "sonner";

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
  logo: string | null; // Will handle as previewUrl or file
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
  pagination: Pagination;
  loading: boolean;
  error: boolean;
  errorMessage: string | null;
  fetchVendors: (page?: number, limit?: number, companyId?: number | string) => Promise<void>;
  addVendor: (vendor: FormData) => Promise<void>;
  updateVendor: (params: { id: string; vendor: FormData }) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  filterVendors: (
    searchTerm: string,
    statusFilter: 'all' | 'active' | 'inactive' | 'suspended' | 'prospect',
    sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
    companyId?: number | string,
    page?: number,
    limit?: number
  ) => Promise<Vendor[]>;
  initialLoading: () => void;
}


export const useVendorStore = create<VendorStore>()(
  persist(
    (set, get) => ({
      vendors: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      },
      loading: true,
      error: false,
      errorMessage: null,

      fetchVendors: async (page = 1, limit = 10, companyId) => {
        set({ loading: true, error: false });
        try {
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          const id = companyId?.toLocaleString();
          const result = await api.fetchVendors({companyId:id}, { queryParams: queryParams.toString() }); // Adjust api call
          set({
            vendors: result?.data?.vendors || [],
            pagination: result?.data?.pagination,
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
          const newVendor: Vendor = result.data;
          toast.success("Vendor added successfully");
          set({
            vendors: [...get().vendors, newVendor],
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to add vendor",
          });
          toast.error(error?.response?.data?.message || "Failed to add vendor");
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
          toast.success("Vendor updated successfully");
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to update vendor",
          });
          toast.error(error?.response?.data?.message || "Failed to update vendor");
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
          toast.success("Vendor deleted successfully");
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to delete vendor",
          });
          toast.error(error?.response?.data?.message || "Failed to delete vendor");
        }
      },

      filterVendors: async (
        searchTerm: string,
        statusFilter: 'all' | 'active' | 'inactive' | 'suspended' | 'prospect',
        sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
        page = 1,
        limit = 10,
        companyId
      ) => {
        try {
          set({ loading: true, error: false });

          const queryParams = new URLSearchParams({
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : '',
            sortBy: sortBy.includes('name') ? 'vendorName' : 'createdAt',
            sortOrder: sortBy.includes('Desc') ? 'desc' : 'asc',
            page: page.toString(),
            limit: limit.toString(),
          });

          const result = await api.fetchVendors({companyId}, { queryParams: queryParams.toString() }); // Adjust api call
          console.log("Filter result for vendors:", result);

          set({
            vendors: result?.data?.vendors || [],
            pagination: result?.data?.pagination,
            loading: false,
          });

          return result?.data?.vendors || [];
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to filter vendors",
          });
          return [];
        }
      },

      initialLoading: () => {
        set({ loading: true });
      },
    }),
    {
      name: "vendor-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        vendors: state.vendors,
      }),
    }
  )
);