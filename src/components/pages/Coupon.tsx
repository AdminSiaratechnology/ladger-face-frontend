import React, { useEffect, useState } from "react";

import HeaderGradient from "../customComponents/HeaderGradint";
import CreateCoupon from "./CreateCoupon";
import ActiveCoupons from "./ActiveCoupons";
import ExpiredCoupons from "./ExpiredCoupons";
import CompanyCoupons from "./CompanyCoupons";
import AllCoupons from "./AllCoupons";
import StatCardBox from "./StatCardBox";

import { Dialog, DialogContent } from "../ui/dialog";
import { useCouponStore } from "../../../store/couponStore";
import { useCompanyStore } from "../../../store/companyStore";
import { Button } from "../ui/button";

import {
  Ticket,
  CheckCircle2,
  CircleDashed,
  AlarmClockOff,
} from "lucide-react";
export default function Coupon() {
  const [page, setPage] = useState("list");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Zustand store
  const {
    coupons = [], // 🛑 IMPORTANT: default fallback to avoid undefined
    fetchCoupons,
    addCoupon: addCouponAPI,
    updateCoupon: updateCouponAPI,
    deleteCoupon: deleteCouponAPI,
  } = useCouponStore();
  const {defaultSelected} = useCompanyStore();
  // Fetch on mount
useEffect(() => {
  fetchCoupons(1, 10, defaultSelected?._id);
}, []);


  // ADD COUPON
  const handleAddCoupon = async (payload) => {
    console.log("payloadddd" ,payload);
    const res = await addCouponAPI(payload);
    console.log(res);
    if (res.success) setOpen(false);
  };

  // UPDATE COUPON
  const handleUpdateCoupon = async (updatedData) => {
    const id = selectedCoupon?._id;
    console.log(updatedData)
    const res = await updateCouponAPI(id, updatedData);
   
    if (res.success) setOpen(false);
    else alert(res.message || "Failed to update coupon");
  };

  // DELETE COUPON
const handleDelete = async (coupon) => {
  const ok = confirm(`Delete coupon "${coupon.code}" permanently?`);
  if (!ok) return;

  try {
    const res = await deleteCouponAPI(coupon._id, { status: "delete" });

    if (res?.success) {
      // no alert needed
      return;
    }

    alert(res?.message || "Failed to delete");
  } catch (err) {
    console.error(err);
  }
};


  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setMode("edit");
    setOpen(true);
  };

  const handleView = (coupon) => {
    setSelectedCoupon(coupon);
    setMode("view");
    setOpen(true);
  };

  const title = {
    list: "Coupon Management",
    active: "Active Coupons",
    expired: "Expired Coupons",
    company: "Company-wise Coupons",
  };

  const subtitle = {
    list: "Manage your discount coupons and validity",
    active: "View all currently active coupons",
    expired: "View all expired coupons",
    company: "Filter coupons company-wise",
  };

  return (
    <div className="">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-6 mt-2">
        <div className="flex-1">
          <HeaderGradient title={title[page]} subtitle={subtitle[page]} />
        </div>

        <div className="ml-4 mt-1">
          {page === "list" ? (
            <div className="flex gap-3">
           
               <Button
                  onClick={() => {
                  setMode("add");
                  setSelectedCoupon(null);
                  setOpen(true);
                }}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
              >
                Add Coupon
                <Ticket className="w-4 h-4" />
              </Button>

              {/* <button className="px-4 py-2 bg-white border rounded-md hover:bg-slate-50">
                Export
              </button> */}
            </div>
          ) : (
            <button
              onClick={() => setPage("list")}
              className="px-4 py-2 border border-[#0d9488] text-[#0d9488] rounded-md hover:bg-[#e6f7f5]"
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* STATS */}
   {page === "list" && (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
   <StatCardBox
  title="Total Coupons"
  value={(coupons || []).length}
  color="from-teal-400 to-teal-600"
/>

<StatCardBox
  title="Active"
  value={(coupons || []).filter((c) => {
    if (c?.status !== "active") return false;
    if (!c?.validTo) return false;

    const d = new Date(c.validTo);
    return !isNaN(d) && d >= new Date();
  }).length}
  color="from-blue-400 to-blue-600"
/>

<StatCardBox
  title="Inactive"
  value={(coupons || []).filter((c) => c?.status === "inactive").length}
  color="from-slate-400 to-slate-600"
/>

<StatCardBox
  title="Expired"
  value={(coupons || []).filter((c) => {
    if (!c?.validTo) return false;
    const d = new Date(c.validTo);
    return !isNaN(d) && d < new Date();
  }).length}
  color="from-orange-400 to-orange-600"
/>



  </div>
)}

      {/* LIST VIEW */}
      {page === "list" && (
        <AllCoupons
          coupons={coupons || []}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      )}

      {page === "active" && (
        <ActiveCoupons coupons={coupons?.filter?.((c) => c.active) || []} />
      )}

      {page === "expired" && (
        <ExpiredCoupons coupons={coupons?.filter?.((c) => !c.active) || []} />
      )}

      {page === "company" && <CompanyCoupons coupons={coupons || []} />}

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="custom-dialog-container p-0">
          <CreateCoupon
            mode={mode}
            addCoupon={handleAddCoupon}
            updateCoupon={handleUpdateCoupon}
            closeModal={() => setOpen(false)}
            initialData={selectedCoupon}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
