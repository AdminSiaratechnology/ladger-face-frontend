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

  const country = defaultSelected?.country || "India";

  const taxLabel =
    country === "India" ? "GST"
      : country === "UAE" ? "VAT"
        : "Tax";

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

  const isCartEmpty = cart.length === 0;

  let isSinglePaymentValid = false;

  if (!isSplit) {
    if (payment === "Cash") {
      if (Number(cashReceived || 0) >= grandTotal) {
        isSinglePaymentValid = true;
      }
    } else if (payment === "Card" || payment === "UPI") {
      isSinglePaymentValid = payment !== "";
    }
  }

  const isSplitPaymentValid = isSplit && totalPaid >= grandTotal;

  const canCompleteBill =
    (!isSplit && isSinglePaymentValid) ||
    (isSplit && isSplitPaymentValid);

  return (
    <div className="space-y-3 pb-20">

      {/* BILL SUMMARY */}
      <div className="bg-white rounded-2xl border shadow-sm p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg mb-3">
          Bill Summary
        </h3>

        <div className="space-y-2 text-sm sm:text-base">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">{taxLabel}</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>

          <div className="border-t pt-3 flex justify-between text-lg sm:text-xl font-semibold">
            <span>Total</span>
            <span className="text-green-600">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {!isCartEmpty && (
        <>
          {/* PAYMENT SECTION */}
          <div className="bg-white rounded-2xl border shadow-sm p-3 sm:p-4">
            <p className="font-semibold mb-3 text-gray-800 text-sm sm:text-base">
              Payment Method
            </p>

            <button
              onClick={() => setIsSplit(!isSplit)}
              className={`w-full mb-4 py-2 rounded-lg border font-medium cursor-pointer text-sm sm:text-base
                ${isSplit ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              {isSplit ? "Split Payment Enabled" : "Enable Split Payment"}
            </button>

            {/* SINGLE PAYMENT */}
            {!isSplit && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { type: "Cash", icon: Wallet, color: "green" },
                    { type: "Card", icon: CreditCard, color: "blue" },
                    { type: "UPI", icon: Smartphone, color: "purple" },
                  ].map(({ type, icon: Icon, color }) => (
                    <button
                      key={type}
                      onClick={() => setPayment(type)}
                      className={`flex flex-col items-center border rounded-xl py-3 cursor-pointer text-sm
                        ${payment === type
                          ? `bg-${color}-600 text-white`
                          : "bg-white border-gray-300"}`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      {type}
                    </button>
                  ))}
                </div>

                {payment === "Cash" && (
                  <div className="mt-4">
                    <label className="text-sm font-medium block">
                      Cash Received
                    </label>
                    <input
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="Enter amount"
                      className="border rounded-xl px-4 py-3 w-full mt-1 text-sm"
                    />

                    {Number(cashReceived || 0) < grandTotal && (
                      <p className="text-red-500 text-xs mt-2">
                        Full cash required ₹{grandTotal.toFixed(2)}
                      </p>
                    )}

                    {Number(cashReceived || 0) >= grandTotal && (
                      <div className="flex justify-between text-sm mt-3 font-semibold">
                        <span>Change:</span>
                        <span className="text-blue-600">
                          ₹{(Number(cashReceived) - grandTotal).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* SPLIT PAYMENT */}
            {isSplit && (
              <div className="space-y-3 mt-3">
                {[
                  { label: "Cash", value: splitCash, set: setSplitCash },
                  { label: "Card", value: splitCard, set: setSplitCard },
                  { label: "UPI", value: splitUpi, set: setSplitUpi },
                ].map((p) => (
                  <div key={p.label}>
                    <label className="text-sm">{p.label}</label>
                    <input
                      value={p.value}
                      onChange={(e) => p.set(e.target.value)}
                      className="border rounded-xl px-3 py-2 w-full mt-1 text-sm"
                      placeholder="0"
                    />
                  </div>
                ))}

                <div className="border-t pt-3 text-sm">
                  <div className="flex justify-between">
                    <span>Total Paid</span>
                    <span className="text-blue-600 font-semibold">
                      ₹{totalPaid.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Balance Due</span>
                    <span className="text-red-500 font-semibold">
                      ₹{balanceDue.toFixed(2)}
                    </span>
                  </div>

                  {extraReturn > 0 && (
                    <div className="flex justify-between">
                      <span>Return</span>
                      <span className="text-green-600 font-semibold">
                        ₹{extraReturn.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-2">
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
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer
                ${!canCompleteBill
                  ? "bg-gray-300 text-gray-200 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white shadow"}`}
            >
              <ShoppingCart size={20} />
              Complete Bill
            </button>

            <button
              onClick={onHoldBill}
              className="w-full bg-orange-500 text-white font-semibold py-2 rounded-xl
                shadow hover:bg-orange-600 active:scale-95 cursor-pointer"
            >
              Hold Bill
            </button>
          </div>
        </>
      )}
    </div>
  );
}
