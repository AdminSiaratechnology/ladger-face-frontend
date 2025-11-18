import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api";
import { toast } from "sonner";

export interface OrderAddress {
  street: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  _id?: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
  discount?: number;
}

export interface PaymentDetails {
  orderSource?: string;
  mode: string;
  status: string;
}

export interface Order {
  _id: string;
  companyId: string;
  clientId: string;
  customerId: string;
  userId: string;

  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;

  items: OrderItem[];

  discount: number;
  tax: number;

  TallyTransactionID: string | null;
  BillGenerated: boolean;
  InvoiceNumber: string | null;
  TallyDate: string | null;
  syncDate: string | null;

  createdBy: string;
  updatedBy?: string;
  status: string;
  orderCode: string;

  createdAt: string;
  updatedAt: string;
}
interface Pagination {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

interface OrderStore {
  orders: Order[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  counts: any;
  fetchOrders: (
    companyId: string,
    page?: number,
    limit?: number,
    search?: string
  ) => Promise<void>;

  createOrder: (orderData: any) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  updateOrder: (orderId: string, updatedData: any) => Promise<Order>;
  resetOrders: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      loading: false,
      error: null,
      counts: null,
      pagination: {
        totalRecords: 0,
        currentPage: 1,
        totalPages: 1,
      },

      // ✅ FETCH ORDERS (Matches your API response format)
    fetchOrders: async (companyId, page = 1, limit = 10, filters: any = {}) => {
  try {
    set({ loading: true, error: null });

    // Create URLSearchParams with basic pagination
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add individual filters as separate query parameters
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      queryParams.append('paymentStatus', filters.paymentStatus);
    }

    const response = await api.fetchOrders(
      { companyId },
      { queryParams: queryParams.toString() }
    );

    set({
      orders: response.orders || [],
      pagination: {
        totalRecords: response.totalRecords,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        limit: response.limit,
      },
      counts: response.counts,
      loading: false,
    });
  } catch (err: any) {
    set({
      loading: false,
      error: err?.response?.data?.message || "Failed to fetch orders",
    });
  }
},

      // ✅ CREATE ORDER
      createOrder: async (orderData) => {
        try {
          set({ loading: true });

          const result = await api.createOrder(orderData);
          const newOrder: Order = result;

          set({
            orders: [newOrder, ...get().orders],
            loading: false,
          });

          toast.success("✅ Order created successfully!");
          return newOrder;
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Error creating order");

          set({
            loading: false,
            error: err?.response?.data?.message || "Failed to create order",
          });

          throw err;
        }
      },
      updateOrderStatus: async (orderId: string, status: string) => {
        try {
          // Optimistic UI update
          set((state) => ({
            orders: state.orders.map((o) =>
              o._id === orderId ? { ...o, status } : o
            ),
          }));

          const res = await api.updateOrderStatus({ orderId, status });
          return res;
        } catch (err: any) {
          toast.error(
            err?.response?.data?.message || "Failed to update order status"
          );
          throw err;
        }
      },
      updateOrder: async (orderId: string, updatedData: any) => {
        try {
          set({ loading: true, error: null });

          // ✅ Send update request to backend
          const res = await api.updateOrder(orderId, updatedData);
          const updatedOrder = res.data || res; // based on your API

          // ✅ Update Zustand store with new order data
          set((state) => ({
            orders: state.orders.map((o) =>
              o._id === orderId ? { ...o, ...updatedOrder } : o
            ),
            loading: false,
          }));

          toast.success("✅ Order updated successfully!");
          return updatedOrder;
        } catch (err: any) {
          set({ loading: false });

          toast.error(err?.response?.data?.message || "Failed to update order");

          throw err;
        }
      },
      filterOrders: async (
        searchTerm: string,
        statusFilter: "all" | "active" | "inactive",
        sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
        companyId: string,
        page = 1,
        limit = 10,
        isLogin = false
      ) => {
        try {
          set({ loading: true, error: null });

          const queryParams = new URLSearchParams({
            search: searchTerm,
            status: statusFilter !== "all" ? statusFilter : "",
            sortBy: sortBy.includes("name") ? "name" : "createdAt",
            sortOrder: sortBy.includes("Desc") ? "desc" : "asc",
            page: page.toString(),
            limit: limit.toString(),
          });

          const res = await api.fetchOrders(
            {
              companyId,
            },
            { queryParams: queryParams.toString() }
          );

          const orders =
            res.data.orders?.length <= 0 && isLogin
              ? [...get().orders]
              : res.data.orders;

          set({
            orders: orders || [],
            pagination: {
              totalRecords: res.data.totalRecords,
              currentPage: res.data.currentPage,
              totalPages: res.data.totalPages,
            },
            counts: res.data.counts,
            loading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to fetch orders",
          });
        }
      },
      // ✅ RESET
      resetOrders: () =>
        set({
          orders: [],
          pagination: {
            totalRecords: 0,
            currentPage: 1,
            totalPages: 1,
          },
          loading: false,
          error: null,
        }),
    }),
    {
      name: "order-storage",
      partialize: (state) => ({
        orders: state.orders,
        pagination: state.pagination,
        counts: state.counts,
      }),
    }
  )
);
