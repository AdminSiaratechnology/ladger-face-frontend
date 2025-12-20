import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useCustomerWiseReportStore } from "../../../store/CustomerWiseReportStore";
import { useCompanyStore } from "../../../store/companyStore";
import GenericReportPage from "../customComponents/GenericReportPage";
import ReportFilterBar from "../customComponents/CustomerWiseReportFilterBar"; // ✅ FIX: Importing the Type
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Users, UserCircle } from "lucide-react";
import { format } from "date-fns";
import TableHeader from "../customComponents/CustomTableHeader";
import { cn } from "@/lib/utils";

interface FilterValues {
  customerId: string;
  salesmanId: string;
  status: string;
  mode: string;
}

const CustomerWiseReportPage = () => {
  const { defaultSelected } = useCompanyStore();
  const companyId = defaultSelected?._id;

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Date Logic
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

  const isCustomerSelectedInStore = useMemo(() => {
    return filters.customerId && filters.customerId !== "all";
  }, [filters.customerId]);

  // --- API FETCH CONTROL ---
  useEffect(() => {
    if (!companyId || !isCustomerSelectedInStore) {
      return; 
    }
    fetchReport(companyId);
  }, [
    companyId,
    filters.page,
    filters.limit,
    filters.search,
    filters.customerId,
    filters.salesmanId,
    filters.status,
    filters.mode,
    filters.startDate,
    filters.endDate,
    fetchReport,
    isCustomerSelectedInStore
  ]);

  // ✅ FIX: Handler accepts values from Child to prevent Double Click issue
  const handleApplyFilters = (values: FilterValues) => {
    if (!values.customerId || values.customerId === "all") {
       return;
    }

    setFilter("customerId", values.customerId);
    setFilter("salesmanId", values.salesmanId === "all" ? undefined : values.salesmanId);
    setFilter("status", values.status === "all" ? undefined : values.status);
    setFilter("mode", values.mode === "all" ? undefined : values.mode);
    
    setFilter("startDate", localDateRange.from?.toISOString());
    setFilter("endDate", localDateRange.to?.toISOString());
    
    setFilter("page", 1);
  };

  const resetDateRange = useCallback(() => {
    setLocalDateRange({});
    setFilter("startDate", undefined);
    setFilter("endDate", undefined);
  }, [setFilter]);

  const handleClearAll = useCallback(() => {
    setLocalDateRange({});
    resetFilters();
    setLocalFilters({
      customerId: "all",
      salesmanId: "all",
      status: "all",
      mode: "all"
    });
  }, [resetFilters]);

  const isAnyFilterActive = useMemo(() => {
    return (
      !!filters.customerId || 
      filters.salesmanId !== "all" ||
      filters.status !== "all" ||
      filters.mode !== "all" ||
      !!filters.startDate
    );
  }, [filters]);

  const statCards = useMemo(() => {
    if (!isCustomerSelectedInStore) return [];

    return [
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
    ];
  }, [stats, isCustomerSelectedInStore]);

  const headers = ["Date", "Customer", "Salesman", "Type", "Bill Amount", "Deposit Amount", "Status", "Remarks"];

  const TableView = useMemo(() => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader headers={headers} />
          <tbody className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <tr>
                 <td colSpan={8} className="p-8 text-center text-gray-500">No transactions found for this period.</td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50 transition-colors">
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
                    <Badge variant={t.type === "Order" ? "destructive" : "default"} className="capitalize text-xs md:text-sm">
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
              ))
            )}
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

  const NoCustomerSelectedView = () => (
    <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border-2 border-dashed border-gray-200">
      <div className="bg-indigo-50 p-6 rounded-full mb-4 shadow-sm">
        <UserCircle className="w-16 h-16 text-indigo-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800">No Customer Selected</h3>
      <p className="text-gray-500 mt-2 text-center max-w-md">
        Please select a customer from the filter bar above and click <span className="font-semibold text-teal-600">"Apply Filters"</span> to generate the report.
      </p>
    </div>
  );

  return (
    <GenericReportPage
      title="Customer Wise Report"
      subtitle="Detailed ledger and transaction history"
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
      exportFileName={`Customer_Report_${format(new Date(), "dd-MM-yyyy")}`}
      onExportDetailed={async () => await fetchAllReport(companyId)}
      disableExport={!isCustomerSelectedInStore}
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
          applyDateRange={() => {}} 
          resetDateRange={resetDateRange}
          onClearAll={handleClearAll}
          isAnyFilterActive={isAnyFilterActive}
          onApplyFilters={handleApplyFilters} // Passing the fixed handler
        />
      }
    >
      {!isCustomerSelectedInStore ? (
        <NoCustomerSelectedView />
      ) : (
        viewMode === "table" ? TableView : CardView
      )}
    </GenericReportPage>
  );
};

export default CustomerWiseReportPage;