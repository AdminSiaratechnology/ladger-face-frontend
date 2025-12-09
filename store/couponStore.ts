import { create } from "zustand";
import api from "../src/api/api";
import { toast } from "sonner";

export const useCouponStore = create((set, get) => ({
    coupons: [],
    loading: false,
    error: null,

    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },

    // ======================================================
    // 1️⃣ FETCH COUPONS (WITH STATUS FILTER SUPPORT)
    // ======================================================
    fetchCoupons: async (page = 1, limit = 10, companyId, status = "all") => {
        try {
            set({ loading: true, error: null });

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                status: status.toString(),
            });

            const result = await api.getAllCouponsByCompany(
                { companyId },
                { queryParams: queryParams.toString() }
            );

            set({
                coupons: result?.data || [],
                pagination: result?.pagination || {
                    total: 0,
                    page: 1,
                    limit: 10,
                    totalPages: 0,
                },
                loading: false,
            });

        } catch (err) {
            console.error("❌ Fetch coupon error:", err);
            set({ loading: false, error: err.message });
        }
    },

    // ======================================================
    // 2️⃣ CREATE COUPON
    // ======================================================
    addCoupon: async (couponData) => {
        try {
            set({ loading: true, error: null });

            const res = await api.createCoupon(couponData);
            const newCoupon = res.data;

            set({
                coupons: [newCoupon, ...get().coupons],
                loading: false,
            });

            toast.success("Coupon created successfully 🎉");
            return res;

        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                "Error creating coupon";

            toast.error(msg);
            set({ loading: false, error: msg });

            return { success: false, message: msg };
        }
    },

    // ======================================================
    // 3️⃣ UPDATE COUPON
    // ======================================================
   updateCoupon: async (id, payload) => {
  set({ loading: true });

  try {
    const res = await api.updateCoupon(id, payload);

    // Update in store
    set({
      coupons: get().coupons.map((c) =>
        c._id === id ? res.data.data : c
      ),
      loading: false,
    });

    // ⭐ RE-FETCH LIST FROM BACKEND
    get().fetchCoupons(1, 10, payload.company);

    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message };
  }
},


    // ======================================================
    // 4️⃣ SOFT DELETE COUPON (status → delete)
    // ======================================================
    deleteCoupon: async (id) => {
        try {
            const res = await api.deleteCoupon(id); // backend sets status="delete"

            // FRONTEND UPDATE — DO NOT REMOVE — JUST UPDATE STATUS
            set({
                coupons: get().coupons.map((c) =>
                    c._id === id ? { ...c, status: "delete" } : c
                ),
            });

            toast.success("Coupon moved to delete");
            return { success: true };

        } catch (err) {
            return { success: false, message: err.response?.data?.message };
        }
    },
}));
