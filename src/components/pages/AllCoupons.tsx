import React, { useMemo, useState } from "react";
import type { Coupon } from "./Coupon";
import ViewModeToggle from "../customComponents/ViewModeToggle";

export default function AllCoupons({
  coupons,
  onView,
  onEdit,
  onDelete,
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); 
  const [viewMode, setViewMode] = useState("table");

  // Format Date
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toISOString().split("T")[0];
  };

  // ⭐ FILTERING LOGIC
  const filtered = useMemo(() => {
    return coupons.filter((c) => {
      // STATUS FILTER
      if (status !== "all" && c.status !== status) return false;

      // SEARCH FILTER
      if (
        q &&
        !`${c.code} ${c.name}`.toLowerCase().includes(q.toLowerCase())
      )
        return false;

      return true;
    });
  }, [coupons, q, status]);

  return (
    <div className="">
      {/* ================= FILTER BAR ================= */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-teal-50 p-2 rounded-full">
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="#0d9488" fill="none">
                <path d="M12 3v18M3 12h18" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-700 text-base">Filters</h3>
          </div>

          <button
            onClick={() => {
              setQ("");
              setStatus("all");
            }}
            className="px-4 py-2 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 text-sm shadow-xs"
          >
            Clear All
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 w-80 shadow-xs">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="text-slate-400"
              fill="none"
            >
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" />
            </svg>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by code or name..."
              className="outline-none w-full text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 border rounded-lg text-sm bg-white shadow-xs"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="delete">Deleted</option>
          </select>
        </div>
      </div>

      {/* VIEW MODE TOGGLE */}
      <ViewModeToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalItems={filtered.length}
      />

      {/* ================= TABLE VIEW ================= */}
      {viewMode === "table" && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#E9F8F2] text-slate-700">
              <tr className="h-12 text-left">
                <th className="px-4">Coupon</th>
                <th className="px-4">Discount</th>
                <th className="px-4">Min Purchase</th>
                <th className="px-4">Valid To</th>
                <th className="px-4">Status</th>
                <th className="px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((c) => (
                <tr key={c?._id} className="border-t hover:bg-slate-50 h-12">

                  {/* Coupon Code + Name */}
                  <td className="px-4">
                    <div className="font-medium">{c?.code}</div>
                    <div className="text-xs text-slate-500">{c?.name}</div>
                  </td>

                  {/* Discount */}
                  <td className="px-4">
                    {c?.discountType && c?.discountValue != null
                      ? c?.discountType === "PERCENT"
                        ? `${c?.discountValue}%`
                        : `₹${c?.discountValue}`
                      : "-"}
                  </td>

                  {/* Min Purchase */}
                  <td className="px-4">
                    {c?.minPurchase ? `₹${c?.minPurchase}` : "-"}
                  </td>

                  {/* Valid To */}
                  <td className="px-4">{formatDate(c?.validTo)}</td>

                  {/* STATUS BADGE */}
                  <td className="px-4">
                    {c?.status === "active" && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        Active
                      </span>
                    )}
                    {c?.status === "inactive" && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Inactive
                      </span>
                    )}
                    {c?.status === "expired" && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        Expired
                      </span>
                    )}
                    {c?.status === "delete" && (
                      <span className="px-3 py-1 bg-slate-300 text-slate-700 rounded-full text-xs">
                        Deleted
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4">
                    <div className="flex justify-center gap-4">

                      {/* VIEW */}
                      <button
                        className="text-slate-500 hover:text-teal-600"
                        onClick={() => onView(c)}
                      >
                        👁
                      </button>

                      {/* EDIT */}
                      {c?.status !== "delete" && (
                        <button
                          className="text-slate-500 hover:text-blue-600"
                          onClick={() => onEdit(c)}
                        >
                          ✏️
                        </button>
                      )}

                      {/* DELETE */}
                      {c?.status !== "delete" && (
                        <button
                          className="text-slate-500 hover:text-red-600"
                          onClick={() => onDelete(c)}
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {/* EMPTY STATE */}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-500">
                    No coupons found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= CARD VIEW ================= */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div
              key={c?._id}
              className="p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition"
            >
              <div className="font-semibold">{c?.code}</div>
              <div className="text-sm text-slate-500">{c?.name}</div>

              <div className="mt-3 text-lg font-semibold">
                {c?.discountType === "PERCENT"
                  ? `${c?.discountValue}%`
                  : `₹${c?.discountValue}`}
              </div>

              <div className="text-xs text-slate-600">
                Minimum: {c?.minPurchase ? `₹${c?.minPurchase}` : "None"}
              </div>

              <div className="text-xs text-slate-600">
                Valid Till: {formatDate(c?.validTo)}
              </div>

              {/* Status */}
              <div className="mt-2">
                {c?.status === "active" && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    Active
                  </span>
                )}
                {c?.status === "inactive" && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Inactive
                  </span>
                )}
                {c?.status === "expired" && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                    Expired
                  </span>
                )}
                {c?.status === "delete" && (
                  <span className="px-3 py-1 bg-slate-300 text-slate-700 rounded-full text-xs">
                    Deleted
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
