import React, { useState } from "react";
import { getCurrencySymbol } from "../../lib/currency.utils";

export default function PosOpeningCash({ isOpen, onSubmit, defaultSelected }: any) {
  if (!isOpen) return null;

  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  const currency = getCurrencySymbol(defaultSelected?.country);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[430px] p-6 shadow-xl">

        <div className="bg-teal-600 text-white p-4 rounded-xl flex gap-3">
          <span className="text-4xl">{currency}</span>
          <div>
            <h2 className="text-xl font-bold">Opening Cash</h2>
            <p className="text-sm opacity-90">Enter cash in register</p>
          </div>
        </div>

        <label className="text-sm font-medium mt-6 block">Opening Cash</label>
        <div className="border rounded-xl mt-2 h-14 flex items-center px-4 bg-gray-50">
          <span className="text-xl font-bold">{currency}</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter amount..."
            className="ml-3 flex-1 bg-transparent text-lg font-semibold"
          />
        </div>

        <label className="text-sm font-medium mt-4 block">Description</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Reason / note..."
          className="w-full border rounded-xl px-3 py-2 h-20 bg-gray-50 mt-2 resize-none"
        />

        <button
          onClick={() => onSubmit(Number(amount), desc)}
          className="mt-5 w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-3 font-semibold"
        >
          Start POS
        </button>
      </div>
    </div>
  );
}
