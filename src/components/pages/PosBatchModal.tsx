import React from "react";

export default function PosBatchModal({ product, onClose, onSelectBatch }: any) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.35)] flex items-center justify-center z-50">

      {/* MAIN MODAL BOX */}
      <div className="w-[820px] rounded-2xl shadow-xl bg-white overflow-hidden">

        {/* BLUE HEADER */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Select Batch</h2>
            <p className="text-sm opacity-90">{product.ItemName}</p>
          </div>

          <button
            onClick={onClose}
            className="text-white text-xl px-2 hover:text-gray-300 cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* BATCH LIST */}
        <div className="p-5 space-y-4 max-h-[430px] overflow-y-auto">
          {product.GodownDetails?.map((b: any, i: number) => (
            <div
              key={i}
              className="border rounded-xl p-4 flex justify-between items-center hover:bg-gray-50 transition cursor-pointer"
            >
              {/* LEFT SIDE CONTENT */}
              <div className="text-[14px]">
                <p className="mb-1">
                  <span className="font-semibold">Batch:</span>{" "}
                  <span className="text-blue-600 font-medium cursor-pointer">
                    {b.BatchName}
                  </span>
                  <span className="mx-2">|</span>
                  <span className="font-semibold">Barcode:</span>{" "}
                  <span className="text-gray-700">{b.Barcode || "—"}</span>
                </p>

                <p className="text-gray-600 mb-1">
                  Mfg: {b.MfgDate || "—"} &nbsp;&nbsp; Exp: {b.ExpDate || "—"}
                </p>

                <p className="text-gray-700">
                  MRP: ₹{b.MRP || product.Price} &nbsp;&nbsp;
                  <span className="text-green-600 font-medium">
                    Stock: {b.Qty} units
                  </span>
                </p>
              </div>

              {/* ADD BUTTON */}
              <button
                onClick={() => onSelectBatch(b)}
                className="w-10 h-10 bg-blue-600 text-white rounded-full text-2xl flex items-center justify-center hover:bg-blue-700 cursor-pointer"
              >
                +
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
