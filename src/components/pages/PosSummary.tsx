import React, { useMemo, useState } from "react";
import { Wallet, CreditCard, Smartphone, ShoppingCart } from "lucide-react";

export default function PosSummary({
  cart,
  payment,
  setPayment,
  cashReceived,
  setCashReceived,
  onComplete,
  subtotal,
  onHoldBill,
  defaultSelected,
}: any) {

  // -----------------------------
  // COUNTRY TAX TYPE
  // -----------------------------
  const country = defaultSelected?.country || "India";

  const taxLabel =
    country === "India" ? "GST"
      : country === "UAE" ? "VAT"
        : "Tax";

  // -----------------------------
  // PRODUCT-WISE TAX CALC
  // -----------------------------
  const taxAmount = useMemo(() => {
    let tax = 0;

    cart.forEach((item: any) => {
      let rate = 0;

      if (country === "India") {
        if (item.Category === "Electronics") rate = 18;
        else if (item.Category === "Food") rate = 5;
        else rate = 12;
      }

      if (country === "UAE") rate = 5;

      tax += (item.price * item.qty * rate) / 100;
    });

    return Number(tax.toFixed(2));
  }, [cart, country]);

  const grandTotal = subtotal + taxAmount;

  // -----------------------------
  // SPLIT PAYMENT LOGIC
  // -----------------------------
  const [isSplit, setIsSplit] = useState(false);

  const [splitCash, setSplitCash] = useState("");
  const [splitCard, setSplitCard] = useState("");
  const [splitUpi, setSplitUpi] = useState("");

  const totalPaid =
    Number(splitCash || 0) +
    Number(splitCard || 0) +
    Number(splitUpi || 0);

  const balanceDue = Math.max(0, grandTotal - totalPaid);
  const extraReturn = totalPaid > grandTotal ? totalPaid - grandTotal : 0;

  // -----------------------------
  // SINGLE PAYMENT VALIDATION
  // -----------------------------
  const isCartEmpty = cart.length === 0;

  let isSinglePaymentValid = false;

  if (!isSplit) {
    if (payment === "Cash") {
      // FULL CASH RECEIVED CHECK
      if (Number(cashReceived || 0) >= grandTotal) {
        isSinglePaymentValid = true;
      }
    } else if (payment === "Card" || payment === "UPI") {
      // Card/UPI doesn't need amount input
      isSinglePaymentValid = payment !== "";
    }
  }

  // -----------------------------
  // SPLIT PAYMENT VALIDATION
  // -----------------------------
  const isSplitPaymentValid = isSplit && totalPaid >= grandTotal;

  // -----------------------------
  // CAN COMPLETE BILL?
  // -----------------------------
  const canCompleteBill =
    (!isSplit && isSinglePaymentValid) ||
    (isSplit && isSplitPaymentValid);

    
  return (
    <div className="space-y-1">

      {/* BILL SUMMARY */}
      <div className="bg-white rounded-2xl border shadow-sm p-3">
        <h3 className="font-semibold text-lg mb-4">Bill Summary</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">{taxLabel}</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>

          <div className="border-t pt-3 flex justify-between text-xl font-semibold">
            <span>Total Amount</span>
            <span className="text-green-600">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* PAYMENT FULL UI */}
      {!isCartEmpty && (
        <>
          <div className="bg-white rounded-2xl border shadow-sm p-3">

            <p className="font-semibold mb-4 text-gray-800">Payment Method</p>

            {/* SPLIT TOGGLE */}
            <button
              onClick={() => setIsSplit(!isSplit)}
              className={`w-full mb-4 py-2 rounded-lg border cursor-pointer font-medium ${isSplit ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
            >
              {isSplit ? "Split Payment Enabled" : "Enable Split Payment"}
            </button>

            {/* -------- SINGLE PAYMENT UI -------- */}
            {!isSplit && (
              <>
                <div className="grid grid-cols-3 gap-3">

                  <button
                    onClick={() => setPayment("Cash")}
                    className={`flex flex-col items-center border rounded-xl py-2 text-sm cursor-pointer ${payment === "Cash"
                      ? "bg-green-600 text-white"
                      : "bg-white border-gray-300"
                      }`}
                  >
                    <Wallet className="w-5 h-5 mb-1" />
                    Cash
                  </button>

                  <button
                    onClick={() => setPayment("Card")}
                    className={`flex flex-col items-center border rounded-xl py-2 text-sm cursor-pointer ${payment === "Card"
                      ? "bg-blue-600 text-white"
                      : "bg-white border-gray-300"
                      }`}
                  >
                    <CreditCard className="w-5 h-5 mb-1" />
                    Card
                  </button>

                  <button
                    onClick={() => setPayment("UPI")}
                    className={`flex flex-col items-center border rounded-xl py-2 text-sm cursor-pointer ${payment === "UPI"
                      ? "bg-purple-600 text-white"
                      : "bg-white border-gray-300"
                      }`}
                  >
                    <Smartphone className="w-5 h-5 mb-1" />
                    UPI
                  </button>
                </div>

                {/* CASH RECEIVED ONLY WHEN CASH */}
                {/* CASH RECEIVED ONLY WHEN CASH */}
                {payment === "Cash" && (
                  <>
                    <label className="text-sm font-medium mt-5 block">
                      Cash Received
                    </label>
                    <input
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="Enter amount"
                      className="border rounded-xl px-4 py-3 w-full mt-1"
                    />

                    {/* If not enough money */}
                    {Number(cashReceived || 0) < grandTotal && (
                      <p className="text-red-500 text-xs mt-2">
                        Full cash required: ₹{grandTotal.toFixed(2)}
                      </p>
                    )}

                    {/* SHOW CHANGE RETURN IF CASH > TOTAL */}
                    {Number(cashReceived || 0) >= grandTotal && (
                      <div className="flex justify-between text-sm mt-3 font-semibold">
                        <span>Change to Return:</span>
                        <span className="text-blue-600">
                          ₹{(Number(cashReceived || 0) - grandTotal).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </>
                )}

              </>
            )}

            {/* -------- SPLIT PAYMENT UI -------- */}
            {isSplit && (
              <div className="space-y-3 mt-3 text-sm">

                <div>
                  <label>Cash</label>
                  <input
                    value={splitCash}
                    onChange={(e) => setSplitCash(e.target.value)}
                    className="border rounded-xl px-3 py-2 w-full mt-1"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label>Card</label>
                  <input
                    value={splitCard}
                    onChange={(e) => setSplitCard(e.target.value)}
                    className="border rounded-xl px-3 py-2 w-full mt-1"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label>UPI</label>
                  <input
                    value={splitUpi}
                    onChange={(e) => setSplitUpi(e.target.value)}
                    className="border rounded-xl px-3 py-2 w-full mt-1"
                    placeholder="0"
                  />
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span>Total Paid:</span>
                    <span className="font-semibold text-blue-600">
                      ₹{totalPaid.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Balance Due:</span>
                    <span className="font-semibold text-red-500">
                      ₹{balanceDue.toFixed(2)}
                    </span>
                  </div>

                  {extraReturn > 0 && (
                    <div className="flex justify-between">
                      <span>Return Extra:</span>
                      <span className="font-semibold text-green-600">
                        ₹{extraReturn.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* COMPLETE BILL BUTTON */}
          <div>
         <button
  onClick={onHoldBill}
  className="w-full bg-orange-500 text-white font-semibold py-1.5 rounded-xl 
             shadow hover:bg-orange-600 transition-all active:scale-95 cursor-pointer mb-3"
>
  Hold Bill
</button>
            <button
                disabled={!canCompleteBill}
  onClick={() =>
    onComplete({
      paymentType: isSplit ? "SPLIT" : payment,
      payments: isSplit
        ? {
            cash: Number(splitCash || 0),
            card: Number(splitCard || 0),
            upi: Number(splitUpi || 0),
          }
        : {
            cash: payment === "Cash" ? Number(cashReceived || grandTotal) : 0,
            card: payment === "Card" ? grandTotal : 0,
            upi: payment === "UPI" ? grandTotal : 0,
          },
      taxAmount,
      grandTotal,
    })
  }

              className={`w-full rounded-xl py-1.5 flex items-center justify-center gap-3 transition cursor-pointer ${!canCompleteBill
                ? "bg-gray-300 text-gray-200 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white shadow"
                }`}
            >
              <ShoppingCart size={22} />
              Complete Bill
            </button>
          </div>
        </>
      )}
    </div>
  );
}
