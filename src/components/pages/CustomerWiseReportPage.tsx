// pages/reports/CustomerWiseReportPage.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useCustomerWiseReportStore } from "../../../store/CustomerWiseReportStore";
import { useCompanyStore } from "../../../store/companyStore";
import GenericReportPage from "../customComponents/GenericReportPage";
import ReportFilterBar from "../customComponents/CustomerWiseReportFilterBar";
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

  const today = new Date();
  const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const [localDateRange, setLocalDateRange] = useState<{ from?: Date; to?: Date }>({
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

  const [localFilters, setLocalFilters] = useState({
  customerId: filters.customerId || "all",
  salesmanId: filters.salesmanId || "all",
  status: filters.status || "all",
  mode: filters.mode || "all",
});
console.log(localFilters,"localfilter")
const handleApplyFilters = () => {
  // Apply all at once
  setFilter("customerId", localFilters.customerId === "all" ? undefined : localFilters.customerId);
  setFilter("salesmanId", localFilters.salesmanId === "all" ? undefined : localFilters.salesmanId);
  setFilter("status", localFilters.status === "all" ? undefined : localFilters.status);
  setFilter("mode", localFilters.mode === "all" ? undefined : localFilters.mode);
  applyDateRange();
  setFilter("page", 1);
};

  // Apply date range
  const applyDateRange = useCallback(() => {
    setFilter("startDate", localDateRange.from?.toISOString());
    setFilter("endDate", localDateRange.to?.toISOString());
    setFilter("page", 1);
  }, [localDateRange, setFilter]);

  const resetDateRange = useCallback(() => {
    setLocalDateRange({});
    setFilter("startDate", undefined);
    setFilter("endDate", undefined);
  }, [setFilter]);

  const handleClearAll = useCallback(() => {
    setLocalDateRange({});
    resetFilters();
  }, [resetFilters]);

  const isAnyFilterActive = useMemo(() => {
    return (
      filters.customerId ||
      filters.salesmanId !== "all" ||
      filters.status !== "all" ||
      filters.mode !== "all" ||
      !!filters.startDate
    );
  }, [filters]);

  // Handle customer change
  const handleCustomerChange = useCallback((value: string) => {
    setFilter("customerId", value === "all" ? undefined : value);
    setFilter("page", 1);
  }, [setFilter]);

  // Handle salesman change
  const handleSalesmanChange = useCallback((value: string) => {
    setFilter("salesmanId", value === "all" ? undefined : value);
    setFilter("page", 1);
  }, [setFilter]);

  // Fetch report
  useEffect(() => {
    if (companyId) {
      fetchReport(companyId);
    }
  }, [
    companyId,
    filters.page,
    filters.search,
    filters.customerId,
    filters.salesmanId,
    filters.status,
    filters.mode,
    filters.startDate,
    filters.endDate,
    fetchReport,
  ]);

  // Stats Cards
  const statCards = useMemo(() => [
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
      colorClass: stats?.outstanding > 0 ? "from-red-500 to-red-600" : "from-gray-500 to-gray-600",
    },
  ], [stats]);

  const headers = ["Date", "Customer", "Salesman", "Type", "Bill Amount", "Deposit Amount", "Status", "Remarks"];

  const TableView = useMemo(() => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader headers={headers} />
          <tbody className="divide-y divide-gray-100">
            {transactions.map((t) => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm whitespace-nowrap">
                  {format(new Date(t.date), "dd MMM yyyy")}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-sm md:text-base">
                  {t.customerName}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                  {t.salesmanName}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4">
                  <Badge
                    variant={t.type === "Order" ? "destructive" : "default"}
                    className="capitalize text-xs md:text-sm"
                  >
                    {t.type}
                  </Badge>
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-right font-medium text-red-600 text-xs md:text-sm whitespace-nowrap">
                  {t.orderAmount ? `₹${t.orderAmount.toLocaleString()}` : "-"}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-right font-medium text-green-600 text-xs md:text-sm whitespace-nowrap">
                  {t.paymentAmount ? `₹${t.paymentAmount.toLocaleString()}` : "-"}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4">
                  <Badge className={cn(
                    t.status === "completed" && "bg-green-100 text-green-800",
                    t.status === "failed" && "bg-red-100 text-red-800",
                    t.status === "pending" && "bg-amber-100 text-amber-800",
                    "capitalize text-xs md:text-sm"
                  )}>
                    {t.status}
                  </Badge>
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 truncate max-w-[100px] md:max-w-xs">
                  {t.remarks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ), [transactions]);

  const CardView = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {transactions.map((t) => (
        <Card key={t._id} className="hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">{format(new Date(t.date), "dd MMM yyyy, hh:mm a")}</p>
                <p className="text-xs text-gray-500">{t.customerName}</p>
              </div>
              <Badge variant={t.type === "Order" ? "destructive" : "default"} className="capitalize">
                {t.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {t.orderAmount !== null && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bill Amount</span>
                  <span className="font-bold text-red-600">₹{t.orderAmount.toLocaleString()}</span>
                </div>
              )}
              {t.paymentAmount !== null && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Deposit Amount</span>
                  <span className="font-bold text-green-600">₹{t.paymentAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Salesman</span>
                <span className="font-medium">{t.salesmanName}</span>
              </div>
              <div className="text-xs text-gray-500 pt-2 border-t">{t.remarks}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ), [transactions]);

  return (
    <GenericReportPage
      title="Customer Wise Report"
      subtitle="All Orders & Payments - Combined View"
      stats={statCards}
      loading={loading}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      data={transactions}
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
      <ReportFilterBar
  customerId={localFilters.customerId}
  onCustomerChange={(v) => setLocalFilters(prev => ({ ...prev, customerId: v }))}
  salesmanId={localFilters.salesmanId}
  onSalesmanChange={(v) => setLocalFilters(prev => ({ ...prev, salesmanId: v }))}
  status={localFilters.status}
  onStatusChange={(v) => setLocalFilters(prev => ({ ...prev, status: v }))}
  mode={localFilters.mode}
  onModeChange={(v) => setLocalFilters(prev => ({ ...prev, mode: v }))}
  companyId={companyId}
  localDateRange={localDateRange}
  setLocalDateRange={setLocalDateRange}
  applyDateRange={applyDateRange}
  resetDateRange={resetDateRange}
  onClearAll={handleClearAll}
  isAnyFilterActive={isAnyFilterActive}
  onApplyFilters={handleApplyFilters}
/>
      }
    >
      {viewMode === "table" ? TableView : CardView}
    </GenericReportPage>
  );
};

export default CustomerWiseReportPage;