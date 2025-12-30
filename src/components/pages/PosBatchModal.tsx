import React from "react";

export default function PosBatchModal({
  product,
  onClose,
  onSelectBatch,
  batches,
}: any) {
  if (!product) return null;
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Invalid date check

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.35)] flex items-center justify-center z-50">
      <div className="w-[820px] rounded-2xl shadow-xl bg-white overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Select Batch</h2>
            <p className="text-sm opacity-90">{product.name}</p>
          </div>

          <button
            onClick={onClose}
            className="text-white text-xl px-2 hover:text-gray-300 cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[430px] overflow-y-auto">
          {batches?.map((b: any, i: number) => (
            <div
              key={i}
              onClick={() => onSelectBatch(b)}
              className="border rounded-xl p-5 flex justify-between items-center hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="text-[14px]">
                <p className="mb-1">
                  <span className="font-semibold">Batch:</span>{" "}
                  <span className="text-blue-600 font-medium">
                    {b.batchName}
                  </span>
                  <span className="mx-2">|</span>
                  <span className="font-semibold">Barcode:</span>{" "}
                  <span className="text-gray-700">{b.Barcode || "—"}</span>
                </p>

                {(b.mfg || b.expiry) && (
                  <>
                    {b.mfg && <>Mfg: {formatDate(b.mfg)}</>}
                    {b.mfg && b.expiry && "  |  "}
                    {b.expiry && <>Exp: {formatDate(b.expiry)}</>}
                  </>
                )}

                <p className="text-gray-700">
                  MRP: ₹{b.MRP || product.minimumRate} &nbsp;&nbsp;
                  <span className="text-green-600 font-medium">
                    Stock: {b.availableQty} units
                  </span>
                </p>
              </div>

              <div className="w-10 h-10 bg-blue-600 text-white rounded-full text-xlflex items-center justify-center">
                +
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
