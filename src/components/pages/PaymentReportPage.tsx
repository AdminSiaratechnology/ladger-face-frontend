import { useEffect, useMemo, useState, useCallback } from "react";
import { usePaymentReportStore } from "../../../store/PaymentReportStore";
import { useCompanyStore } from "../../../store/companyStore";
import { useUserManagementStore } from "../../../store/userManagementStore";
import GenericReportPage from "../customComponents/GenericReportPage";
import ReportFilterActions from "../customComponents/ReportFilterActions";
import UniversalReportFilter from "../customComponents/UniversalReportFilter";
import { Badge } from "@/components/ui/badge";

import {
  DollarSign,
  Clock,
  CheckCircle,
  CreditCard,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "../ui/card";
import TableHeader from "../customComponents/CustomTableHeader";

const PaymentReportPage = () => {
  const { defaultSelected } = useCompanyStore();
     const defaultCurrency = defaultSelected?.defaultCurrencySymbol || "₹";
  const { users } = useUserManagementStore();
  const companyId = defaultSelected?._id;

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [openFilter, setOpenFilter] = useState(false);
  const [filterCount, setFilterCount] = useState(0);

  const [localSearch, setLocalSearch] = useState("");
  const [localDateRange, setLocalDateRange] = useState<{ from?: Date; to?: Date }>({});

  const {
    data: payments,
    stats,
    loading,
    filters,
    pagination,
    setFilter,
    fetchReport,
    fetchAllReport,
    resetFilters,
  } = usePaymentReportStore();

  // ✅ FIX: adapter for UniversalReportFilter
  const setFilters = useCallback(
    (updater: any) => {
      if (typeof updater === "function") {
        const next = updater(filters);
        Object.entries(next).forEach(([key, value]) => {
          setFilter(key as any, value);
        });
      } else {
        Object.entries(updater).forEach(([key, value]) => {
          setFilter(key as any, value);
        });
      }
    },
    [filters, setFilter]
  );

  // ---------------------------
  // SEARCH (DEBOUNCE)
  // ---------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        setFilter("search", localSearch);
        setFilter("page", 1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, setFilter]);

  // ---------------------------
  // DATE RANGE
  // ---------------------------
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

  // ---------------------------
  // APPLY FILTERS
  // ---------------------------
  const handleApplyFilters = (updatedFilters?: any) => {
  if (updatedFilters) {
    Object.entries(updatedFilters).forEach(([key, value]) => {
      setFilter(key as any, value);
    });
  }

  applyDateRange();
  setFilter("page", 1);
  setOpenFilter(false);
};

  // ---------------------------
  // CLEAR ALL
  // ---------------------------
  const resetAllFilters = useCallback(() => {
    setLocalSearch("");
    setLocalDateRange({});
    resetFilters();
    setFilterCount(0);
  }, [resetFilters]);

  // ---------------------------
  // FILTER COUNT
  // ---------------------------
 useEffect(() => {
  let count = 0;

  if (filters.search && filters.search.trim() !== "") count++;

  if (filters.status && filters.status !== "all") count++;

  if (filters.mode && filters.mode !== "all") count++;

  if (filters.userId && filters.userId !== "all") count++;

  if (filters.startDate && filters.endDate) count++;

  setFilterCount(count);
}, [filters]);


  // ---------------------------
  // FETCH REPORT
  // ---------------------------
  useEffect(() => {
    if (!companyId) return;
    fetchReport(companyId);
  }, [
    companyId,
    filters.page,
    filters.limit,
    filters.search,
    filters.status,
    filters.mode,
    filters.userId,
    filters.startDate,
    filters.endDate,
    fetchReport,
  ]);

  // ---------------------------
  // STATS
  // ---------------------------
  const statCards = useMemo(
    () => [
      {
        label: "Total Amount",
        value: `${defaultCurrency} ${stats?.totalAmount?.toLocaleString() || 0}`,
        icon: <Banknote className="w-8 h-8" />,
        colorClass: "from-teal-500 to-teal-600",
      },
      {
        label: "Total Payments",
        value: stats?.totalPayments || 0,
        icon: <CreditCard className="w-8 h-8" />,
        colorClass: "from-blue-500 to-blue-600",
      },
      {
        label: "Pending",
        value: stats?.pending || 0,
        icon: <Clock className="w-8 h-8" />,
        colorClass: "from-orange-500 to-orange-600",
      },
      {
        label: "Completed",
        value: stats?.completed || 0,
        icon: <CheckCircle className="w-8 h-8" />,
        colorClass: "from-green-500 to-green-600",
      },
    ],
    [stats]
  );

  const headers = ["Date", "Customer", "Mode", "Receiver", "Status", "Remarks", "Amount"];

  // ---------------------------
  // TABLE VIEW
  // ---------------------------
  const TableView = useMemo(
    () => (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader headers={headers} />
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">{p.customerName || "N/A"}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="capitalize">
                      {p.mode.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">{p.userName || "N/A"}</td>
                  <td className="px-6 py-4">
                    <Badge className={cn(
                      p.status === "completed" && "bg-green-100 text-green-800",
                      p.status === "failed" && "bg-red-100 text-red-800",
                      p.status === "pending" && "bg-amber-100 text-amber-800",
                      "capitalize"
                    )}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                    {p.remarks || "-"}
                  </td>
                  <td className="px-6 py-4 font-bold text-teal-600">
                    {defaultCurrency}{p.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
    [payments]
  );

  const CardView = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {payments.map((p) => (
          <Card key={p._id}>
            <CardHeader>
              <p className="text-xs text-gray-500">
                {new Date(p.createdAt).toLocaleDateString()}
              </p>
              <Badge className="capitalize">{p.status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-teal-600">
                {defaultCurrency}{p.amount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {p.customerName || "N/A"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
    [payments]
  );

  return (
    <>
      <GenericReportPage
        title="Payment Report"
        subtitle="Track all customer payments and collections"
        stats={statCards}
        loading={loading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        data={payments}
        totalItems={pagination.total || 0}
        totalPages={pagination.totalPages || 1}
        currentPage={filters.page}
        onPageChange={(p) => setFilter("page", p)}
        limit={filters.limit}
        onClearFilters={resetAllFilters}
        reportType="payment"
        exportFileName="Payment_Report"
        onExportDetailed={async () => await fetchAllReport(companyId)}
        customFilterBar={
          <ReportFilterActions
            count={filterCount}
            onClear={resetAllFilters}
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
  onApply={handleApplyFilters}
  onReset={resetAllFilters}
  companyId={companyId}

  showCustomerSelect   // ✅ dropdown customer
  showUser             // ✅ receiver / collected by
  showStatus
  showMode
  showDateRange

  localDateRange={localDateRange}
  setLocalDateRange={setLocalDateRange}
  applyDateRange={applyDateRange}
  resetDateRange={resetDateRange}
/>


    </>
  );
};

export default PaymentReportPage;
