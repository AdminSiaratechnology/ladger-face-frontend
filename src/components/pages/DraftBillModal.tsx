import React from "react";
import { usePosStore } from "../../../store/posStore";

export default function DraftBillModal({ isOpen, onClose, onSelectDraft }: any) {
  if (!isOpen) return null;

  const { draftBills } = usePosStore();

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] rounded-2xl shadow-xl p-6">

        <div className="flex justify-between border-b pb-3">
          <h1 className="text-xl font-bold">Draft Bills</h1>
          <button onClick={onClose} className="text-2xl">✕</button>
        </div>

        {draftBills.length === 0 && (
          <div className="py-10 text-gray-500 text-center">No Draft Bills</div>
        )}

        <div className="max-h-[60vh] overflow-y-auto mt-4 space-y-3">
          {draftBills.map((d: any) => (
            <div
              key={d.id}
              onClick={() => onSelectDraft(d)}
              className="p-4 border rounded-xl bg-gray-50 hover:bg-white shadow-sm cursor-pointer"
            >
              <div className="flex justify-between">
                <span className="font-semibold">Draft #{d.id}</span>
                <span className="font-semibold text-blue-600">₹{d.totalAmount}</span>
              </div>
              <p className="text-sm text-gray-600">Customer: {d.customerName || "N/A"}</p>
              <p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
