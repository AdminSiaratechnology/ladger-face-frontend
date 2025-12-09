import React from "react";
import type { Coupon } from "./Coupon";
import StatCardBox from "./StatCardBox";

export default function ExpiredCoupons({ coupons }: { coupons: Coupon[] }) {
  return (
    <div>
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCardBox
          title="Expired Coupons"
          value={coupons.length}
          color="from-orange-400 to-orange-500"
        />
        <StatCardBox
          title="Expired This Month"
          value={coupons.filter(c => {
            const d = new Date(c.validTo);
            const now = new Date();
            return d.getMonth() === now.getMonth();
          }).length}
          color="from-red-400 to-red-500"
        />
        <StatCardBox
          title="Companies"
          value={new Set(coupons.map(c => c.company)).size}
          color="from-purple-400 to-purple-500"
        />
      </div>

      {/* CONTENT */}
      <h3 className="text-lg font-medium mb-3">Expired Coupons</h3>
      <div className="grid gap-3">
        {coupons.map((c) => (
          <div key={c.id} className="p-3 bg-white border rounded flex justify-between">
            <div>
              <div className="font-semibold">{c.code}</div>
              <div className="text-sm text-slate-500">Expired on {c.validTo}</div>
            </div>
            <div className="text-sm text-slate-500">{c.company}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
