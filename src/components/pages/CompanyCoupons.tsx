import React, { useState } from "react";
import type { Coupon } from "./Coupon";
import StatCardBox from "./StatCardBox";

export default function CompanyCoupons({ coupons }: { coupons: Coupon[] }) {
  const companies = Array.from(new Set(coupons.map((c) => c.company)));
  const [company, setCompany] = useState<string>(companies[0] || "All");

  const filtered =
    company === "All"
      ? coupons
      : coupons.filter((c) => c.company === company);

  return (
    <div>
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCardBox
          title="Total Companies"
          value={companies.length}
          color="from-purple-400 to-purple-500"
        />
        <StatCardBox
          title="Coupons for Selected"
          value={filtered.length}
          color="from-teal-400 to-teal-500"
        />
        <StatCardBox
          title="Active Coupons"
          value={filtered.filter((c) => c.active).length}
          color="from-blue-400 to-blue-500"
        />
      </div>

      {/* CONTENT */}
      <h3 className="text-lg font-medium mb-3">Company-wise Coupons</h3>

      <select
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="p-2 border rounded mb-4"
      >
        <option value="All">All</option>
        {companies.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((c) => (
          <div key={c.id} className="p-4 bg-white rounded border">
            <div className="font-semibold">{c.code}</div>
            <div className="text-sm text-slate-500">{c.name}</div>
            <div className="text-sm text-slate-500 mt-2">
              Valid: {c.validTo}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
