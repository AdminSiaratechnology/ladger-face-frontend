import React from "react";
import { ShoppingCart } from "lucide-react";

export default function PosCart({
  cart,
  increaseQty,
  decreaseQty,
  removeItem,
  clearCart,
}: any) {

  return (
    <div className="bg-white rounded-2xl border shadow-sm flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-t-2xl border-b">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-700">Cart Items</h2>
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
        <div className="flex flex-col items-center justify-center h-[220px] text-gray-400">
          <ShoppingCart size={65} strokeWidth={1.2} className="text-gray-300 mb-3" />
          <p className="text-[15px] tracking-wide">
            Search and add products to start billing
          </p>
        </div>
      )}

      {/* TABLE WHEN ITEMS PRESENT */}
      {cart.length > 0 && (
        <>
          {/* TABLE HEADER */}
          <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 border-b px-4 py-2">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Product</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          {/* DATA ROWS */}
          <div className="overflow-y-auto max-h-[240px]">
            {cart.map((item: any, i: number) => (
              <div
                key={item._id}
                className="grid grid-cols-12 items-center py-3 border-b px-4 hover:bg-gray-50 transition"
              >
                <div className="col-span-1">{i + 1}</div>

                <div className="col-span-4">
                  <p className="font-medium">{item.ItemName}</p>
                  <p className="text-xs text-gray-500">{item.ItemCode}</p>
                </div>

                <div className="col-span-2 flex justify-center">
                  <div className="flex items-center gap-2">

                    {/* decrease qty */}
                    <button
                      onClick={() => decreaseQty(item._id)}
                      className="w-7 h-7 bg-gray-200 rounded-md cursor-pointer"
                    >
                      -
                    </button>

                    <span className="text-lg font-semibold">{item.qty}</span>

                    {/* increase qty */}
                    <button
                      onClick={() => increaseQty(item._id)}
                      className="w-7 h-7 bg-blue-600 text-white rounded-md cursor-pointer"
                    >
                      +
                    </button>

                  </div>
                </div>

                <div className="col-span-2 text-right">
                  ₹{item.price.toFixed(2)}
                </div>

                <div className="col-span-2 text-right font-semibold">
                  ₹{(item.qty * item.price).toFixed(2)}
                </div>

                <div className="col-span-1 text-center pr-2">
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-red-500 text-lg hover:scale-110 transition cursor-pointer"
                  >
                    ×
                  </button>
                </div>

              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
