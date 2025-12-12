import React, { useState, useMemo } from "react";
import { usePosStore } from "../../../store/posStore";

export default function DraftBillModal({ isOpen, onClose, onSelectDraft }: any) {
  if (!isOpen) return null;

  const { draftBills, removeDraft } = usePosStore();
  const [search, setSearch] = useState("");

  // SEARCH FILTER LOGIC
  const filteredDrafts = useMemo(() => {
    if (!search.trim()) return draftBills;

    const text = search.toLowerCase();

    return draftBills.filter((d: any) => {
      const matchId = String(d.id).includes(text);
      const matchAmount = String(d.totalAmount).includes(text);
      const matchCustomer = (d.customerName || "").toLowerCase().includes(text);

      // 🔍 SEARCH BY PRODUCT NAME OR ID
      const matchProducts = d.items?.some((item: any) => {
        return (
          String(item.productId).toLowerCase().includes(text) ||
          String(item.productName || "").toLowerCase().includes(text)
        );
      });

      return matchId || matchAmount || matchCustomer || matchProducts;
    });
  }, [search, draftBills]);


  // HANDLE BILL SELECT
  const handleSelect = (bill: any) => {
    onSelectDraft(bill);     // Render into cart
    removeDraft(bill.id);    // Remove from draft store
    onClose();               // Close modal
  };


  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] rounded-2xl shadow-xl p-6">

        <div className="flex justify-between border-b pb-3">
          <h1 className="text-xl font-bold">Draft Bills</h1>
          <button onClick={onClose} className="text-2xl">✕</button>
        </div>

        {/* 🔍 SEARCH BAR */}
        <input
          type="text"
          placeholder="Search by ID, customer, amount, product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-100 rounded-xl px-4 py-2 mt-4 outline-none"
        />

        {/* No results */}
        {filteredDrafts.length === 0 && (
          <div className="py-10 text-gray-500 text-center">No Draft Bills Found</div>
        )}

        {/* Draft List */}
        <div className="max-h-[60vh] overflow-y-auto mt-4 space-y-3">
          {filteredDrafts.map((d: any) => {
            const productIds = d.items?.map((i: any) => i.productId).join(", ") || "N/A";
            const productNames = d.items?.map((i: any) => i.productName).join(", ") || "N/A";

            return (
              <div
                key={d.id}
                onClick={() => handleSelect(d)}
                className="p-4 border rounded-xl bg-gray-50 hover:bg-white shadow-sm cursor-pointer"
              >
                <div className="flex justify-between">
                  <span className="font-semibold">Draft #{d.id}</span>
                  <span className="font-semibold text-blue-600">₹{d.totalAmount}</span>
                </div>

                <p className="text-sm text-gray-600">
                  Customer: {d.customerName || "N/A"}
                </p>

                {/* ⭐ PRODUCT IDS */}
                <p className="text-sm text-gray-700 mt-1">
                  Product IDs: {productIds}
                </p>

                {/* ⭐ PRODUCT NAMES */}
                <p className="text-sm text-gray-700">
                  Products: {productNames}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(d.createdAt).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
