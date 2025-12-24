// pages/reports/CustomerWiseReportPage.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useCustomerWiseReportStore } from "../../../store/CustomerWiseReportStore";
import { useCompanyStore } from "../../../store/companyStore";
import GenericReportPage from "../customComponents/GenericReportPage";
import ReportFilterActions from "../customComponents/ReportFilterActions";
import UniversalReportFilter from "../customComponents/UniversalReportFilter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";
import { format } from "date-fns";
import TableHeader from "../customComponents/CustomTableHeader";
import { cn } from "@/lib/utils";

const CustomerWiseReportPage = () => {
  const { defaultSelected } = useCompanyStore();
  const companyId = defaultSelected?._id;

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
const [openFilter, setOpenFilter] = useState(true);
  const [filterCount, setFilterCount] = useState(0);




  const today = new Date();
  const firstDayLastMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  );

  const [localDateRange, setLocalDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({
    from: firstDayLastMonth,
    to: today,
  });

  const {
    data: transactions = [],
    stats,
    loading,
    filters,
    pagination,
    setFilter,
    fetchReport,
    fetchAllReport,
    resetFilters,
  } = useCustomerWiseReportStore();

  // ---------------------------
  // CUSTOMER SELECTED FLAG
  // ---------------------------
  const isCustomerSelected =
    filters.customerId && filters.customerId !== "all";

  // ---------------------------
  // APPLY DATE RANGE
  // ---------------------------
  const applyDateRange = useCallback(() => {
    setFilter(
      "startDate",
      localDateRange.from
        ? format(localDateRange.from, "yyyy-MM-dd")
        : undefined
    );

    setFilter(
      "endDate",
      localDateRange.to
        ? format(localDateRange.to, "yyyy-MM-dd")
        : undefined
    );

    setFilter("page", 1);
  }, [localDateRange, setFilter]);

  const resetDateRange = useCallback(() => {
    setLocalDateRange({});
    setFilter("startDate", undefined);
    setFilter("endDate", undefined);
  }, [setFilter]);

  // ---------------------------
  // APPLY FILTERS
  // ---------------------------
  const handleApplyFilters = () => {
    applyDateRange();
    setFilter("page", 1);
    setOpenFilter(false);
  };

  // ---------------------------
  // CLEAR ALL
  // ---------------------------
  const handleClearAll = () => {
    setLocalDateRange({});
    resetFilters();
    setFilterCount(0);
  };

  // ---------------------------
  // FILTER COUNT
  // ---------------------------
  useEffect(() => {
    let count = 0;

    if (filters.customerId && filters.customerId !== "all") count++;
    if (filters.salesmanId && filters.salesmanId !== "all") count++;
    if (filters.status && filters.status !== "all") count++;
    if (filters.mode && filters.mode !== "all") count++;
    if (filters.startDate && filters.endDate) count++;

    setFilterCount(count);
  }, [filters]);

  // ---------------------------
  // FETCH REPORT (ONLY AFTER CUSTOMER SELECT)
  // ---------------------------
  useEffect(() => {
    if (!companyId) return;
    if (!isCustomerSelected) return;

    fetchReport(companyId);
  }, [
    companyId,
    isCustomerSelected,
    filters.page,
    filters.salesmanId,
    filters.status,
    filters.mode,
    filters.startDate,
    filters.endDate,
    fetchReport,
  ]);

  // ---------------------------
  // STATS (ONLY WHEN CUSTOMER SELECTED)
  // ---------------------------
  const statCards = useMemo(
    () => [
      {
        label: "Total Transactions",
        value: stats?.totalTransactions || 0,
        icon: <Users className="w-8 h-8" />,
        colorClass: "from-blue-500 to-blue-600",
      },
      {
        label: "Total Sales",
        value: `₹${stats?.totalSales?.toLocaleString() || 0}`,
        icon: <TrendingUp className="w-8 h-8" />,
        colorClass: "from-teal-500 to-teal-600",
      },
      {
        label: "Total Received",
        value: `₹${stats?.totalReceived?.toLocaleString() || 0}`,
        icon: <TrendingDown className="w-8 h-8" />,
        colorClass: "from-green-500 to-green-600",
      },
      {
        label: "Outstanding",
        value: `₹${stats?.outstanding?.toLocaleString() || 0}`,
        icon: <DollarSign className="w-8 h-8" />,
        colorClass:
          stats?.outstanding > 0
            ? "from-red-500 to-red-600"
            : "from-gray-500 to-gray-600",
      },
    ],
    [stats]
  );

  const pageStats = isCustomerSelected ? statCards : [];

  // ---------------------------
  // HEADERS
  // ---------------------------
  const headers = [
    "Date",
    "Customer",
    "Salesman",
    "Type",
    "Bill Amount",
    "Deposit Amount",
    "Status",
    "Remarks",
  ];

  // ---------------------------
  // TABLE VIEW
  // ---------------------------
  const TableView = (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader headers={headers} />
          <tbody className="divide-y divide-gray-100">
            {transactions.map((t: any) => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">
                  {format(new Date(t.date), "dd MMM yyyy")}
                </td>
                <td className="px-6 py-4 font-medium">{t.customerName}</td>
                <td className="px-6 py-4 text-gray-600">
                  {t.salesmanName}
                </td>
                <td className="px-6 py-4">
                  <Badge className="capitalize">{t.type}</Badge>
                </td>
                <td className="px-6 py-4 text-right text-red-600">
                  {t.orderAmount
                    ? `₹${t.orderAmount.toLocaleString()}`
                    : "-"}
                </td>
                <td className="px-6 py-4 text-right text-green-600">
                  {t.paymentAmount
                    ? `₹${t.paymentAmount.toLocaleString()}`
                    : "-"}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    className={cn(
                      t.status === "completed" &&
                        "bg-green-100 text-green-800",
                      t.status === "failed" &&
                        "bg-red-100 text-red-800",
                      t.status === "pending" &&
                        "bg-amber-100 text-amber-800",
                      "capitalize"
                    )}
                  >
                    {t.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-gray-600 truncate max-w-xs">
                  {t.remarks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ---------------------------
  // CARD VIEW
  // ---------------------------
  const CardView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {transactions.map((t: any) => (
        <Card key={t._id}>
          <CardHeader>
            <p className="text-sm font-medium">
              {format(new Date(t.date), "dd MMM yyyy, hh:mm a")}
            </p>
            <p className="text-xs text-gray-500">{t.customerName}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Bill</span>
                <span className="text-red-600">
                  ₹{t.orderAmount?.toLocaleString() || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Paid</span>
                <span className="text-green-600">
                  ₹{t.paymentAmount?.toLocaleString() || "-"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Dummy data only to keep header visible
  const pageData = isCustomerSelected ? transactions : [{}];

  return (
    <>
      <GenericReportPage
        title="Customer Wise Report"
        subtitle="All Orders & Payments - Combined View"
        stats={pageStats}
        loading={loading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        data={pageData}
        totalItems={pagination.total || 0}
        totalPages={pagination.totalPages || 1}
        currentPage={filters.page}
        onPageChange={(p) => setFilter("page", p)}
        limit={filters.limit}
        onClearFilters={handleClearAll}
        reportType="customer-wise"
        exportFileName="Customer_Wise_Report"
        onExportDetailed={async () => await fetchAllReport(companyId)}
        customFilterBar={
          <ReportFilterActions
            count={filterCount}
            onClear={handleClearAll}
            onFilter={() => setOpenFilter(true)}
          />
        }
      >
        {!isCustomerSelected ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-500">
            <Users className="w-12 h-12 mb-3 text-gray-400" />
            <p className="text-sm font-medium">
              Select customer from filter to view report
            </p>
          </div>
        ) : viewMode === "table" ? (
          TableView
        ) : (
          CardView
        )}
      </GenericReportPage>

      {/* FILTER MODAL */}
{openFilter && (
  <UniversalReportFilter
    key="customer-wise-auto-open"
 open={openFilter}
  onClose={(val: boolean) => setOpenFilter(val)}
    filters={filters}
    setFilters={(updater: any) => {
      if (typeof updater === "function") {
        const updated = updater(filters);
        Object.keys(updated).forEach((k) => setFilter(k, updated[k]));
      } else {
        Object.keys(updater).forEach((k) => setFilter(k, updater[k]));
      }
    }}
    onApply={handleApplyFilters}
    onReset={handleClearAll}
    companyId={companyId}
    showCustomerSelect
    showSalesman
    showStatus
    showMode
    showDateRange
    localDateRange={localDateRange}
    setLocalDateRange={setLocalDateRange}
    applyDateRange={applyDateRange}
    resetDateRange={resetDateRange}
  />
)}


    </>
  );
};

export default CustomerWiseReportPage;
