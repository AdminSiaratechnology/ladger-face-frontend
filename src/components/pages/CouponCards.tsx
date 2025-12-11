// CouponCards.tsx
import React from "react";
import { Coupon } from "./Coupon";

export default function CouponCards({ coupons }: { coupons: Coupon[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {coupons.map((c) => (
        <div
          key={c.id}
          className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition"
        >
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{c.code}</h2>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                c.active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {c.active ? "Active" : "Expired"}
            </span>
          </div>

          <p className="text-sm text-gray-500">{c.name}</p>

          <div className="mt-3 text-gray-700">
            <p>
              <strong>Company:</strong> {c.company}
            </p>
            <p>
              <strong>Discount:</strong>{" "}
              {c.discountType === "PERCENT"
                ? `${c.discountValue}%`
                : `₹${c.discountValue}`}
            </p>
            <p>
              <strong>Min Purchase:</strong>{" "}
              {c.minPurchase ? `₹${c.minPurchase}` : "None"}
            </p>
            <p>
              <strong>Valid To:</strong> {c.validTo}
            </p>
          </div>
        </div>
      ))}

      {coupons.length === 0 && (
        <div className="col-span-2 text-center p-6 text-gray-500">
          No coupons found
        </div>
      )}
    </div>
  );
}
