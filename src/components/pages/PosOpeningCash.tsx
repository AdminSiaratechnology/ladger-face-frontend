import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getCurrencySymbol } from "../../lib/currency.utils";

export default function PosOpeningCash({
  isOpen,
  onSubmit,
  defaultSelected,
}: any) {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDesc("");
      setError("");
    }
  }, [isOpen]);

  const currency = getCurrencySymbol(defaultSelected?.country);

  const handleSubmit = () => {
    if (amount === "") {
      setError("Opening cash amount is required.");
      return;
    }

    const amt = Number(amount);
    onSubmit(amt, desc);  // Close handled in parent
  };

 return (
  <div
    className="
      fixed inset-0 z-[200] flex items-center justify-center 
      pointer-events-none   /* background click allowed */
    "
  >
    {/* MODAL BOX */}
    <div
      className="
        relative max-w-[420px] w-full bg-white rounded-xl 
        shadow-[0_8px_20px_rgba(0,0,0,0.15)] overflow-hidden
        z-[210]
        pointer-events-auto   /* modal is clickable */
      "
    >
      {/* HEADER GREEN */}
      <div className="bg-teal-600 text-white p-5 flex items-center gap-4">
        <div className="text-5xl font-bold">{currency}</div>

        <div>
          <h2 className="text-2xl font-semibold">Opening Cash</h2>
          <p className="text-sm opacity-90">Enter cash in register</p>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6 pb-7">
        <label className="text-sm font-medium text-gray-700">
          Opening Amount
        </label>

        <div className="border rounded-lg mt-2 h-12 flex items-center px-3 bg-gray-50">
          <span className="text-lg font-semibold text-gray-700">{currency}</span>

          <input
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/\D/g, ""));
              setError("");
            }}
            placeholder="0.00"
            inputMode="numeric"
            className="
              ml-3 flex-1 bg-transparent text-lg text-gray-800 
              font-medium outline-none
            "
          />
        </div>

        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

        <label className="text-sm font-medium text-gray-700 mt-5 block">
          Description
        </label>

        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Optional note..."
          className="
            w-full border rounded-lg px-3 py-2 h-20 mt-2 text-gray-800
            bg-gray-50 outline-none resize-none
          "
        />

        <button
          onClick={handleSubmit}
          className="
            mt-6 w-full bg-teal-600 hover:bg-teal-700
            text-white rounded-lg py-3 font-semibold text-base
            shadow-sm transition-all
          "
        >
          Start POS
        </button>
      </div>
    </div>
  </div>
);

}
