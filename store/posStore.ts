import { create } from "zustand";

export const usePosStore = create((set, get) => ({
  // CART
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

  // CUSTOMER INFO
  customerName: "",
  customerPhone: "",
  setCustomerName: (v) => set({ customerName: v }),
  setCustomerPhone: (v) => set({ customerPhone: v }),

  // DRAWER CASH
  drawerCash: Number(localStorage.getItem("drawerCash") || 0),
  updateDrawerCash: (amt) => {
    const updated = get().drawerCash + amt;
    localStorage.setItem("drawerCash", String(updated));
    set({ drawerCash: updated });
  },

  // DRAFT BILLS
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

  // BILL NUMBER
  billNumber: "---",
  setBillNumber: (v) => set({ billNumber: v }),

  // BATCH MODAL
  batchProduct: null,
  setBatchProduct: (p) => set({ batchProduct: p }),
}));
