import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getCurrencySymbol } from "../../lib/currency.utils";

export default function PosOpeningCash({
  isOpen,
  onSubmit,
  onClose, // optional callback jab dialog close ho
  defaultSelected,
}: any) {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  // reset state jab dialog open/close ho
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDesc("");
    }
  }, [isOpen]);

  const currency = getCurrencySymbol(defaultSelected?.country);

  return (
    <Dialog open={!!isOpen} onOpenChange={(open) => { if (!open && onClose) onClose(); }}>
      {/* DialogContent ko center karne aur overlay behaviour maintain karne ke liye className */}
      <DialogContent className="max-w-[430px] p-0 overflow-hidden rounded-2xl">
        <div className="bg-white p-6">
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
              inputMode="numeric"
              type="text"
              className="ml-3 flex-1 bg-transparent text-lg font-semibold outline-none"
            />
          </div>

          <label className="text-sm font-medium mt-4 block">Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Reason / note..."
            className="w-full border rounded-xl px-3 py-2 h-20 bg-gray-50 mt-2 resize-none outline-none"
          />

          <button
            onClick={() => {
              // guard: agar amount blank to 0 bhejo
              const amt = Number(amount || 0);
              onSubmit(amt, desc);
            }}
            className="mt-5 w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-3 font-semibold"
          >
            Start POS
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
