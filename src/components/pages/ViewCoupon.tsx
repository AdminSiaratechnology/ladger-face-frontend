import React from "react";
import { Dialog, DialogContent } from "../ui/dialog";

export default function ViewCoupon({ data, closeModal }) {
  if (!data) return null;

  const isActive = data.active;

  return (
    <Dialog open={true} onOpenChange={closeModal}>
      <DialogContent className="max-w-3xl p-0 rounded-xl overflow-hidden">

        {/* HEADER WITH GRADIENT */}
        <div className="bg-gradient-to-r from-teal-400 to-blue-500 p-5 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold capitalize">{data.name}</h2>
            <p className="text-sm opacity-90">Coupon Details</p>
          </div>

          <span
            className={`px-3 py-1 text-xs rounded-full ${
              isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
            }`}
          >
            {isActive ? "active" : "expired"}
          </span>
        </div>

        {/* BODY CONTAINER */}
        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* ================= BASIC DETAILS ================= */}
          <Section title="Basic Information">
            <TwoCol label="Coupon Code" value={data.code} />
            <TwoCol label="Name" value={data.name} />
            <TwoCol label="Company" value={data.company} />
            <TwoCol label="Description" value={data.description || "-"} />
            <TwoCol label="Valid From" value={data.validFrom} />
            <TwoCol label="Valid Until" value={data.validTo} />
            <TwoCol label="Status" value={isActive ? "Active" : "Expired"} />
          </Section>

          {/* ================= DISCOUNT DETAILS ================= */}
          <Section title="Discount Details">
            <TwoCol label="Discount Type" value={data.discountType} />
            <TwoCol label="Discount Value" value={data.discountValue} />
            <TwoCol label="Minimum Purchase" value={data.minPurchase || "-"} />
            <TwoCol label="Tax Apply" value={data.taxApply} />
          </Section>

          {/* ================= LIMIT DETAILS ================= */}
          <Section title="Limits">
            <TwoCol label="Max Total Redemptions" value={data.maxTotal || "-"} />
            <TwoCol label="Max Per Customer" value={data.maxPerCustomer || "-"} />
            <TwoCol label="Max Per Day" value={data.maxPerDay || "-"} />
            <TwoCol
              label="Allow Stacking"
              value={data.allowStacking ? "Yes" : "No"}
            />
            <TwoCol
              label="Auto Apply"
              value={data.autoApply ? "Yes" : "No"}
            />
          </Section>

          {/* ================= RULE DETAILS ================= */}
          <Section title="Rules">
            <TwoCol label="Regions" value={data.regions || "-"} />
            <TwoCol label="Product Categories" value={data.productCategories || "-"} />
            <TwoCol label="Payment Method" value={data.paymentMethod || "-"} />
            <TwoCol label="Customer Group" value={data.customerGroup || "-"} />
          </Section>

          {/* CLOSE BUTTON */}
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ================= REUSABLE COMPONENTS ================== */

function Section({ title, children }) {
  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="bg-slate-100 px-4 py-2 border-b font-semibold text-slate-700">
        {title}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 p-4">
        {children}
      </div>
    </div>
  );
}

function TwoCol({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-700 break-all">{value}</p>
    </div>
  );
}
