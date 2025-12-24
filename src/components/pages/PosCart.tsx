import React from "react";
import { ShoppingCart } from "lucide-react";
import { getCurrencySymbol } from "../../lib/currency.utils";
import { useCompanyStore } from "../../../store/companyStore";

export default function PosCart({
  cart,
  increaseQty,
  decreaseQty,
  removeItem,
  clearCart,
}: any) {
  const { defaultSelected } = useCompanyStore();
  const currency = getCurrencySymbol(defaultSelected?.country);
  const defaultCurrency = defaultSelected?.defaultCurrencySymbol || "₹";

  return (
    <div className="bg-white rounded-2xl border shadow-sm flex flex-col w-full">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-t-2xl border-b">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-700">
            Cart Items
          </h2>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-medium text-red-500 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* EMPTY */}
      {cart.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[220px] text-gray-400">
          <ShoppingCart size={60} className="mb-3 text-gray-300" />
          <p className="text-sm">Search and add products to start billing</p>
        </div>
      )}

      {/* CART LIST */}
      {cart.length > 0 && (
        <>
          {/* HEADER */}
          <div className="hidden lg:grid grid-cols-12 text-xs font-semibold text-gray-500 border-b px-4 py-2">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Product</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          <div className="overflow-y-auto max-h-[320px]">
            {cart.map((item: any, index: number) => (
              <div key={item.cartId}>
                {/* ================= BUY ITEM ================= */}
                {!item.isFreeItem && (
                  <div className="hidden lg:grid grid-cols-12 items-center py-3 border-b px-4">
                    <div className="col-span-1">{index + 1}</div>

                    <div className="col-span-4">
                      <p className="font-medium">{item.ItemName}</p>
                      <p className="text-xs text-gray-500">
                        {item.ItemCode}
                      </p>
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decreaseQty(item)}
                          className="w-7 h-7 bg-gray-200 rounded"
                        >
                          -
                        </button>

                        <span className="font-semibold">{item.qty}</span>

                        <button
                          onClick={() => increaseQty(item)}
                          className="w-7 h-7 bg-blue-600 text-white rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 text-right">
                      {defaultCurrency+" "}{item.price.toFixed(2)}
                    </div>

                    <div className="col-span-2 text-right font-semibold">
                      {defaultCurrency+" "}{(item.qty * item.price).toFixed(2)}
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => removeItem(item)}
                        className="text-red-500 text-lg"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {/* ================= FREE ITEM ================= */}
                {item.isFreeItem && (
                  <div className="hidden lg:grid grid-cols-12 items-center py-3 border-b px-4 bg-green-50">
                    <div className="col-span-1"></div>

                    <div className="col-span-4">
                      <p className="font-medium">{item.ItemName}</p>
                      <p className="text-xs italic text-gray-600">
                        {item.freeDescription || "This item is free"}
                      </p>
                    </div>

                    <div className="col-span-2 text-center font-semibold">
                      {item.qty}
                    </div>

                    <div className="col-span-2 text-right">
                      {defaultCurrency}0.00
                    </div>

                    <div className="col-span-2 text-right font-semibold">
                      {defaultCurrency}0.00
                    </div>

                    <div className="col-span-1"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
