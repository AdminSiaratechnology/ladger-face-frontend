import React, { useState, useMemo } from "react";

export default function DenominationModal({
  openingCash,
  currentDrawer,
  onClose,
}: {
  openingCash: number;
  currentDrawer: number;
  onClose: () => void;
}) {
  const DENOMS = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

  const [values, setValues] = useState<{ [key: number]: number }>({});

  const handleChange = (den: number, val: string) => {
    setValues((p) => ({ ...p, [den]: Number(val || 0) }));
  };

  const actualCash = useMemo(() => {
    return Object.entries(values).reduce(
      (sum, [den, qty]) => sum + Number(den) * Number(qty),
      0
    );
  }, [values]);

  const expectedCash = currentDrawer;

  const difference = actualCash - expectedCash;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[450px] p-6 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-teal-700">Cash Denomination</h2>
          <button onClick={onClose} className="text-gray-500">✖</button>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {DENOMS.map((den) => (
            <div key={den} className="flex justify-between items-center">
              <span className="font-medium">₹{den}</span>
              <input
                type="number"
                className="border rounded px-3 py-1 w-24"
                placeholder="0"
                onChange={(e) => handleChange(den, e.target.value)}
              />
            </div>
          ))}
        </div>

        <hr className="my-4" />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Actual Cash:</span>
            <span className="font-semibold text-blue-600">₹{actualCash}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Expected Cash:</span>
            <span className="font-semibold">₹{expectedCash}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Difference:</span>
            <span
              className={`font-semibold ${
                difference === 0
                  ? "text-green-600"
                  : difference > 0
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              ₹{difference}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="bg-teal-600 text-white w-full mt-4 py-2 rounded-lg hover:bg-teal-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
