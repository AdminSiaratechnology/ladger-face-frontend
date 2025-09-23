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

interface Agent {
  id: number;
  _id?: string;
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
  loading: boolean;
  error: boolean;
  errorMessage: string | null;
  fetchAgents: () => Promise<void>;
  addAgent: (agent: AgentForm) => Promise<void>;
  updateAgent: (params: { id: string; agent: AgentForm }) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      agents: [],
      loading: false,
      error: false,
      errorMessage: null,

      fetchAgents: async () => {
        set({ loading: true, error: false });
        try {
          const result = await api.fetchAgents();
          set({
            agents: result?.data || [],
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
          set({
            agents: [...get().agents, result?.data],
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
    }),
    {
      name: "agent-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({
        agents: state.agents,
      }),
    }
  )
);