// Updated useProductStore with pagination and filter support
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api";

interface TaxConfiguration {
  applicable: boolean;
  hsnCode: string;
  taxPercentage: number;
  cgst: number;
  sgst: number;
  cess: number;
  additionalCess: number;
  applicableDate: string;
}

interface ProductImage {
  id: number;
  angle: string;
  file: File;
  previewUrl: string;
}

interface OpeningQuantity {
  id: number;
  godown: string;
  batch: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Product {
  id: number;
  _id: string;
  code: string;
  name: string;
  partNo: string;
  stockGroup: string;
  stockCategory: string;
  batch: boolean;
  unit: string;
  alternateUnit: string;
  createdAt: string;
  openingQuantities?: OpeningQuantity[];
  minimumQuantity?: number;
  defaultSupplier?: string;
  minimumRate?: number;
  maximumRate?: number;
  companyId?: string;
  defaultGodown?: string;
  productType?: string;
  taxConfiguration?: TaxConfiguration;
  images?: ProductImage[];
  remarks?: string;
  isDeleted: boolean;
}

interface ProductStore {
  products: Product[];
  pagination: Pagination;
  loading: boolean;
  error: boolean;
  errorMessage: string | null;
  fetchProducts: (page?: number, limit?: number, companyId?:number |string ) => Promise<void>;
  addProduct: (product: FormData) => Promise<void>;
  updateProduct: (params: { id: string; product: FormData }) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  filterProducts: (
    searchTerm: string,
    statusFilter: 'all' | 'Active' | 'Inactive',
    sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
    companyId?:number | string,
    page?: number,
    limit?: number
  ) => Promise<Product[]>;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      },
      loading: false,
      error: false,
      errorMessage: null,

      // ✅ Fetch products with pagination
      fetchProducts: async (page = 1, limit = 10, companyId) => {
        set({ loading: true, error: false });
        try {
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          const id = companyId?.toLocaleString();

          const result = await api.fetchProducts({companyId:id}, { queryParams: queryParams.toString() }); // Adjust api call
          set({
            products: result?.data?.items || [],
            pagination: result?.data?.pagination,
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to fetch products",
          });
        }
      },

      // ✅ Add product
      addProduct: async (product) => {
        console.log(product,"addproduct")
        set({ loading: true });
        try {
          const result = await api.createProduct(product);
          set({
            products: [...get().products, result?.data],
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to add product",
          });
        }
      },

      // ✅ Update product
      updateProduct: async ({ id, product }) => {
        console.log(id,product,"ppeppepepepepep")
        set({ loading: true });
        try {
          const result = await api.updateProduct({id, product});
          set({
            products: get().products.map((p) =>
              p?._id === id ? result?.data : p
            ),
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to update product",
          });
        }
      },

      // ✅ Delete product (soft delete using `isDeleted`)
      deleteProduct: async (id) => {
        set({ loading: true });
        try {
          await api.deleteProduct(id);
          set({
            products: get().products.filter((p) => p?._id !== id),
            loading: false,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to delete product",
          });
        }
      },

      filterProducts: async (
        searchTerm: string,
        statusFilter: 'all' | 'Active' | 'Inactive',
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
            sortBy: sortBy.includes('name') ? 'name' : 'createdAt',
            sortOrder: sortBy.includes('Desc') ? 'desc' : 'asc',
            page: page.toString(),
            limit: limit.toString(),
            companyId:companyId?.toLocaleString(),
          });

          const result = await api.fetchProducts({companyId}, { queryParams: queryParams.toString() }); // Adjust api call
          console.log("Filter result for products:", result);

          set({
            products: result?.data?.items || [],
            pagination: result?.data?.pagination,
            loading: false,
          });

          return result?.data?.items || [];
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errorMessage:
              error?.response?.data?.message || "Failed to filter products",
          });
          return [];
        }
      },
    }),
    {
      name: "product-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({
        products: state.products,
      }),
    }
  )
);