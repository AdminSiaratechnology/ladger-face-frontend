// src/components/dashboards/AdminDashboard.tsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useCompanyStore } from "../../../store/companyStore";
import api from "../../api/api";
import { KeyMetrics } from "./sections/KeyMetrics";
import { TopProductsSection } from "./sections/TopProductsSection";
import { ChartsSection } from "./sections/ChartsSection";
import { PerformanceCharts } from "./sections/PerformanceCharts";
import { SalesmanPerformance } from "./sections/SalesmanPerformance";
import { SummaryStats } from "./sections/SummaryStats";
import { BottomRow } from "./sections/BottomRow";
import HeaderGradient from "../customComponents/HeaderGradint";
import {
  RefreshCw,
  Activity,
  Banknote,
  Users,
  TrendingUp,
  Building,
  AlertCircle,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Assuming you have shadcn Alert

// 1. Define Initial State to prevent "undefined" access errors
const INITIAL_DASHBOARD_DATA = {
  stateWise: [],
  partyWise: [],
  todayData: { totalSales: 0, totalOrders: 0 },
  monthlyComparison: {
    thisMonth: { totalSales: 0, totalOrders: 0 },
    prevMonth: { totalSales: 0, totalOrders: 0 },
  },
  topCustomers: [],
  dateRangeData: {},
};

export default function AdminDashboard() {
  const { defaultSelected } = useCompanyStore();
  const companyId = defaultSelected?._id;

  const [loading, setLoading] = useState(false); // Start false, controlled by useEffect
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(INITIAL_DASHBOARD_DATA);
  const [salesmanPeriod, setSalesmanPeriod] = useState<"day" | "week" | "month" | "year">("month");

  // 2. Wrap fetch in useCallback to be safe for dependency arrays
  const fetchCoreData = useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const fromDate = firstDayOfMonth.toISOString().split("T")[0];
      const toDate = today.toISOString().split("T")[0];

      // 3. Use allSettled: If one API fails, the others still render 
      const results = await Promise.allSettled([
        api.getStateWiseSales(companyId).catch(() => ({ data: [] })),
        api.getPartyWiseSales(companyId).catch(() => ({ data: [] })),
        api.getTodaySales(companyId).catch(() => ({ data: {} })),
        api.getMonthlyComparison(companyId).catch(() => ({ data: {} })),
        api.getTopCustomers(companyId).catch(() => ({ data: [] })),
        api.getDateRangeSales(companyId, fromDate, toDate).catch(() => ({ data: {} })),
      ]);

      // Helper to safely extract data from settled promise
      const getVal = (res: any, fallback: any) => 
        res.status === 'fulfilled' && res.value?.data ? res.value.data : fallback;

      setDashboardData({
        stateWise: getVal(results[0], []),
        partyWise: getVal(results[1], []),
        todayData: getVal(results[2], { totalSales: 0, totalOrders: 0 }),
        monthlyComparison: getVal(results[3], INITIAL_DASHBOARD_DATA.monthlyComparison),
        topCustomers: getVal(results[4], []),
        dateRangeData: getVal(results[5], {}),
      });

    } catch (error) {
      console.error("Critical Dashboard Error:", error);
      setError("Some data failed to load. The dashboard may be incomplete.");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchCoreData();
    }
  }, [fetchCoreData, companyId]);

  const safeStats = useMemo(() => {
    const today = dashboardData?.todayData || {};
    const month = dashboardData?.monthlyComparison?.thisMonth || {};
    const parties = Array.isArray(dashboardData?.partyWise) ? dashboardData.partyWise : [];
    const topCust = Array.isArray(dashboardData?.topCustomers) ? dashboardData.topCustomers : [];

    return [
      {
        title: "Today's Revenue",
        value: `₹${(Number(today.totalSales) || 0).toLocaleString()}`,
        change: "+12.5%", // ideally calculate this dynamically if data exists
        icon: Banknote,
        description: `${Number(today.totalOrders) || 0} orders today`,
      },
      {
        title: "Monthly Revenue",
        value: `₹${(Number(month.totalSales) || 0).toLocaleString()}`,
        change: "+100%",
        icon: TrendingUp,
        description: `${Number(month.totalOrders) || 0} orders`,
      },
      {
        title: "Total Customers",
        value: parties.length.toString(),
        change: "+8.2%",
        icon: Users,
        description: `${topCust.length} top performers`,
      },
    ];
  }, [dashboardData]);

  const safeRecentActivities = useMemo(() => {
    if (!Array.isArray(dashboardData?.partyWise)) return [];
    
    return dashboardData.partyWise.slice(0, 5).map((p: any, i: number) => ({
      id: i + 1,
      action: p?.customer?.customerName ? `New order from ${p.customer.customerName}` : "New Order",
      user: p?.customer?.contactPerson || "Unknown User",
      time: "2 min ago",
      type: "order",
      amount: `₹${(Number(p?.totalSales) || 0).toLocaleString()}`,
    }));
  }, [dashboardData]);

  const safeChartData = useMemo(() => {
    const stateWise = Array.isArray(dashboardData?.stateWise) ? dashboardData.stateWise : [];
    
    return stateWise
      .filter((s: any) => s && s._id) // Filter out nulls or missing IDs
      .slice(0, 6)
      .map((s: any) => ({
        name: s._id || "Unknown",
        sales: (Number(s.totalSales) || 0) / 100000,
        orders: Number(s.totalOrders) || 0,
      }));
  }, [dashboardData]);

  const safeMonthlyData = useMemo(() => {
    const prev = dashboardData?.monthlyComparison?.prevMonth || {};
    const curr = dashboardData?.monthlyComparison?.thisMonth || {};

    return [
      {
        name: "Last Month",
        sales: (Number(prev.totalSales) || 0) / 100000,
        orders: Number(prev.totalOrders) || 0,
      },
      {
        name: "This Month",
        sales: (Number(curr.totalSales) || 0) / 100000,
        orders: Number(curr.totalOrders) || 0,
      },
    ];
  }, [dashboardData]);

  const safeTopCustomers = useMemo(() => {
    if (!Array.isArray(dashboardData?.topCustomers)) return [];

    return dashboardData.topCustomers.slice(0, 5).map((c: any) => {
      const name = c?.customer?.customerName || "Unknown Customer";
      return {
        name: name.length > 12 ? name.substring(0, 12) + "..." : name,
        sales: (Number(c?.totalSales) || 0) / 100000,
        fullName: name,
      };
    });
  }, [dashboardData]);



  if (!defaultSelected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Company Selected</h2>
          <p className="text-gray-600 mb-6">
            Please add or select a company to view the dashboard and access analytics.
          </p>
        </div>
      </div>
    );
  }


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
          {error && (
             <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200" title={error}>
               <AlertCircle className="w-3 h-3 mr-1" /> Partial Data
             </Badge>
          )}
         
          <button
            onClick={fetchCoreData}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Issue</AlertTitle>
          <AlertDescription>
            {error}. Click refresh to try again.
          </AlertDescription>
        </Alert>
      )}

      
      <KeyMetrics stats={safeStats} />
      
      <SummaryStats dateRangeData={dashboardData?.dateRangeData || {}} />
      
      <TopProductsSection companyId={companyId} />
      
      <ChartsSection companyId={companyId} />
      
      <PerformanceCharts
        salesByStateData={safeChartData}
        monthlyComparisonData={safeMonthlyData}
      />
      
      <SalesmanPerformance
        companyId={companyId}
        period={salesmanPeriod}
        onPeriodChange={setSalesmanPeriod}
      />
      
      <BottomRow
        topCustomersData={safeTopCustomers}
        recentActivities={safeRecentActivities}
        integrationStats={[]}
      />
    </div>
  );
}