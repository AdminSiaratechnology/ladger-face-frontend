// src/components/pages/HeldBillsModal.tsx
import React, { useEffect, useState } from "react";

type Held = {
  _id: string;
  billNumber?: string;
  items: any[];
  subtotal: number;
  totalAmount: number;
  createdAt: string;
  customer?: any;
};

export default function HeldBillsModal({
  companyId,
  onClose,
  onResume,
}: {
  companyId: string | undefined;
  onClose: () => void;
  onResume: (sale: Held) => void;
}) {
  const [list, setList] = useState<Held[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    fetchHeld();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const fetchHeld = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/sales/held/${companyId}`);
      const data = await res.json();
      setList(data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[720px] rounded-xl shadow-xl p-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Held Bills</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>

        {loading ? <p>Loading...</p> : list.length === 0 ? (
          <p className="text-gray-500">No held bills</p>
        ) : (
          <ul>
            {list.map((h) => (
              <li key={h._id} className="p-3 border-b flex justify-between items-center">
                <div>
                  <div className="font-semibold">{h.billNumber || "Held"}</div>
                  <div className="text-xs text-gray-500">{new Date(h.createdAt).toLocaleString()}</div>
                  <div className="text-sm text-gray-700">₹{h.totalAmount}</div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => onResume(h)} className="px-3 py-1 bg-teal-600 text-white rounded">Resume</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
