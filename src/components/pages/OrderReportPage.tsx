// pages/reports/OrderReportPage.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useOrderReportStore } from "../../../store/orderReportStore";
import { useCompanyStore } from "../../../store/companyStore";
import { useUserManagementStore } from "../../../store/userManagementStore";

import GenericReportPage from "../customComponents/GenericReportPage";
import ReportFilterActions from "../customComponents/ReportFilterActions";
import UniversalReportFilter from "../customComponents/UniversalReportFilter";
import OrderReportDetailsModal from "../customComponents/OrderReportDetailsModal";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import TableHeader from "../customComponents/CustomTableHeader";

const OrderReportPage = () => {
  const { defaultSelected } = useCompanyStore();
  const { users } = useUserManagementStore();
  const companyId = defaultSelected?._id;

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [openFilter, setOpenFilter] = useState(false);
  const [filterCount, setFilterCount] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: orders,
    stats,
    loading,
    filters,
    pagination,
    setFilter,
    fetchReport,
    resetFilters,
    fetchAllReport,
  } = useOrderReportStore();

  const today = new Date();
  const firstDayLastMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  );

  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [localDateRange, setLocalDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({
    from: filters.startDate ? new Date(filters.startDate) : firstDayLastMonth,
    to: filters.endDate ? new Date(filters.endDate) : today,
  });

  // ===============================
  // SEARCH (DEBOUNCE)
  // ===============================
  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== filters.search) {
        setFilter("search", localSearch);
        setFilter("page", 1);
      }
    }, 500);

    return () => clearTimeout(t);
  }, [localSearch, filters.search, setFilter]);

  // ===============================
  // DATE RANGE
  // ===============================
  const applyDateRange = useCallback(() => {
    setFilter(
      "startDate",
      localDateRange.from ? localDateRange.from.toISOString() : undefined
    );
    setFilter(
      "endDate",
      localDateRange.to ? localDateRange.to.toISOString() : undefined
    );
    setFilter("page", 1);
  }, [localDateRange, setFilter]);

  const resetDateRange = useCallback(() => {
    setLocalDateRange({});
    setFilter("startDate", undefined);
    setFilter("endDate", undefined);
  }, [setFilter]);

  // ===============================
  // APPLY FILTERS (MODAL)
  // ===============================
const handleApplyFilters = (updatedFilters: any) => {
  Object.keys(updatedFilters).forEach((k) => {
    setFilter(k, updatedFilters[k]);
  });

  applyDateRange();
  setFilter("page", 1);
  setOpenFilter(false);
};


  // ===============================
  // CLEAR ALL (POS SAME BEHAVIOR)
  // ===============================
  const resetAllFilters = useCallback(() => {
    setLocalSearch("");
    setLocalDateRange({});
    resetFilters();
    setFilterCount(0);
    setOpenFilter(false);
  }, [resetFilters]);

  // ===============================
  // FILTER COUNT (POS LOGIC)
  // ===============================
useEffect(() => {
  let count = 0;

  if (filters.search) count++;

  // ✅ status counted ONLY if not "all"
  if (filters.status && filters.status !== "all") count++;

  // ✅ salesman / user counted ONLY if not "all"
  if (filters.userId && filters.userId !== "all") count++;
  if (filters.userId && filters.userId !== "all") count++;

  // ✅ date counted ONLY if both present
  if (filters.startDate && filters.endDate) count++;


  setFilterCount(count);
}, [filters]);

  // ===============================
  // FETCH REPORT
  // ===============================
  useEffect(() => {
    if (!companyId) return;

    fetchReport(companyId);
    console.log(filters,"filtersearch")
  }, [
    companyId,
    filters.page,
    filters.limit,
    filters.search,
    filters.status,
    filters.userId,
    filters.startDate,
    filters.endDate,
    fetchReport,
  ]);

  // ===============================
  // VIEW ORDER
  // ===============================
  const handleViewOrder = useCallback((order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }, []);

  // ===============================
  // STATS
  // ===============================
  const statCards = useMemo(
    () => [
      {
        label: "Total Revenue",
        value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
        icon: <DollarSign className="w-8 h-8" />,
        colorClass: "from-teal-500 to-teal-600",
      },
      {
        label: "Total Orders",
        value: stats?.totalOrders || 0,
        icon: <ShoppingCart className="w-8 h-8" />,
        colorClass: "from-blue-500 to-blue-600",
      },
      {
        label: "Pending",
        value: stats?.pendingOrders || 0,
        icon: <Clock className="w-8 h-8" />,
        colorClass: "from-orange-500 to-orange-600",
      },
      {
        label: "Approved",
        value: stats?.approvedOrders || 0,
        icon: <CheckCircle className="w-8 h-8" />,
        colorClass: "from-green-500 to-green-600",
      },
    ],
    [stats]
  );

  const headers = [
    "Date",
    "Code",
    "Customer",
    "Salesman",
    "Status",
    "Amount",
    "Action",
  ];

  // ===============================
  // TABLE VIEW
  // ===============================
  const TableView = useMemo(
    () => (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader headers={headers} />
            <tbody className="divide-y divide-gray-100">
              {orders.map((o: any) => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-sm">
                    {o.orderCode}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {o.customer?.customerName || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {o.salesman?.name || "System"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={cn(
                        o.status === "approved" &&
                          "bg-green-100 text-green-800",
                        o.status === "cancelled" &&
                          "bg-red-100 text-red-800",
                        o.status === "pending" &&
                          "bg-amber-100 text-amber-800",
                        "capitalize"
                      )}
                    >
                      {o.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-bold text-teal-600">
                    ₹{o.grandTotal?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleViewOrder(o)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
    [orders, handleViewOrder]
  );

  // ===============================
  // CARD VIEW
  // ===============================
  const CardView = useMemo(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {orders.map((o: any) => (
          <Card key={o._id}>
            <CardHeader>
              <CardTitle>#{o.orderCode}</CardTitle>
              <Badge className="capitalize">{o.status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{o.customer?.customerName}</p>
              <p className="text-xs text-gray-500">
                {o.salesman?.name || "System"}
              </p>
              <div className="mt-3 flex justify-between items-center">
                <span className="font-bold text-teal-600">
                  ₹{o.grandTotal?.toLocaleString()}
                </span>
                <button
                  onClick={() => handleViewOrder(o)}
                  className="text-blue-600 text-xs hover:underline"
                >
                  View →
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
    [orders, handleViewOrder]
  );

  return (
    <>
      <GenericReportPage
        title="Order Report"
        subtitle="View and manage all customer orders"
        stats={statCards}
        loading={loading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        data={orders}
        totalItems={pagination.total || 0}
        totalPages={pagination.totalPages || 1}
        currentPage={filters.page}
        onPageChange={(p) => setFilter("page", p)}
        limit={filters.limit}
        onClearFilters={resetAllFilters}
        reportType="order"
        exportFileName="Order_Report"
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
        <OrderReportDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={selectedOrder}
        />
      </GenericReportPage>

      {/* FILTER MODAL */}
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
  onReset={resetAllFilters}
  companyId={companyId}

  showSearch          // ✅ SEARCH ADD
  showSalesman
  showStatus
  showDateRange

  localDateRange={localDateRange}
  setLocalDateRange={setLocalDateRange}
  applyDateRange={applyDateRange}
  resetDateRange={resetDateRange}
/>

    </>
  );
};

export default OrderReportPage;
