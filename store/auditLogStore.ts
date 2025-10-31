import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api";
import { toast } from "sonner";

// 🔹 Interfaces
export interface PerformedBy {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface ReferenceId {
  _id: string;
  [key: string]: any; // dynamic fields depending on module
}

export interface AuditLog {
  _id: string;
  module: string;
  action: string;
  performedBy?: PerformedBy;
  referenceId?: ReferenceId;
  ipAddress?: string;
  details?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogStore {
  auditEvents: AuditLog[];
  auditEventsDetail: AuditLog[];
  singleAuditEvent: AuditLog | null ;
  pagination: Pagination;
  loading: boolean;
  error: boolean;
  errorMessage: string | null;

  // ✅ Existing API
  fetchAuditEvents: (options?: {
    search?: string;
    module?: string;
    action?: string;
    performedBy?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }) => Promise<void>;

  // ✅ New API 1: All Audit Logs (with populate)
  fetchAllAuditEvents: (options?: {
    search?: string;
    module?: string;
    action?: string;
    performedBy?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }) => Promise<void>;

  // ✅ New API 2: Single Audit Log by ID
  fetchAuditLogById: (id: string) => Promise<void>;

  //Restore deleted recode
  restoreRecord:({module, referenceId,id}:{module:string, referenceId:string,id:string})=>Promise<void>,
  resetStore:()=>Promise<void>
}

export const useAuditLogStore = create<AuditLogStore>()(
  persist(
    (set) => ({
      auditEvents: [],
      auditEventsDetail:[],
      singleAuditEvent: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      loading: false,
      error: false,
      errorMessage: null,

      // ✅ Base Audit Logs (getAuditLogsByClient)
      fetchAuditEvents: async (options = {}) => {
        set({ loading: true, error: false });
        try {
          const params = new URLSearchParams({
            search: options.search || "",
            module: options.module || "",
            action: options.action || "",
            performedBy: options.performedBy || "",
            sortBy: options.sortBy || "createdAt",
            sortOrder: options.sortOrder || "desc",
            page: options.page?.toString() || "1",
            limit: options.limit?.toString() || "10",
          });

          const result = await api.getAuditLogs(params.toString());
          set({
            auditEvents: result?.data?.data?.auditLogs || [],
            pagination: result?.data?.data?.pagination || {
              total: 0,
              page: 1,
              limit: 10,
              totalPages: 0,
            },
            loading: false,
          });
        } catch (error: any) {
          console.error("❌ Failed to fetch audit logs:", error);
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to fetch audit logs",
          });
        }
      },

      // ✅ All Audit Logs with populate (getAuditLogsByClientAllAudilog)
      fetchAllAuditEvents: async (options = {}) => {
        set({ loading: true, error: false });
        try {
          const params = new URLSearchParams({
            search: options.search || "",
            module: options.module || "",
            action: options.action || "",
            performedBy: options.performedBy || "",
            sortBy: options.sortBy || "createdAt",
            sortOrder: options.sortOrder || "desc",
            page: options.page?.toString() || "1",
            limit: options.limit?.toString() || "10",
          });

          const result = await api.getAuditLogsDetail(params.toString());
          console.log(result?.data?.data?.auditLogs,"resultttt")
          set({
            auditEventsDetail: result?.data?.data?.auditLogs || [],
            pagination: result?.data?.data?.pagination || {
              total: 0,
              page: 1,
              limit: 10,
              totalPages: 0,
            },
            loading: false,
          });
        } catch (error: any) {
          console.error("❌ Failed to fetch all audit logs:", error);
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message ||
              "Failed to fetch all audit logs",
          });
        }
      },

      // ✅ Single Audit Log Detail (getAuditLogsByClientDetailByID)
      fetchAuditLogById: async (id: string) => {
        set({ loading: true, error: false ,singleAuditEvent:null});
        try {
          const result = await api.getAuditLogsByID(id);
          const auditLogs = result?.data?.data?.auditLogs || [];
          set({
            singleAuditEvent: auditLogs.length ? auditLogs[0] : null,
            loading: false,
          });
        } catch (error: any) {
          console.error("❌ Failed to fetch audit log by ID:", error);
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message ||
              "Failed to fetch audit log by ID",
          });
        }
      },

      //restore record
      restoreRecord:async({module, referenceId,id})=>{
        console.log(module, referenceId,id,"module, referenceId,id")
        set({ loading: true, error: false ,singleAuditEvent:null});
        try {
          const result=await api.restoreRecord({module, referenceId,id})
          console.log(result,"restoredresult")
            toast.success("Record restored successfully");
         
          
        } catch (error) {
          console.log(error,"errorrr")
          toast.error(error?.response?.data?.message ||
              "Failed perform restore",)
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message ||
              "Failed to fetch audit log by ID",
          });
        }
      },
      resetStore:()=>{
        set({   auditEvents: [],
      auditEventsDetail:[],
      singleAuditEvent: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      loading: false,
      error: false,
      errorMessage: null})
      }
    }),
    {
      name: "auditlog-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({
        auditEvents: state.auditEvents,
        auditEventsDetail:state.auditEventsDetail,
        singleAuditEvent: state.singleAuditEvent,
      }),
    }
  )
);
