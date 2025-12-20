import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function CustomerWiseFilterModal({
  open,
  onClose,
  filters,
  setFilters,
  onApply,
  onReset,
}: any) {
  // local state for debounce
  const [customerInput, setCustomerInput] = useState(filters.customer || "");

  // debounce customer search (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev: any) => ({
        ...prev,
        customer: customerInput,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [customerInput]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 rounded-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Filter Options
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-200 cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-5">
          {/* BILL NO */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Bill No
            </label>
            <input
              type="text"
              placeholder="Enter Bill Number"
              value={filters.billNumber}
              onChange={(e) =>
                setFilters({ ...filters, billNumber: e.target.value })
              }
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* CUSTOMER (INPUT + DEBOUNCE) */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Customer
            </label>
            <input
              type="text"
              placeholder="Search customer by name"
              value={customerInput}
              onChange={(e) => setCustomerInput(e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Search will apply after you stop typing
            </p>
          </div>

          {/* PAYMENT MODE */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Payment Mode
            </label>
            <select
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={filters.paymentType}
              onChange={(e) =>
                setFilters({ ...filters, paymentType: e.target.value })
              }
            >
              <option value="">All Payments</option>
              <option value="Cash">Cash</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>

          {/* DATE RANGE */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onReset}
            className="text-sm text-red-500 hover:underline cursor-pointer"
          >
            Reset All
          </button>

          <Button
            onClick={onApply}
            className="bg-teal-600 hover:bg-teal-700 px-5"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
