import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useOrderReportStore } from "../../../store/orderReportStore";
import { useCompanyStore } from "../../../store/companyStore";
import { useUserManagementStore } from "../../../store/userManagementStore";

import GenericReportPage from "../customComponents/GenericReportPage";
import OrderReportDetailsModal from "../customComponents/OrderReportDetailsModal";
import OrderReportFilters from "../customComponents/OrderReportFilters";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, CheckCircle, Clock, DollarSign, Eye } from "lucide-react";
import { cn, exportToExcel } from "@/lib/utils";
import api from "../../api/api"
import TableHeader from "../customComponents/CustomTableHeader";


const OrderReportPage = () => {
  const { defaultSelected } = useCompanyStore();
  const { users } = useUserManagementStore();

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
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
    fetchAllReport
  } = useOrderReportStore();
  console.log(orders,"datallll")

  const companyId = defaultSelected?._id;
  const today = new Date();
const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  // Local UI state for instant feedback
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [localDateRange, setLocalDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({
    from: filters.startDate ? new Date(filters.startDate) : firstDayLastMonth,
    to: filters.endDate ? new Date(filters.endDate) : today,
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        setFilter("search", localSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, setFilter]);

  const applyDateRange = useCallback(() => {
    setFilter("startDate", localDateRange.from ? localDateRange.from.toISOString() : undefined);
    setFilter("endDate", localDateRange.to ? localDateRange.to.toISOString() : undefined);
    setFilter("page", 1);
  }, [localDateRange.from, localDateRange.to, setFilter]);

  const handleFilterChange = useCallback(
    (key: any, value: any) => {
      setFilter(key, value);
      if (key !== "page") setFilter("page", 1);
    },
    [setFilter]
  );

  const resetAllFilters = useCallback(() => {
    setLocalSearch("");
    setLocalDateRange({ from: undefined, to: undefined });
    resetFilters();
  }, [resetFilters]);

  // Fetch on filter/company change
  useEffect(() => {
    if (companyId) {
      fetchReport(companyId);
    }
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

  const handleViewOrder = useCallback((order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }, []);

  const statCards = useMemo(
    () => [
      {
        label: "Total Revenue",
        value: `₹${stats?.totalRevenue?.toLocaleString() || "0"}`,
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
  const headers=["Date","Code","Customer","Salesman","Amount","Status","Action"]

  const TableView = useMemo(
    () => (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader headers={headers} />
          
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                   <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-sm">
                    {order.orderCode}
                    <div className="sm:hidden text-xs text-gray-500 mt-1">{order.customer?.customerName}</div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-700">
                    {order.customer?.customerName || "N/A"}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-600">
                    {order.salesman?.name || "System"}
                  </td>
                 
                
                  <td className="px-6 py-4">
                    <Badge
                      className={cn(
                        "capitalize text-xs",
                        order.status === "approved" && "bg-green-100 text-green-800 hover:bg-green-100",
                        order.status === "cancelled" && "bg-red-100 text-red-800 hover:bg-red-100",
                        order.status === "pending" && "bg-amber-100 text-amber-800 hover:bg-amber-100"
                      )}
                    >
                      {order.status}
                    </Badge>
                  </td>
                    <td className="px-6 py-4 font-bold text-teal-600 text-sm">
                    ₹{order.grandTotal?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition"
                      aria-label={`View details for order ${order.orderCode}`}
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

  const CardView = useMemo(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map((order) => (
          <Card key={order._id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold">#{order.orderCode}</CardTitle>
                <Badge
                  className={cn(
                    "capitalize text-xs",
                    order.status === "approved" && "bg-green-600 text-white hover:bg-green-600",
                    order.status === "cancelled" && "bg-red-600 text-white hover:bg-red-600",
                    order.status === "pending" && "bg-amber-600 text-white hover:bg-amber-600"
                  )}
                >
                  {order.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-sm truncate">{order.customer?.customerName}</p>
              <p className="text-xs text-gray-500 mb-4">{order.salesman?.name || "System"}</p>
              <div className="flex justify-between items-end">
                <div className="text-lg font-bold text-teal-600">₹{order.grandTotal?.toLocaleString()}</div>
                <button onClick={() => handleViewOrder(order)} className="text-blue-600 text-xs font-medium hover:underline">
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
  customFilterBar={  <OrderReportFilters
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
  <OrderReportDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedOrder} />
</GenericReportPage>
  );
};

export default OrderReportPage;

  