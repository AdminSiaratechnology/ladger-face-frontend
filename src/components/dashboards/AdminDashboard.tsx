// src/components/dashboards/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import { useCompanyStore } from "../../../store/companyStore";
import api from "../../api/api";
import { KeyMetrics } from "./sections/KeyMetrics";
import { TopProductsSection } from "./sections/TopProductsSection";
import { ChartsSection } from "./sections/ChartsSection";
import { PerformanceCharts } from "./sections/PerformanceCharts";
import { SalesmanPerformance } from  "./sections/SalesmanPerformance";
import { SummaryStats } from "./sections/SummaryStats";
import { BottomRow } from "./sections/BottomRow";
import HeaderGradient from "../customComponents/HeaderGradint";
import { RefreshCw, Activity, Banknote, Users, TrendingUp } from "lucide-react";
import { Badge } from "../ui/badge";

export default function AdminDashboard() {
  const { defaultSelected } = useCompanyStore();
  const companyId = defaultSelected?._id;

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>({});
  const [salesmanPeriod, setSalesmanPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  const fetchCoreData = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const fromDate = firstDayOfMonth.toISOString().split('T')[0];
      const toDate = today.toISOString().split('T')[0];

      const [
        stateWiseRes,
        partyWiseRes,
        todayRes,
        monthlyRes,
        topCustomersRes,
        dateRangeRes,
      ] = await Promise.all([
        api.getStateWiseSales(companyId),
        api.getPartyWiseSales(companyId),
        api.getTodaySales(companyId),
        api.getMonthlyComparison(companyId),
        api.getTopCustomers(companyId),
        api.getDateRangeSales(companyId, fromDate, toDate),
      ]);

      setDashboardData({
        stateWise: stateWiseRes.data || [],
        partyWise: partyWiseRes.data || [],
        todayData: todayRes.data || {},
        monthlyComparison: monthlyRes.data || {},
        topCustomers: topCustomersRes.data || [],
        dateRangeData: dateRangeRes.data || {},
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoreData();
  }, [companyId]);

  const stats = [
    { title: "Today's Revenue", value: `₹${(dashboardData.todayData?.totalSales || 0).toLocaleString()}`, change: "+12.5%", icon: Banknote, description: `${dashboardData.todayData?.totalOrders || 0} orders today` },
    { title: "Monthly Revenue", value: `₹${(dashboardData.monthlyComparison?.thisMonth?.totalSales || 0).toLocaleString()}`, change: "+100%", icon: TrendingUp, description: `${dashboardData.monthlyComparison?.thisMonth?.totalOrders || 0} orders` },
    { title: "Total Customers", value: dashboardData.partyWise?.length.toString(), change: "+8.2%", icon: Users, description: `${dashboardData.topCustomers?.length} top performers` },
  ];

  const recentActivities = dashboardData.partyWise?.slice(0, 5).map((p: any, i: number) => ({
    id: i + 1,
    action: `New order from ${p.customer.customerName}`,
    user: p.customer.contactPerson,
    time: "2 min ago",
    type: "order",
    amount: `₹${p.totalSales.toLocaleString()}`,
  }));

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
        <HeaderGradient title="Admin Dashboard" subtitle="Welcome back!" />
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="w-3 h-3 mr-1" /> Live Data
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

      <KeyMetrics stats={stats} />
      <SummaryStats dateRangeData={dashboardData.dateRangeData} />
      <TopProductsSection companyId={companyId} />
      <ChartsSection companyId={companyId} />
      <PerformanceCharts
        salesByStateData={dashboardData.stateWise?.filter((s: any) => s._id).slice(0, 6).map((s: any) => ({
          name: s._id,
          sales: s.totalSales / 100000,
          orders: s.totalOrders,
        }))}
        monthlyComparisonData={[
          { name: "Last Month", sales: (dashboardData.monthlyComparison?.prevMonth?.totalSales || 0) / 100000, orders: dashboardData.monthlyComparison?.prevMonth?.totalOrders || 0 },
          { name: "This Month", sales: (dashboardData.monthlyComparison?.thisMonth?.totalSales || 0) / 100000, orders: dashboardData.monthlyComparison?.thisMonth?.totalOrders || 0 },
        ]}
      />
      <SalesmanPerformance companyId={companyId} period={salesmanPeriod} onPeriodChange={setSalesmanPeriod} />
      <BottomRow topCustomersData={dashboardData.topCustomers?.slice(0, 5).map((c: any) => ({
        name: c.customer.customerName.length > 12 ? c.customer.customerName.substring(0, 12) + '...' : c.customer.customerName,
        sales: c.totalSales / 100000,
        fullName: c.customer.customerName,
      }))} recentActivities={recentActivities} integrationStats={[]} />
    </div>
  );
}