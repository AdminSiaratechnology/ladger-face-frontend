// Updated useAgentStore with pagination and filter support
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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

interface Agent {
  id: number;
  _id?: string;
  agentType: string;
  agentCode: string;
  code: string;
  companyId: string;
  agentName: string;
  shortName: string;
  agentCategory: string;
  specialty: string;
  territory: string;
  supervisor: string;
  agentStatus: string;
  experienceLevel: string;
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
  commissionStructure: string;
  paymentTerms: string;
  commissionRate: string;
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
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  swiftCode: string;
  preferredPaymentMethod: string;
  acceptedPaymentMethods: string[];
  paymentInstructions: string;
  banks: Bank[];
  approvalWorkflow: string;
  documentRequired: string;
  externalSystemId: string;
  crmIntegration: string;
  dataSource: string;
  agentPriority: string;
  leadSource: string;
  internalNotes: string;
  logo: string | null;
  notes: string;
  createdAt: string;
  registrationDocs: RegistrationDocument[];
  performanceRating: number;
  activeContracts: number;
  isDeleted: boolean;
}

interface AgentForm {
  agentType: string;
  agentCode: string;
  code: string;
  agentName: string;
  shortName: string;
  agentCategory: string;
  specialty: string;
  territory: string;
  supervisor: string;
  agentStatus: string;
  experienceLevel: string;
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
  commissionStructure: string;
  paymentTerms: string;
  commissionRate: string;
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
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  swiftCode: string;
  preferredPaymentMethod: string;
  acceptedPaymentMethods: string[];
  paymentInstructions: string;
  approvalWorkflow: string;
  documentRequired: string;
  externalSystemId: string;
  crmIntegration: string;
  dataSource: string;
  agentPriority: string;
  leadSource: string;
  internalNotes: string;
  banks: Bank[];
  logoFile?: File;
  logoPreviewUrl?: string;
  notes: string;
  registrationDocs: RegistrationDocument[];
  performanceRating: number;
  activeContracts: number;
}

interface AgentStore {
  agents: Agent[];
  pagination: Pagination;
  loading: boolean;
  error: boolean;
  errorMessage: string | null;
  fetchAgents: (page?: number, limit?: number,companyId?:number |string ) => Promise<void>;
  addAgent: (agent: FormData) => Promise<void>;
  updateAgent: (params: { id: string; agent: FormData }) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  filterAgents: (
    searchTerm: string,
    statusFilter: 'all' | 'active' | 'inactive' | 'suspended' | 'probation',
    sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
    page?: number,
    limit?: number,
    companyId?:number | string,
  ) => Promise<Agent[]>;
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      agents: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      },
      loading: false,
      error: false,
      errorMessage: null,

      fetchAgents: async (page = 1, limit = 10,companyId) => {
        set({ loading: true, error: false });
        try {
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });

          const result = await api.fetchAgents({companyId}, { queryParams: queryParams.toString() }); // Adjust api call
          set({
            agents: result?.data?.agents || [],
            pagination: result?.data?.pagination,
            loading: false,
          });
          console.log(result?.data,"result?.data?")
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to fetch agents",
          });
        }
      },

      addAgent: async (agent) => {
        set({ loading: true });
        try {
          const result = await api.createAgent(agent);
          const newAgent: Agent = result.data;
          set({
            agents: [...get().agents, newAgent],
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to add agent",
          });
        }
      },

      updateAgent: async ({ id, agent }) => {
        set({ loading: true });
        try {
          const result = await api.updateAgent(id, agent);
         
          set({
            agents: get().agents.map((a) =>{

           console.log(id,result,a,"idresult")
            return   a?._id == id ? result?.data : a
            }),
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to update agent",
          });
        }
      },

      deleteAgent: async (id) => {
        set({ loading: true });
        try {
          await api.deleteAgent(id);
          set({
            agents: get().agents.filter((a) => a._id !== id),
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to delete agent",
          });
        }
      },

      filterAgents: async (
        searchTerm: string,
        statusFilter: 'all' | 'active' | 'inactive' | 'suspended' | 'probation',
        sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
        page = 1,
        limit = 10,
        companyId:string
      ) => {
        try {
          set({ loading: true, error: false });

          const queryParams = new URLSearchParams({
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : '',
            sortBy: sortBy.includes('name') ? 'agentName' : 'createdAt',
            sortOrder: sortBy.includes('Desc') ? 'desc' : 'asc',
            page: page.toString(),
            limit: limit.toString(),
          });

          const result = await api.fetchAgents({companyId}, { queryParams: queryParams.toString() }); // Adjust api call
          console.log("Filter result for agents:", result);

          set({
            agents: result?.data?.agents || [],
            pagination: result?.data?.pagination,
            loading: false,
          });

          return result?.data?.agents || [];
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to filter agents",
          });
          return [];
        }
      },
    }),
    {
      name: "agent-storage",
      // getStorage: () => localStorage,
       storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        agents: state.agents,
      }),
    }
  )
);