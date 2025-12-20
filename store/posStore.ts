import { create } from "zustand";
import { getCompanyPosReport } from "../src/api/api";

export const usePosStore = create((set, get) => ({
  // =================================================
  // CART
  // =================================================
  cart: [],

  setCart: (value) =>
    set((state) => ({
      cart: typeof value === "function" ? value(state.cart) : value,
    })),

  addToCart: (item) => {
    const cart = get().cart;
    const existing = cart.find((x) => x.cartId === item.cartId);

    if (existing) {
      set({
        cart: cart.map((x) =>
          x.cartId === item.cartId ? { ...x, qty: x.qty + 1 } : x
        ),
      });
    } else {
      set({ cart: [...cart, item] });
    }
  },

  clearCart: () => set({ cart: [] }),

  // =================================================
  // CUSTOMER
  // =================================================
  customerName: "",
  customerPhone: "",
  setCustomerName: (v) => set({ customerName: v }),
  setCustomerPhone: (v) => set({ customerPhone: v }),

  // =================================================
  // DRAWER CASH
  // =================================================
  drawerCash: Number(localStorage.getItem("drawerCash") || 0),

  setDrawerCash: (amt) => {
    localStorage.setItem("drawerCash", String(amt));
    set({ drawerCash: amt });
  },

  addToDrawerCash: (amt) => {
    const updated = get().drawerCash + amt;
    localStorage.setItem("drawerCash", String(updated));
    set({ drawerCash: updated });
  },

  // =================================================
  // SESSION START
  // =================================================
  sessionStart: localStorage.getItem("sessionStart") || null,

  setSessionStart: () => {
    const now = new Date().toISOString();
    localStorage.setItem("sessionStart", now);
    set({ sessionStart: now });
  },

  // =================================================
  // SESSION SALES (LOCAL)
  // =================================================
  sessionSales: JSON.parse(localStorage.getItem("sessionSales") || "[]"),

  addSale: (sale) => {
    const updated = [...get().sessionSales, sale];
    localStorage.setItem("sessionSales", JSON.stringify(updated));
    set({ sessionSales: updated });
  },

  getCashSales: () =>
    get().sessionSales.reduce((sum, s) => {
      if (s.paymentMode === "cash") return sum + s.amount;
      if (s.paymentMode === "split") return sum + (s.split?.cash || 0);
      return sum;
    }, 0),

  getCardSales: () =>
    get().sessionSales.reduce((sum, s) => {
      if (s.paymentMode === "card") return sum + s.amount;
      if (s.paymentMode === "split") return sum + (s.split?.card || 0);
      return sum;
    }, 0),

  getUpiSales: () =>
    get().sessionSales.reduce((sum, s) => {
      if (s.paymentMode === "upi") return sum + s.amount;
      if (s.paymentMode === "split") return sum + (s.split?.upi || 0);
      return sum;
    }, 0),

  // =================================================
  // OPENING CASH
  // =================================================
  openingCash: Number(localStorage.getItem("openingCash") || 0),

  setOpeningCash: (amt) => {
    localStorage.setItem("openingCash", String(amt));
    set({ openingCash: amt });
  },

  // =================================================
  // RESET SESSION
  // =================================================
  resetSession: () => {
    localStorage.removeItem("drawerCash");
    localStorage.removeItem("openingCash");
    localStorage.removeItem("sessionStart");
    localStorage.removeItem("sessionSales");

    set({
      drawerCash: 0,
      openingCash: 0,
      sessionStart: null,
      sessionSales: [],
    });
  },

  // =================================================
  // DRAFT BILLS
  // =================================================
  draftBills: JSON.parse(localStorage.getItem("draftBills") || "[]"),

  addDraftBill: (draft) => {
    const updated = [...get().draftBills, draft];
    localStorage.setItem("draftBills", JSON.stringify(updated));
    set({ draftBills: updated });
  },

  removeDraftBill: (id) => {
    const updated = get().draftBills.filter((d) => d.id !== id);
    localStorage.setItem("draftBills", JSON.stringify(updated));
    set({ draftBills: updated });
  },

  loadDraftBill: (draft) =>
    set({
      cart: Array.isArray(draft.cart) ? draft.cart : [],
      customerName: draft.customerName,
      customerPhone: draft.customerPhone,
    }),

  removeDraft: (id) =>
    set((state) => ({
      draftBills: state.draftBills.filter((bill) => bill.id !== id),
    })),

  // =================================================
  // BILL NUMBER
  // =================================================
  billNumber: "---",
  setBillNumber: (v) => set({ billNumber: v }),

  // =================================================
  // BATCH MODAL
  // =================================================
  batchProduct: null,
  setBatchProduct: (p) => set({ batchProduct: p }),

  // =================================================
  // 🔥 BACKEND POS REPORT (COMPANY WISE)
  // =================================================
  posReportData: [],
  posReportStats: null,
  posReportLoading: false,

  // ✅ NEW: PAGINATION STATE
  posReportPagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  // =================================================
  // CART ACTIONS (QTY + REMOVE)
  // =================================================
  increaseQty: (item) => {
    const cart = get().cart;

    const updated = cart.map((p) =>
      p.cartId === item.cartId
        ? { ...p, qty: p.qty + 1 }
        : p
    );

    set({ cart: updated });
  },

  decreaseQty: (item) => {
    const cart = get().cart;

    let updated = cart
      .map((p) =>
        p.cartId === item.cartId
          ? { ...p, qty: p.qty - 1 }
          : p
      )
      .filter((p) => p.qty > 0);

    // 🔥 BOGO FIX: buy remove → free remove
    if (!item.isFreeItem) {
      updated = updated.filter(
        (p) => p.bogoParentId !== item._id
      );
    }

    set({ cart: updated });
  },

  removeItem: (item) => {
    let updated = get().cart.filter(
      (p) => p.cartId !== item.cartId
    );

    // 🔥 BOGO FIX
    if (!item.isFreeItem) {
      updated = updated.filter(
        (p) => p.bogoParentId !== item._id
      );
    }

    set({ cart: updated });
  },


  // ✅ UPDATED FETCH (pagination wired)
  fetchCompanyPosReport: async (params) => {
    set({ posReportLoading: true });

    try {
      const res = await getCompanyPosReport(params);

      set({
        posReportData: res.data || [],
        posReportStats: res.stats || null,
        posReportPagination: res.pagination || {
          total: 0,
          page: 1,
          limit: params.limit || 10,
          totalPages: 1,
        },
        posReportLoading: false,
      });
    } catch (e) {
      console.error("POS REPORT FETCH ERROR:", e);
      set({ posReportLoading: false });
    }
  },
}));
