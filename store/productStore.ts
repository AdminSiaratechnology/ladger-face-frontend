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
  loading: boolean;
  error: boolean;
  errorMessage: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (params: { id: number; product: Product }) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      loading: false,
      error: false,
      errorMessage: null,

      // ✅ Fetch all products
      fetchProducts: async () => {
        set({ loading: true, error: false });
        try {
          const result = await api.fetchProducts();
          set({
            products: result?.data?.items || [],
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
          const result = await api.updateProduct(id, product);
          set({
            products: get().products.map((p) =>
              p?.["_id"] == id ? result?.data : p
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
            products: get().products.filter((p) =>{
              console.log(p,id,"ojkjojoojoj")

              return p?.["_id"] !== id
            } )
            ,
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
