import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Filter, X, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import SearchableSalesmanSelect from "./SearchableSalesmanSelect";
import SearchableCustomerSelect from "./SearchableCustomerSelect";
import ReportDateRangeFilter from "./ReportDateRangeFilter";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function UniversalReportFilter({
    open,
    onClose,
    variant = "modal",

    filters,
    setFilters,
    onApply,
    onReset,

    companyId,
    users = [],
    isAnyFilterActive = true,

    showSearch = false,
    showBillNo = false,
    showCustomer = false,
    showCustomerSelect = false,
    showSalesman = false,
    showUser = false,
    showStatus = false,
    showMode = false,
    showDateRange = false,

    localDateRange,
    setLocalDateRange,
    applyDateRange,
    resetDateRange,
    isCustomer = false
}: any) {

    const [searchText, setSearchText] = useState(filters.search || "");
    const [customerText, setCustomerText] = useState(filters.customer || "");

    const [tempCustomerId, setTempCustomerId] = useState(filters.customerId || "all");
    const [tempSalesmanId, setTempSalesmanId] = useState(filters.salesmanId || "all");
    const [tempUserId, setTempUserId] = useState(filters.userId || "all");
    const [tempStatus, setTempStatus] = useState(filters.status || "all");
    const [tempMode, setTempMode] = useState(filters.paymentType || "all");


useEffect(() => {
  setSearchText(filters.search || "");
  setCustomerText(filters.customer || "");

  setTempCustomerId(filters.customerId || "all");
  setTempSalesmanId(filters.salesmanId || "all");
  setTempUserId(filters.userId || "all");
  setTempStatus(filters.status || "all");
  setTempMode(filters.paymentType || "all");
}, [
  filters.search,
  filters.customer,
  filters.customerId,
  filters.salesmanId,
  filters.userId,
  filters.status,
  filters.paymentType,
]);



    /* ---------------- APPLY ---------------- */
   const handleApply = () => {
  const salesmanId =
    tempSalesmanId &&
    tempSalesmanId !== "all" &&
    typeof tempSalesmanId === "object"
      ? tempSalesmanId._id
      : tempSalesmanId;

  

  const updatedFilters = {
    ...filters,

    search: searchText?.trim() || undefined,
    customer: customerText?.trim() || undefined,

    paymentType: tempMode === "all" ? undefined : tempMode,
customerId:
    tempCustomerId && tempCustomerId !== "all"
      ? tempCustomerId
      : undefined,

    salesmanId: salesmanId === "all" ? undefined : salesmanId,
    userId: tempUserId === "all" ? undefined : tempUserId,
    status: tempStatus === "all" ? undefined : tempStatus,
  };

  setFilters(updatedFilters);
  onApply(updatedFilters);
};


    const handleClear = () => {
        setSearchText("");
        setCustomerText(""); // ✅ ADD THIS

        setTempCustomerId("all");
        setTempSalesmanId("all");
        setTempUserId("all");
        setTempStatus("all");
        setTempMode("all");

        if (resetDateRange) resetDateRange();
        onReset();
    };



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

                    {showSearch && (
                        <div className="w-full">
                            <label className="text-sm font-medium text-gray-700">Search</label>

                            <div className="relative mt-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                                <Input
                                    placeholder="Search by Order ID or Customer..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="pl-10 h-10 border-gray-300 focus-visible:ring-teal-500/50"
                                />

                                {searchText && (
                                    <button
                                        onClick={() => setSearchText("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2
                     text-gray-400 hover:text-gray-600
                     p-1 rounded-full transition cursor-pointer"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}


                    {showBillNo && (
                        <div>
                            <label className="text-sm font-medium text-gray-700">Bill No</label>
                            <input
                                value={filters.billNumber || ""}
                                placeholder="Enter Bill Number"
                                onChange={(e) =>
                                    setFilters({ ...filters, billNumber: e.target.value })
                                }
                                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    )}

                    {showCustomer && (
                        <div>
                            <label className="text-sm font-medium text-gray-700">Customer</label>
                            <input
                                value={customerText}
                                placeholder="Enter Customer Name"
                                onChange={(e) => setCustomerText(e.target.value)}
                                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    )}

                    {showCustomerSelect && (
                        <div className="w-full">
                            <label className="text-sm font-medium text-gray-700">Customer</label>

                            <div className="mt-1 w-full">
                                <SearchableCustomerSelect
                                    value={tempCustomerId}
                                    onChange={setTempCustomerId}
                                    companyId={companyId}
                                    className="w-full"
                                    isCustomer={isCustomer}
                                />
                            </div>
                        </div>
                    )}

                    {showSalesman && (
                        <div className="w-full">
                            <label className="text-sm font-medium text-gray-700">Salesman</label>

                            <div className="mt-1 w-full">
                                <SearchableSalesmanSelect
                                    value={tempSalesmanId}
                                    onChange={setTempSalesmanId}
                                    companyId={companyId}
                                    className="w-full "
                                />
                            </div>
                        </div>
                    )}


                    {showUser && (
                        <div>
                            <label className="text-sm font-medium text-gray-700">Collected By</label>
                            <Select value={tempUserId} onValueChange={setTempUserId}>
                                <SelectTrigger className="h-10 rounded-lg">
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    {users.map((u: any) => (
                                        <SelectItem key={u._id} value={u._id}>
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {showStatus && (
                        <div>
                            <label className="text-sm font-medium text-gray-700">Status</label>
                            <Select value={tempStatus} onValueChange={setTempStatus}>
                                <SelectTrigger className="h-10 rounded-lg">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* ✅ PAYMENT MODE (FIXED + NEW OPTIONS) */}
                    {showMode && (
                        <div>
                            <label className="text-sm font-medium text-gray-700">Payment Mode</label>
                            <Select value={tempMode} onValueChange={setTempMode}>
                                <SelectTrigger className="h-10 rounded-lg">
                                    <SelectValue placeholder="All Payments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payments</SelectItem>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="UPI">UPI</SelectItem>
                                    <SelectItem value="CARD">Card</SelectItem>
                                    <SelectItem value="SPLIT">Split</SelectItem>
                                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {showDateRange && (
                        <div>
                            <label className="text-sm font-medium text-gray-700">Date Range</label>
                            <ReportDateRangeFilter
                                localDateRange={localDateRange}
                                setLocalDateRange={setLocalDateRange}
                                applyDateRange={applyDateRange}
                                resetDateRange={resetDateRange}
                            />
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                    {isAnyFilterActive && (
                        <button
                            onClick={handleClear}
                            className="text-sm text-red-500 hover:underline cursor-pointer"
                        >
                            Reset All
                        </button>
                    )}

                    <Button
                        onClick={handleApply}
                        className="bg-teal-600 hover:bg-teal-700 px-5"
                    >
                        Apply Filters
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
