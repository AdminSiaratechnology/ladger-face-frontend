// src/store/useTemplateStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../src/api/api"; // your API module
import { toast } from "sonner";

// --- Interfaces ---

export interface TemplateField {
  key: string;
  label?: string;
  enabled?: boolean;
  required?: boolean;
  defaultValue?: any;
  position?: number;
  uiType?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customMessage?: string;
  };
  group?: string;
}

export interface CalculationRule {
  discountType?: "none" | "flat" | "percentage";
  discountValue?: number;
  discountAppliedOn?: "subtotal" | "perItem";
  taxMode?: "none" | "intra" | "inter" | "custom";
  cgstPercent?: number;
  sgstPercent?: number;
  igstPercent?: number;
  cessPercent?: number;
  taxBase?: "subtotal" | "subtotalAfterDiscount";
  applyTaxOnItems?: boolean;
  otherCharges?: any[];
  roundOffEnabled?: boolean;
  roundOffMethod?: "nearest" | "floor" | "ceil";
  roundOffPrecision?: number;
  calculationOrder?: string[];
}

export interface BillTemplate {
  _id?: string;
  templateName: string;
  description?: string;
  category?: string;
  fields?: TemplateField[];
  ledgerNames?: string[];
  itemConfig?: Record<string, any>;
  layout?: Record<string, any>;
  numberingConfig?: Record<string, any>;
  calculationRules?: CalculationRule;
  termsAndConditions?: string;
  paymentTerms?: Record<string, any>;
  showBankDetails?: boolean;
  isDefault?: boolean;
  status?: "active" | "inactive" | "archived";
  usageCount?: number;
  lastUsedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TemplateStore {
  templates: BillTemplate[];
  pagination: Pagination;
  loading: boolean;
  error: boolean;
  errorMessage: string | null;

  fetchTemplates: (
    page?: number,
    limit?: number,
    search?: string,
    statusFilter?: "all" | "active" | "inactive" | "archived",
    sortBy?: string,
    companyId?: string
  ) => Promise<void>;
  addTemplate: (template: FormData) => Promise<void>;
  updateTemplate: (params: { id: string; template: FormData }) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  setDefaultTemplate: (id: string) => Promise<void>;
  filterTemplates: (
    searchTerm: string,
    statusFilter: "all" | "active" | "inactive" | "archived",
    sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
    page?: number,
    limit?: number,
    category?: string
  ) => Promise<BillTemplate[]>;
  initialLoading: () => void;
}

// --- Store Implementation ---

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      loading: true,
      error: false,
      errorMessage: null,

      fetchTemplates: async ({
        page = 1,
        limit = 10,
        searchTerm = "",
        sortBy = "createdAt",
        statusFilter = "all",
        companyId,
      }: {
        page?: number;
        limit?: number;
        searchTerm?: string;
        sortBy?: string;
        statusFilter?: "all" | "active" | "inactive";
        companyId?: string;
      }) => {
        try {
          set({ loading: true, error: false });

          // Build query params
          const params: Record<string, string> = {
            page: page.toString(),
            limit: limit.toString(),
            search: searchTerm,
            sortBy: sortBy.includes("name") ? "templateName" : "createdAt",
            sortOrder: sortBy.includes("Desc") ? "desc" : "asc",
            status: statusFilter !== "all" ? statusFilter : "",
          };

          const queryParams = new URLSearchParams(params);

          const result = await api.fetchTemplatesByCompany(
            companyId ? { companyId } : {},
            { queryParams: queryParams.toString() }
          );

          set({
            templates: result?.data?.templates || [],
            pagination: result?.data?.pagination,
            loading: false,
          });

          return result?.data?.templates || [];
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to fetch templates",
          });
          return [];
        }
      },

      addTemplate: async (template) => {
        set({ loading: true });
        try {
          const result = await api.createTemplate(template);          
          set({ templates: [...get().templates, result.data], loading: false });
          toast.success("Template added successfully");
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage: error?.response?.data?.message,
          });
          toast.error(
            error?.response?.data?.message || "Failed to add template"
          );
        }
      },

      updateTemplate: async ({ id, template }) => {
        set({ loading: true });
        try {
          const result = await api.updateTemplate(id, template);
          set({
            templates: get().templates.map((t) =>
              t._id === id ? result.data : t
            ),
            loading: false,
          });
          toast.success("Template updated successfully");
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage: error?.response?.data?.message,
          });
          toast.error(
            error?.response?.data?.message || "Failed to update template"
          );
        }
      },

      deleteTemplate: async (id) => {
        set({ loading: true });
        try {
          await api.deleteTemplate(id);
          set({
            templates: get().templates.filter((t) => t._id !== id),
            loading: false,
          });
          toast.success("Template deleted successfully");
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage: error?.response?.data?.message,
          });
          toast.error(
            error?.response?.data?.message || "Failed to delete template"
          );
        }
      },

      setDefaultTemplate: async (id) => {
        set({ loading: true });
        try {
          await api.setDefaultTemplate(id); // API should handle unsetting previous default
          get().fetchTemplates();
          toast.success("Default template set successfully");
        } catch (error: any) {
          set({ loading: false });
          toast.error(
            error?.response?.data?.message || "Failed to set default template"
          );
        }
      },

      filterTemplates: async (
        searchTerm,
        statusFilter,
        sortBy,
        page = 1,
        limit = 10,
        category
      ) => {
        try {
          set({ loading: true, error: false });

          const params: Record<string, string> = {
            search: searchTerm,
            status: statusFilter !== "all" ? statusFilter : "",
            sortBy: sortBy.includes("name") ? "templateName" : "createdAt",
            sortOrder: sortBy.includes("Desc") ? "desc" : "asc",
            page: page.toString(),
            limit: limit.toString(),
          };
          if (category) params.category = category;

          const queryParams = new URLSearchParams(params);

          const result = await api.fetchTemplates({
            queryParams: queryParams.toString(),
          });

          set({
            templates: result?.data?.templates || [],
            pagination: result?.data?.pagination,
            loading: false,
          });

          return result?.data?.templates || [];
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage: error?.response?.data?.message,
          });
          return [];
        }
      },

      initialLoading: () => set({ loading: true, error: false }),
    }),
    {
      name: "template-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ templates: state.templates }),
    }
  )
);
