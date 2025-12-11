// ActiveCoupons.tsx
import React from "react";
import type { Coupon } from "./Coupon";
import StatCardBox from "./StatCardBox";

export default function ActiveCoupons({ coupons }: { coupons: Coupon[] }) {
  return (
    <div>
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCardBox
          title="Active Coupons"
          value={coupons.length}
          color="from-blue-400 to-blue-500"
        />
        <StatCardBox
          title="Upcoming Expiry"
          value={coupons.filter(c => {
            const d = new Date(c.validTo);
            const now = new Date();
            const diff = (d.getTime() - now.getTime()) / (1000 * 3600 * 24);
            return diff > 0 && diff < 7;
          }).length}
          color="from-yellow-400 to-yellow-500"
        />
        <StatCardBox
          title="Companies"
          value={new Set(coupons.map(c => c.company)).size}
          color="from-purple-400 to-purple-500"
        />
      </div>

      {/* PAGE CONTENT (KEEP YOUR OLD) */}
      <h3 className="text-lg font-medium mb-3">Active Coupons</h3>
      <p className="text-sm text-slate-500 mb-4">
        These coupons are currently active.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {coupons.map((c) => (
          <div key={c.id} className="p-4 bg-white rounded border">
            <div className="font-semibold">{c.code}</div>
            <div className="text-sm text-slate-500">{c.name}</div>
            <div className="mt-3 text-sm text-slate-500">
              Discount:{" "}
              {c.discountType === "PERCENT"
                ? `${c.discountValue}%`
                : `₹${c.discountValue}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
