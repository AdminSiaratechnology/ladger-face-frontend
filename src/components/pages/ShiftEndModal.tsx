import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePosStore } from "../../../store/posStore";
import { getCurrencySymbol } from "../../lib/currency.utils";
import { format } from "date-fns";
import { toast } from "sonner";
import api from "@/api/api";
import { useCompanyStore } from "../../../store/companyStore";
/* -----------------------------
   FORMAT AMOUNT (2 DECIMALS)
----------------------------- */
const formatAmount = (val) => Number(val || 0).toFixed(2);

export default function ShiftEndModal({ isOpen, onClose }) {
  const {
    openingCash,
    sessionStart,
    getCashSales,
    getCardSales,
    getUpiSales,
    resetSession,
  } = usePosStore();

  // ------------------------------------
  // CURRENCY
  // ------------------------------------
  const {defaultSelected} =useCompanyStore();
  const currency = getCurrencySymbol(defaultSelected?.country || "India");

  // ------------------------------------
  // SALES
  // ------------------------------------
  const cashSales = getCashSales();
  const cardSales = getCardSales();
  const upiSales = getUpiSales();

  const expectedClosingCash = (openingCash || 0) + cashSales;

  const sessionStartFormatted = sessionStart
    ? format(new Date(sessionStart), "dd MMM, hh:mm a")
    : "Not Started";

  const sessionEndFormatted = format(new Date(), "dd MMM, hh:mm a");

  // ------------------------------------
  // DENOMINATIONS
  // ------------------------------------
  const [denoms, setDenoms] = useState({
    1: 0,
    2: 0,
    5: 0,
    10: 0,
    20: 0,
    50: 0,
    100: 0,
    200: 0,
    500: 0,
  });

  const colorMap = {
    1: "bg-gray-100",
    2: "bg-gray-100",
    5: "bg-blue-50",
    10: "bg-yellow-100",
    20: "bg-red-100",
    50: "bg-purple-100",
    100: "bg-blue-100",
    200: "bg-orange-100",
    500: "bg-purple-200",
  };

  const totalCashCounted = useMemo(() => {
    return Object.entries(denoms).reduce(
      (sum, [note, qty]) => sum + Number(note) * Number(qty),
      0
    );
  }, [denoms]);
  console.log(totalCashCounted);

  // ------------------------------------
  // SHIFT CLOSE
  // ------------------------------------
const handleLogout = async () => {
 if (cashSales > 0 && totalCashCounted <= 0) {
  toast.error("Please enter your actual cash counted before closing the shift.");
  return;
}
if (
  cashSales > 0 &&
  Number(totalCashCounted) > Number(expectedClosingCash)
) {
  toast.error("Actual cash cannot be greater than expected cash.");
  return;
}

  const payload = {
    companyId: defaultSelected?._id,
    sessionStart,
    openingCash,
    cashSales,
    cardSales,
    upiSales,
    expectedClosingCash,
    actualCashCounted:  Number(totalCashCounted),
    cashDenomination: {
      denominations: denoms,
      totalCash: totalCashCounted,
    },
  };

  try {
    await api.closeShiftApi(payload);

    toast.success("Shift closed successfully");

    resetSession();
    localStorage.removeItem("posSessionActive");
    window.dispatchEvent(new Event("pos-session-ended"));
    onClose();
  } catch (err) {
    console.error(err);
    toast.error("Failed to close shift");
  }
};


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="custom-dialog-container !p-0 max-w-[900px] w-full overflow-hidden rounded-2xl">

        {/* HEADER */}
        <div className="bg-green-600 text-white px-6 py-4 rounded-t-xl">
          <h2 className="text-2xl font-bold">Closing Register</h2>
          <p className="text-sm opacity-80">End of Shift Summary</p>
        </div>

        {/* SESSION TIME */}
        <div className="grid grid-cols-2 gap-4 p-6">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm opacity-70">Session Started</p>
            <p className="text-lg font-semibold">{sessionStartFormatted}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm opacity-70">Session Ended</p>
            <p className="text-lg font-semibold">{sessionEndFormatted}</p>
          </div>
        </div>

        {/* SALES SUMMARY */}
        <div className="grid grid-cols-3 gap-4 px-6">
          <SummaryBox title="Cash Sales" value={cashSales} currency={currency} color="bg-green-50" />
          <SummaryBox title="Card Sales" value={cardSales} currency={currency} color="bg-purple-50" />
          <SummaryBox title="UPI Sales" value={upiSales} currency={currency} color="bg-orange-50" />
        </div>

        {/* CASH RECONCILIATION */}
        <div className="bg-yellow-50 rounded-xl p-6 mt-6 mx-6">
          <p className="font-bold text-lg">{currency} Cash Reconciliation</p>

          <div className="flex justify-between py-1">
            <span>Opening Cash</span>
            <span>{currency}{formatAmount(openingCash)}</span>
          </div>

          <div className="flex justify-between py-1">
            <span>+ Cash Sales</span>
            <span>{currency}{formatAmount(cashSales)}</span>
          </div>

          <div className="border-t mt-2 pt-2 flex justify-between font-bold text-green-700 text-xl">
            <span>Expected Closing Cash</span>
            <span>{currency}{formatAmount(expectedClosingCash)}</span>
          </div>
        </div>

        {/* DIGITAL PAYMENTS */}
        <div className="bg-blue-50 rounded-xl p-6 mt-6 mx-6">
          <p className="font-bold">Digital Payments</p>
          <p className="text-md mt-1">
            Card + UPI Total: {currency}{formatAmount(cardSales + upiSales)}
          </p>
        </div>

        {/* DENOMINATION */}
        <div className="mx-6 mt-8">
          <h3 className="font-bold text-lg mb-3">{currency} Cash Denomination Breakup</h3>

          <div className="grid grid-cols-5 gap-4">
            {Object.keys(denoms).map((note) => (
              <div
                key={note}
                className={`${colorMap[note]} p-4 rounded-2xl shadow border text-center`}
              >
                <p className="text-lg font-semibold">{currency}{note}</p>

                <input
                  type="number"
                  min="0"
                  className="w-full border rounded-lg mt-3 py-1.5 text-center bg-white outline-none"
                  value={denoms[note]}
                  onChange={(e) =>
                    setDenoms({ ...denoms, [note]: Math.max(0, Number(e.target.value)) })
                  }
                />

                <p className="mt-2 text-sm font-medium">
                  = {currency}{formatAmount(Number(note) * Number(denoms[note]))}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* TOTAL */}
        <div className="mx-6 mt-6 p-6 rounded-2xl border shadow-sm bg-white">
          <div className="flex justify-between text-lg">
            <span className="font-medium">Expected Cash</span>
            <span className="font-bold text-blue-600">
              {currency}{formatAmount(expectedClosingCash)}
            </span>
          </div>

          <div className="flex justify-between mt-3 text-lg">
            <span className="font-medium">Actual Cash Counted</span>
            <span className="font-bold text-green-600">
              {currency}{formatAmount(totalCashCounted)}
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-4 p-6">
          <button className="bg-blue-600 text-white w-full py-3 rounded-lg cursor-pointer">
            Print Report
          </button>

          <button
            onClick={handleLogout}
            className="bg-green-600 text-white w-full py-3 rounded-lg cursor-pointer"
          >
            Close Shift & Logout
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

/* -----------------------------
   SUMMARY BOX
----------------------------- */
function SummaryBox({ title, value, color, currency }) {
  return (
    <div className={`${color} p-4 rounded-xl text-center shadow`}>
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-xl font-bold">
        {currency}{formatAmount(value)}
      </p>
    </div>
  );
}
