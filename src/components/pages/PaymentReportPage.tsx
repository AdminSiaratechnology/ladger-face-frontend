// pages/reports/PaymentReportPage.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { usePaymentReportStore } from "../../../store/PaymentReportStore";
import { useCompanyStore } from "../../../store/companyStore";
import { useUserManagementStore } from "../../../store/userManagementStore";
import GenericReportPage from "../customComponents/GenericReportPage";
import PaymentReportFilters from "../customComponents/PaymentReportFilters";
import { Badge } from "@/components/ui/badge";

import { DollarSign, Clock, CheckCircle, XCircle, CreditCard, FileText } from "lucide-react";
import { cn, exportToExcel } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "../ui/card";
import TableHeader from "../customComponents/CustomTableHeader";

const PaymentReportPage = () => {
  const { defaultSelected } = useCompanyStore();
  const { users } = useUserManagementStore();
  const companyId = defaultSelected?._id;

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) setFilter("search", localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, setFilter]);

  const applyDateRange = useCallback(() => {
    setFilter("startDate", localDateRange.from?.toISOString());
    setFilter("endDate", localDateRange.to?.toISOString());
    setFilter("page", 1);
  }, [localDateRange, setFilter]);

//   const handleFilterChange = useCallback(
//   (key: keyof typeof filters, value: any) => {
//     setFilter(key, value);

//     // Only reset page to 1 when it's NOT a page change
//     if (key !== "page") {
//       setFilter("page", 1);
//     }
//   },
//   [setFilter]
// );

const handleFilterChange = useCallback(
  (key: keyof typeof filters, value: any) => {
    setFilter(key, value);
    if (key !== "page") {
      setFilter("page", 1); // Only reset when NOT changing page
    }
  },
  [setFilter]
);

  const resetAllFilters = useCallback(() => {
    setLocalSearch("");
    setLocalDateRange({});
    resetFilters();
  }, [resetFilters]);

//   useEffect(() => {
//     if (companyId) fetchReport(companyId);
//   }, [companyId, filters, fetchReport]);

// PaymentReportPage.tsx — ONLY CHANGE THIS useEffect

useEffect(() => {
  if (!companyId) return;

  // Only re-fetch when these values actually change
  const deps = [
    companyId,
    filters.page,
    filters.limit,
    filters.search,
    filters.status,
    filters.mode,
    filters.userId,
    filters.startDate,
    filters.endDate,
  ];

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

  const statCards = useMemo(() => [
    { label: "Total Amount", value: `₹${stats?.totalAmount?.toLocaleString() || 0}`, icon: <DollarSign className="w-8 h-8" />, colorClass: "from-teal-500 to-teal-600" },
    { label: "Total Payments", value: stats?.totalPayments || 0, icon: <CreditCard className="w-8 h-8" />, colorClass: "from-blue-500 to-blue-600" },
    { label: "Pending", value: stats?.pending || 0, icon: <Clock className="w-8 h-8" />, colorClass: "from-orange-500 to-orange-600" },
    { label: "Completed", value: stats?.completed || 0, icon: <CheckCircle className="w-8 h-8" />, colorClass: "from-green-500 to-green-600" },
  ], [stats]);
  const headers=["Date","Customer","Mode","Reciver","Status","Remarks","Amount"]

  const TableView = useMemo(() => (
 <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <TableHeader headers={headers}/>
      
        <tbody className="divide-y divide-gray-100">
          {payments.map((p) => (
            <tr key={p._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-sm">{p?.customerName || "N/A"}</td>
              <td className="px-6 py-4">
                <Badge variant="outline" className="capitalize">{p.mode.replace("_", " ")}</Badge>
              </td>
              <td className="px-6 py-4 text-sm">{p?.userName || "N/A"}</td>
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
              <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{p.remarks || "-"}</td>
                    <td className="px-6 py-4 font-bold text-teal-600">₹{p.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  ), [payments]);
  // Add this inside your PaymentReportPage component (replace the old return)

const CardView = useMemo(
  () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {payments.map((payment) => {
        const statusColors = {
          completed: "bg-green-100 text-green-800 border-green-200",
          failed: "bg-red-100 text-red-800 border-red-200",
          pending: "bg-amber-100 text-amber-800 border-amber-200",
          initiated: "bg-blue-100 text-blue-800 border-blue-200",
        };

        const modeIcons = {
          cash: "Cash",
          upi: "UPI",
          bank_transfer: "Bank Transfer",
          cheque: "Cheque",
        };

        return (
          <Card
            key={payment._id}
            className="hover:shadow-xl transition-all duration-300 border border-gray-200 rounded-xl overflow-hidden"
          >
            <CardHeader className="pb-3 bg-gradient-to-r from-teal-50 to-blue-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "capitalize text-xs font-semibold px-3 py-1 border",
                    statusColors[payment.status] || "bg-gray-100 text-gray-800"
                  )}
                >
                  {payment.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {/* Amount */}
              <div className="mb-4">
                <p className="text-2xl font-bold text-teal-600">
                  ₹{payment.amount.toLocaleString("en-IN")}
                </p>
              </div>

              {/* Customer */}
              <div className="mb-3">
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-medium text-gray-900 truncate">
                  {payment.customerName || "N/A"}
                </p>
              </div>

              {/* Collected By */}
              <div className="mb-3">
                <p className="text-xs text-gray-500">Collected By</p>
                <p className="font-medium text-gray-900 truncate">
                  {payment.userName || "System"}
                </p>
              </div>

              {/* Payment Mode */}
              <div className="mb-4">
                <p className="text-xs text-gray-500">Mode</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="font-medium capitalize">
                    {modeIcons[payment.mode] || payment.mode.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Remarks */}
              {payment.remarks && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500">Remarks</p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {payment.remarks}
                  </p>
                </div>
              )}

              {/* Documents */}
              {payment.documents?.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {payment.documents.slice(0, 2).map((doc, i) => (
                    <a
                      key={i}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      Doc {i + 1}
                    </a>
                  ))}
                  {payment.documents.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{payment.documents.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  ),
  [payments]
);

  return (
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
  customFilterBar={ <PaymentReportFilters
          users={users}
          filters={filters}
          localSearch={localSearch}
          setLocalSearch={setLocalSearch}
          localDateRange={localDateRange}
          setLocalDateRange={setLocalDateRange}
          handleFilterChange={handleFilterChange}
          applyDateRange={applyDateRange}
          resetAllFilters={resetAllFilters}
        />}
>
  {viewMode === "table" ? TableView : CardView}
</GenericReportPage>
  );
};

export default PaymentReportPage;


 