import React, { useEffect, useState } from "react";
import { useCompanyStore } from "../../../store/companyStore";
import { useAuthStore } from "../../../store/authStore";
import api from "../../api/api";
import { SalesSummary } from "./sections/SalesSummary";
import { TopProductsSection } from "./sections/TopProductsSection";
import { CustomerQuickOrder } from "./sections/CustomerQuickOrder";
import { CustomerOrderHistory } from "./sections/CustomerOrderHistory";
import HeaderGradient from "../customComponents/HeaderGradint";
import { RefreshCw, Activity } from "lucide-react";
import { Badge } from "../ui/badge";

export type TimePeriod = "day" | "week" | "month" | "year";

export default function CustomerDashboard() {
  const { defaultSelected } = useCompanyStore();
  const { user } = useAuthStore();
  const companyId = defaultSelected?._id;
  const customerId = user?.customerId;

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>("month");
  const [orders, setOrders] = useState<any[]>([]);
  const [salesStats, setSalesStats] = useState({
    todaySales: 0,
    lastMonthSales: 0,
    totalSales: 0,
  });

  const fetchCoreData = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        api.getMyOrders(companyId),
        api.getCustomerSalesStats({ companyId }),
      ]);
      setOrders(ordersRes.orders || []);
      setSalesStats(
        statsRes.data || { todaySales: 0, lastMonthSales: 0, totalSales: 0 }
      );
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoreData();
  }, [companyId, customerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <HeaderGradient
          title="Customer Dashboard"
          subtitle="Manage your orders and purchases."
        />
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <Activity className="w-3 h-3 mr-1" /> Live
          </Badge>
          <button
            onClick={fetchCoreData}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <SalesSummary
        todaySales={salesStats.todaySales}
        lastMonthSales={salesStats.lastMonthSales}
        totalSales={salesStats.totalSales}
      />

      <TopProductsSection
        companyId={companyId}
        period={period}
        onPeriodChange={setPeriod}
        title="My Top Products"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerQuickOrder companyId={companyId} customerId={customerId} />
        <CustomerOrderHistory orders={orders} />
      </div>
    </div>
  );
}
