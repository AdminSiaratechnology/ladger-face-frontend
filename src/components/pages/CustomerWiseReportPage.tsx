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
import { useLocation } from "react-router-dom";

const CustomerWiseReportPage = () => {
  const { defaultSelected } = useCompanyStore();
  const location = useLocation();
  const companyId = defaultSelected?._id;

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [openFilter, setOpenFilter] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [hasAppliedFilter, setHasAppliedFilter] = useState(false);

  const [localDateRange, setLocalDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

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

  /* ---------------- DATE RANGE ---------------- */
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
  }, [localDateRange, setFilter]);

  const resetDateRange = useCallback(() => {
    setLocalDateRange({});
    setFilter("startDate", undefined);
    setFilter("endDate", undefined);
  }, [setFilter]);

  /* ---------------- APPLY FILTERS (FIXED) ---------------- */
  const handleApplyFilters = (updatedFilters: any) => {
    if (!updatedFilters.customerId || updatedFilters.customerId === "all") {
      setHasAppliedFilter(false);
      return;
    }

    applyDateRange();
    setFilter("page", 1);
    setHasAppliedFilter(true);
    setOpenFilter(false);
  };

  /* ---------------- CLEAR ALL ---------------- */
  const handleClearAll = () => {
    resetFilters();
    resetDateRange();
    setFilterCount(0);
    setHasAppliedFilter(false);
  };

  /* ---------------- AUTO OPEN FILTER ON ROUTE ---------------- */
  useEffect(() => {
    setOpenFilter(true);
  }, [location.pathname]);

  /* ---------------- FILTER COUNT ---------------- */
  useEffect(() => {
    let count = 0;
    if (filters.customerId && filters.customerId !== "all") count++;
    if (filters.salesmanId && filters.salesmanId !== "all") count++;
    if (filters.status && filters.status !== "all") count++;
    if (filters.mode && filters.mode !== "all") count++;
    if (filters.startDate && filters.endDate) count++;
    setFilterCount(count);
  }, [filters]);

  /* ---------------- FETCH REPORT ---------------- */
  useEffect(() => {
    if (
      companyId &&
      hasAppliedFilter &&
      filters.customerId &&
      filters.customerId !== "all"
    ) {
      fetchReport(companyId);
    }
  }, [
    companyId,
    hasAppliedFilter,
    filters.page,
    filters.customerId,
    filters.salesmanId,
    filters.status,
    filters.mode,
    filters.startDate,
    filters.endDate,
    fetchReport,
  ]);

  /* ---------------- STATS ---------------- */
  const statCards = useMemo(
    () => [
      {
        label: "Total Transactions",
        value: hasAppliedFilter ? stats?.totalTransactions || 0 : 0,
        icon: <Users className="w-8 h-8" />,
        colorClass: "from-blue-500 to-blue-600",
      },
      {
        label: "Total Sales",
        value: hasAppliedFilter
          ? `₹${stats?.totalSales?.toLocaleString() || 0}`
          : "₹0",
        icon: <TrendingUp className="w-8 h-8" />,
        colorClass: "from-teal-500 to-teal-600",
      },
      {
        label: "Total Received",
        value: hasAppliedFilter
          ? `₹${stats?.totalReceived?.toLocaleString() || 0}`
          : "₹0",
        icon: <TrendingDown className="w-8 h-8" />,
        colorClass: "from-green-500 to-green-600",
      },
      {
        label: "Outstanding",
        value: hasAppliedFilter
          ? `₹${stats?.outstanding?.toLocaleString() || 0}`
          : "₹0",
        icon: <DollarSign className="w-8 h-8" />,
        colorClass: "from-gray-500 to-gray-600",
      },
    ],
    [stats, hasAppliedFilter]
  );

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

  const showInitialHeading = !loading && !hasAppliedFilter;

  /* ---------------- UI ---------------- */
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
                <td className="px-6 py-4 font-medium">
                  {t.customerName}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {t.salesmanName}
                </td>
                <td className="px-6 py-4">
                  <Badge className="capitalize">{t.type}</Badge>
                </td>
                <td className="px-6 py-4 text-right text-red-600">
                  ₹{t.orderAmount?.toLocaleString() || "-"}
                </td>
                <td className="px-6 py-4 text-right text-green-600">
                  ₹{t.paymentAmount?.toLocaleString() || "-"}
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
              {format(new Date(t.date), "dd MMM yyyy")}
            </p>
            <p className="text-xs text-gray-500">
              {t.customerName}
            </p>
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
  return (
    <>
      <GenericReportPage
        title="Customer Wise Report"
        subtitle="All Orders & Payments - Combined View"
        stats={statCards}
        loading={loading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        data={hasAppliedFilter ? transactions : []}
        totalItems={showInitialHeading ? 1 : pagination.total || 0}
        totalPages={showInitialHeading ? 1 : pagination.totalPages || 1}
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
        {showInitialHeading ? (
               <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                 <Users className="w-12 h-12 mb-3 text-gray-400" />
                 <p className="text-lg font-medium">
                   Select customer or apply filters
                 </p>
                 <p className="text-sm">
                   to view customer wise records
                 </p>
               </div>
             ) : viewMode === "table" ? (
               TableView
             ) : (
               CardView
             )}
      </GenericReportPage>

      <UniversalReportFilter
        variant="modal"
        open={openFilter}
        onClose={setOpenFilter}
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
        isCustomer={true}
      />
    </>
  );
};

export default CustomerWiseReportPage;
