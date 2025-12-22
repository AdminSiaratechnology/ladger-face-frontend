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

  // ✅ BUY ITEMS ONLY
  const buyItems = cart.filter((i: any) => !i.isFreeItem);

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
            className="text-xs font-medium text-red-500 hover:underline cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {cart.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[220px] text-gray-400 px-4 text-center">
          <ShoppingCart
            size={60}
            strokeWidth={1.2}
            className="text-gray-300 mb-3"
          />
          <p className="text-sm">
            Search and add products to start billing
          </p>
        </div>
      )}

      {/* CART ITEMS */}
      {cart.length > 0 && (
        <>
          {/* DESKTOP HEADER */}
          <div className="hidden lg:grid grid-cols-12 text-xs font-semibold text-gray-500 border-b px-4 py-2">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Product</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          <div className="overflow-y-auto max-h-[320px]">
            {buyItems.map((item: any, i: number) => {
              // ✅ FREE ITEMS LINKED TO THIS BUY ITEM
              const freeItems = cart.filter(
                (free: any) =>
                  free.isFreeItem &&
                  free.freeDescription &&
                  free.freeDescription.includes(item.ItemName)
              );

              return (
                <div key={item.cartId}>
                  {/* ================= BUY ITEM ================= */}
                  <div className="hidden lg:grid grid-cols-12 items-center py-3 border-b px-4">
                    <div className="col-span-1">{i + 1}</div>

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
                          className="w-7 h-7 bg-gray-200 rounded-md"
                        >
                          -
                        </button>

                        <span className="text-lg font-semibold">
                          {item.qty}
                        </span>

                        <button
                          onClick={() => increaseQty(item)}
                          className="w-7 h-7 bg-blue-600 text-white rounded-md"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 text-right">
                      {currency}
                      {item.price.toFixed(2)}
                    </div>

                    <div className="col-span-2 text-right font-semibold">
                      {currency}
                      {(item.qty * item.price).toFixed(2)}
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

                  {/* ================= FREE ITEMS (JUST BELOW BUY ITEM) ================= */}
                  {freeItems.map((free: any) => (
                    <div
                      key={free.cartId}
                      className="hidden lg:grid grid-cols-12 items-center py-3 border-b px-4 bg-green-50"
                    >
                      <div className="col-span-1"></div>

                      <div className="col-span-4">
                        <p className="font-medium">
                          {free.ItemName}
                        </p>
                        <p className="text-xs italic text-gray-600">
                          {free.freeDescription}
                        </p>
                      </div>

                      <div className="col-span-2 text-center font-semibold">
                        {free.qty}
                      </div>

                      <div className="col-span-2 text-right">
                        {currency}0.00
                      </div>

                      <div className="col-span-2 text-right font-semibold">
                        {currency}0.00
                      </div>

                      <div className="col-span-1"></div>
                    </div>
                  ))}

                  {/* ================= MOBILE VIEW ================= */}
                  <div className="lg:hidden border-b p-3 space-y-2">
                    <p className="font-medium text-sm">
                      {item.ItemName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.ItemCode}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decreaseQty(item)}
                          className="w-8 h-8 bg-gray-200 rounded-md"
                        >
                          -
                        </button>

                        <span className="font-semibold">
                          {item.qty}
                        </span>

                        <button
                          onClick={() => increaseQty(item)}
                          className="w-8 h-8 bg-blue-600 text-white rounded-md"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right text-sm">
                        <p>
                          {currency}
                          {item.price.toFixed(2)}
                        </p>
                        <p className="font-semibold">
                          {currency}
                          {(item.qty * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* MOBILE FREE ITEMS */}
                    {freeItems.map((free: any) => (
                      <div
                        key={free.cartId}
                        className="text-sm text-green-700 mt-2"
                      >
                        <p className="font-medium">
                          {free.ItemName}
                        </p>
                        <p className="text-xs italic">
                          {free.freeDescription}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
