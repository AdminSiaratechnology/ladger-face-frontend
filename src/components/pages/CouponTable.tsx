// CouponTable.tsx
import React from "react";
import { Coupon } from "./Coupon";

export default function CouponTable({ coupons }: { coupons: Coupon[] }) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-green-50">
          <tr className="text-left text-sm text-gray-700">
            <th className="p-3">Timestamp</th>
            <th className="p-3">Code</th>
            <th className="p-3">Name</th>
            <th className="p-3">Company</th>
            <th className="p-3">Discount</th>
            <th className="p-3">Min Purchase</th>
            <th className="p-3">Valid To</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {coupons.map((c) => (
            <tr
              key={c.id}
              className="border-t hover:bg-slate-50 text-sm transition"
            >
              <td className="p-3">{new Date().toLocaleDateString()}</td>

              <td className="p-3 font-medium">{c.code}</td>

              <td className="p-3">{c.name}</td>

              <td className="p-3">{c.company}</td>

              <td className="p-3">
                {c.discountType === "PERCENT"
                  ? `${c.discountValue}%`
                  : `₹${c.discountValue}`}
              </td>

              <td className="p-3">
                {c.minPurchase ? `₹${c.minPurchase}` : "-"}
              </td>

              <td className="p-3">{c.validTo}</td>

              <td className="p-3">
                {c.active ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                    Expired
                  </span>
                )}
              </td>

              <td className="p-3 text-right">
                <button className="text-gray-600 hover:text-blue-600 mr-3">
                  👁
                </button>
                <button className="text-gray-600 hover:text-green-600 mr-3">
                  ✎
                </button>
                <button className="text-gray-600 hover:text-red-600">🗑</button>
              </td>
            </tr>
          ))}

          {coupons.length === 0 && (
            <tr>
              <td
                colSpan={9}
                className="p-6 text-center text-gray-500 text-sm"
              >
                No coupons found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
