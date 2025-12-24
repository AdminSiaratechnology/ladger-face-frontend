import React, { useEffect, useMemo, useState } from "react";
import { usePosStore } from "../../../store/posStore";
import { useCompanyStore } from "../../../store/companyStore";
import GenericReportPage from "../customComponents/GenericReportPage";
import TableHeader from "../customComponents/CustomTableHeader";
import ReportFilterActions from "../customComponents/ReportFilterActions";
import CustomerWiseFilterModal from "../customComponents/CustomerWiseFilterModal";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Smartphone, Receipt, Eye, X, Banknote } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import UniversalReportFilter from "../customComponents/UniversalReportFilter";

const PosReport = () => {
  // ===============================
  // STORES
  // ===============================
  const {
    sessionSales,
    posReportData,
    posReportLoading,
    posReportPagination,
    fetchCompanyPosReport,
  } = usePosStore();

  const { defaultSelected } = useCompanyStore();
      const defaultCurrency = defaultSelected?.defaultCurrencySymbol || "₹";
  const companyId = defaultSelected?._id;

  // ===============================
  // STATES
  // ===============================
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [openFilter, setOpenFilter] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [openBillModal, setOpenBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  const [filters, setFilters] = useState({
    billNumber: "",
    customerId: "",
    paymentType: "",
    startDate: "",
    endDate: "",
    customer: "",
  });
console.log(filters)
  // ===============================
  // DATE FORMAT
  // ===============================
  const safeDate = (date: any) => {
    if (!date) return "-";
    const d = new Date(date);
    return isNaN(d.getTime())
      ? "-"
      : format(d, "dd MMM yyyy, hh:mm a");
  };

  // ===============================
  // LOAD
  // ===============================
  useEffect(() => {
    if (companyId) {
      fetchCompanyPosReport({
        companyId,
        page: 1,
        limit: posReportPagination.limit,
      });
    }
  }, [companyId]);

  // ===============================
  // FILTER HANDLERS
  // ===============================
  const handleClearFilters = () => {
    setFilters({
      billNumber: "",
      customerId: "",
      paymentType: "",
      startDate: "",
      endDate: "",
      customer: "",
    });

    setFilterCount(0);

    fetchCompanyPosReport({
      companyId,
      page: 1,
      limit: posReportPagination.limit,
    });
  };

  const handleApplyFilters = (appliedFilters = filters) => {
    const params: any = {
      companyId,
      page: 1,
      limit: posReportPagination.limit,
    };

    if (appliedFilters.billNumber)
      params.billNumber = appliedFilters.billNumber;

    if (appliedFilters.customerId)
      params.customerId = appliedFilters.customerId;

    if (appliedFilters.paymentType)
      params.paymentType = appliedFilters.paymentType.toUpperCase();

    if (appliedFilters.startDate && appliedFilters.endDate) {
      params.startDate = appliedFilters.startDate;
      params.endDate = appliedFilters.endDate;
    }

    if (appliedFilters.customer)
      params.customer = appliedFilters.customer;

    setFilterCount(Object.values(appliedFilters).filter(Boolean).length);
    setOpenFilter(false);

    fetchCompanyPosReport(params);
  };


  // ===============================
  // DATA
  // ===============================
  const rows =
    posReportData && posReportData.length
      ? posReportData
      : sessionSales;

  // ===============================
  // STATS
  // ===============================
  const stats = useMemo(() => {
    let cash = 0;
    let card = 0;
    let upi = 0;

    rows.forEach((s: any) => {
      const p = s.paymentInfo?.payments || {};
      cash += Number(p.cash || 0);
      card += Number(p.card || 0);
      upi += Number(p.upi || 0);
    });

    return [
      {
        label: "Total Bills",
        value: posReportPagination.total,
        icon: <Receipt className="w-8 h-8" />,
        colorClass: "from-blue-500 to-blue-600",
      },
      {
        label: "Cash Sales",
        value: `${defaultCurrency} ${cash.toLocaleString()}`,
        icon: <Banknote className="w-8 h-8" />,
        colorClass: "from-green-500 to-green-600",
      },
      {
        label: "Card Sales",
        value: `${defaultCurrency} ${card.toLocaleString()}`,
        icon: <CreditCard className="w-8 h-8" />,
        colorClass: "from-indigo-500 to-indigo-600",
      },
      {
        label: "UPI Sales",
        value: `${defaultCurrency} ${upi.toLocaleString()}`,
        icon: <Smartphone className="w-8 h-8" />,
        colorClass: "from-purple-500 to-purple-600",
      },
    ];
  }, [rows, posReportPagination.total]);

  // ===============================
  // VIEW BILL
  // ===============================
  const handleViewBill = (bill: any) => {
    setSelectedBill(bill);
    setOpenBillModal(true);
  };

  // ===============================
  // HEADERS (UNCHANGED COMPONENT)
  // ===============================
  const headers = ["Date", "Bill No", "Payment Mode", "Amount", "View"];

  // ===============================
  // TABLE VIEW
  // ===============================
  const TableView = useMemo(
    () => (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader headers={headers} />

            <tbody className="divide-y divide-gray-100">
              {rows.map((s: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-start text-sm">
                    {safeDate(s.createdAt)}
                  </td>

                  <td className="px-6 py-4 text-start font-medium ">
                    {s.billNumber || "-"}
                  </td>

                  <td className="px-6 py-4">
                    <Badge className="capitalize">
                      {s.paymentInfo?.paymentType || "-"}
                    </Badge>
                  </td>

                  {/* ✅ Amount aligned properly */}
                  <td className="px-6 py-4 text-start  font-semibold text-green-600">
                    {defaultCurrency} {Number(s.totalAmount || 0).toLocaleString()}
                  </td>

                  {/* ✅ View column */}
                  <td className="px-6 py-4 text-start">
                    <button
                      onClick={() => handleViewBill(s)}
                      className="text-teal-600 hover:text-teal-800 cursor-pointer"
                      title="View Bill"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    ),
    [rows]
  );

  // ===============================
  // CARD VIEW (NO CHANGE)
  // ===============================
  const CardView = useMemo(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rows.map((s: any, i: number) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {s.billNumber || "-"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {safeDate(s.createdAt)}
                  </p>
                </div>
                <Badge className="capitalize">
                  {s.paymentInfo?.paymentType || "-"}
                </Badge>
              </div>
            </CardHeader>
<CardContent>
  <div className="flex justify-between items-center">
    <div className="font-bold text-green-600">
      {defaultCurrency} {Number(s.totalAmount || 0).toLocaleString()}
    </div>

    <button
      onClick={() => handleViewBill(s)}
      className="text-teal-600 hover:text-teal-800 cursor-pointer"
      title="View Bill"
    >
      <Eye className="w-5 h-5" />
    </button>
  </div>
</CardContent>

          </Card>
        ))}
      </div>
    ),
    [rows]
  );

  // ===============================
  // RENDER
  // ===============================
  return (
    <>
      <GenericReportPage
        title="POS Report"
        subtitle="Company Wise POS Transactions"
        stats={stats}
        loading={posReportLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        data={rows}
        totalItems={posReportPagination.total}
        totalPages={posReportPagination.totalPages}
        currentPage={posReportPagination.page}
        limit={posReportPagination.limit}
        onPageChange={(page) =>
          fetchCompanyPosReport({
            companyId,
            page,
            limit: posReportPagination.limit,
          })
        }
        reportType="pos"
        exportFileName="POS_Report"
        onClearFilters={handleClearFilters}
        customFilterBar={
          <ReportFilterActions
            count={filterCount}
            onClear={handleClearFilters}
            onFilter={() => setOpenFilter(true)}
          />
        }
      >
        {viewMode === "table" ? TableView : CardView}
      </GenericReportPage>
      <UniversalReportFilter
        variant="modal"
        open={openFilter}
        onClose={setOpenFilter}
        filters={filters}
        setFilters={setFilters}
        onApply={(appliedFilters) => handleApplyFilters(appliedFilters)}
        onReset={handleClearFilters}
        showBillNo
        showCustomer
        showMode
        showDateRange

        /* ✅ MISSING PROPS */
        localDateRange={{
          from: filters.startDate ? new Date(filters.startDate) : undefined,
          to: filters.endDate ? new Date(filters.endDate) : undefined,
        }}
        setLocalDateRange={(range: any) => {
          setFilters((prev) => ({
            ...prev,
            startDate: range?.from
              ? format(range.from, "yyyy-MM-dd")
              : "",
            endDate: range?.to
              ? format(range.to, "yyyy-MM-dd")
              : "",
          }));
        }}

        applyDateRange={() => { }}
        resetDateRange={() => {
          setFilters((prev) => ({
            ...prev,
            startDate: "",
            endDate: "",
          }));
        }}
      />

      <Dialog open={openBillModal} onOpenChange={setOpenBillModal}>
        <DialogContent className="custom-dialog-container p-0 overflow-hidden">

          {/* 🔹 INNER WRAPPER (VERY IMPORTANT) */}
          <div className="flex flex-col rounded-2xl overflow-hidden bg-gray-50">

            {/* HEADER */}
            <div className="flex items-center justify-between
                bg-gradient-to-r from-indigo-500 to-indigo-600
                text-white p-4">
              <div>
                <h2 className="text-lg font-semibold">Bill Details</h2>
                <p className="text-xs opacity-90">
                  Invoice • {selectedBill?.billNumber}
                </p>
              </div>
            </div>

            {/* BODY */}
            {selectedBill && (
              <div className="p-6 space-y-6">

                {/* BASIC INFO */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "Bill No", value: selectedBill.billNumber },
                    { label: "Date", value: safeDate(selectedBill.createdAt) },
                    {
                      label: "Payment",
                      value: (
                        <Badge className="capitalize bg-black text-white">
                          {selectedBill.paymentInfo?.paymentType || "-"}
                        </Badge>
                      ),
                    },
                    {
                      label: "Customer",
                      value: selectedBill.customer?.name || "Walk-in",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl border p-4 shadow-sm"
                    >
                      <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                      <div className="font-medium text-sm">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* ITEMS */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b font-semibold">
                    Items
                  </div>

                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">Item</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.items?.map((it: any, i: number) => (
                        <tr
                          key={i}
                          className="border-t hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-3">{it.name}</td>
                          <td className="px-4 py-3 text-center">{it.qty}</td>
                          <td className="px-4 py-3 text-right">
                            {defaultCurrency} {Number(it.price).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {defaultCurrency} {Number(it.total).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* TOTALS */}
                <div className="flex justify-end">
                  <div className="w-full md:w-1/3 bg-white rounded-xl border shadow-sm p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>
                        {defaultCurrency} {Number(selectedBill.subtotal || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>
                        {defaultCurrency} {Number(selectedBill.taxAmount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-base font-semibold
                              text-emerald-600 border-t pt-2">
                      <span>Total</span>
                      <span>
                        {defaultCurrency} {Number(selectedBill.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default PosReport;
