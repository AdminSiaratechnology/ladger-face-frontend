import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePosStore } from "../../../store/posStore";
import { getCurrencySymbol } from "../../lib/currency.utils";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ShiftEndModal({ isOpen, onClose, defaultSelected }) {
  const {
    openingCash,
    sessionStart,
    getCashSales,
    getCardSales,
    getUpiSales,
    resetSession,
  } = usePosStore();

  // ------------------------------------
  // GET CURRENCY SYMBOL
  // ------------------------------------
  const currency = getCurrencySymbol(defaultSelected?.country || "India");

  // ------------------------------------
  // CALCULATED VALUES
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
  // DENOMINATIONS (NO 2000)
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

  const colorMap: any = {
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

  // ------------------------------------
  // SHIFT END LOGOUT
  // ------------------------------------
  const handleLogout = () => {
    if (totalCashCounted <= 0) {
      toast.error("Please enter your actual cash counted before closing the shift.");
      return;
    }

    resetSession();
    localStorage.removeItem("posSessionActive");
    window.dispatchEvent(new Event("pos-session-ended"));
    onClose();
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="custom-dialog-container !p-0 max-w-[900px] w-full overflow-hidden rounded-2xl"
      >

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
            <span>{currency}{openingCash}</span>
          </div>

          <div className="flex justify-between py-1">
            <span>+ Cash Sales</span>
            <span>{currency}{cashSales}</span>
          </div>

          <div className="border-t mt-2 pt-2 flex justify-between font-bold text-green-700 text-xl">
            <span>Expected Closing Cash</span>
            <span>{currency}{expectedClosingCash}</span>
          </div>
        </div>

        {/* DIGITAL PAYMENTS */}
        <div className="bg-blue-50 rounded-xl p-6 mt-6 mx-6">
          <p className="font-bold">Digital Payments</p>
          <p className="text-md mt-1">
            Card + UPI Total: {currency}{cardSales + upiSales}
          </p>
        </div>

        {/* DENOMINATION ENTRY */}
        <div className="mx-6 mt-8">
          <h3 className="font-bold text-lg mb-3">{currency} Cash Denomination Breakup</h3>

          <div className="grid grid-cols-5 gap-4">
            {Object.keys(denoms).map((note) => (
              <div
                key={note}
                className={`${colorMap[note]} p-4 rounded-2xl shadow border text-center`}
              >
                <p className="text-lg font-semibold text-gray-800">
                  {currency}{note}
                </p>

                <input
                  type="number"
                  min="0"
                  className="w-full border rounded-lg mt-3 py-1.5 text-center bg-white text-gray-800 outline-none"
                  value={denoms[note]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDenoms({ ...denoms, [note]: val < 0 ? 0 : val });
                  }}
                />


                <p className="mt-2 text-sm font-medium text-gray-700">
                  = {currency}{Number(note) * Number(denoms[note])}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* TOTAL SUMMARY */}
        <div className="mx-6 mt-6 p-6 rounded-2xl border shadow-sm bg-white">
          <div className="flex justify-between text-lg">
            <span className="font-medium text-gray-700">Expected Cash</span>
            <span className="font-bold text-blue-600">
              {currency}{expectedClosingCash}
            </span>
          </div>

          <div className="flex justify-between mt-3 text-lg">
            <span className="font-medium text-gray-700">Actual Cash Counted</span>
            <span className="font-bold text-green-600">
              {currency}{totalCashCounted}
            </span>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
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

function SummaryBox({ title, value, color, currency }) {
  return (
    <div className={`${color} p-4 rounded-xl text-center shadow`}>
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-xl font-bold">{currency}{value || 0}</p>
    </div>
  );
}
