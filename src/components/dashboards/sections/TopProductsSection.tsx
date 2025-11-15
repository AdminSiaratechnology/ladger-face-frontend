// src/components/dashboards/sections/TopProductsSection.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Filter, TrendingUp, Package as PackageIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../../api/api";

const PRODUCT_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
];

export const TopProductsSection = ({ companyId }: { companyId: string }) => {
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">(
    "month"
  );
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);

  const periodLabels: Record<typeof period, string> = {
    day: "Today",
    week: "This Week",
    month: "This Month",
    year: "This Year",
  };

  const fetchTopProducts = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await api.getTopProducts(companyId, period);
      const products = res.data || [];

      const chart = products.slice(0, 6).map((p: any, i: number) => ({
        name:
          p.product.ItemName.length > 10
            ? p.product.ItemName.substring(0, 10) + "..."
            : p.product.ItemName,
        sales: p.totalSales / 100000,
        fullName: p.product.ItemName,
        color: PRODUCT_COLORS[i % PRODUCT_COLORS.length],
      }));

      const display = products.slice(0, 5).map((p: any, i: number) => ({
        ...p,
        rank: i + 1,
        color: PRODUCT_COLORS[i % PRODUCT_COLORS.length],
      }));

      setChartData(chart);
      setDisplayData(display);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopProducts();
  }, [companyId, period]);

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-white";
      case 2:
        return "bg-gray-400 text-white";
      case 3:
        return "bg-orange-600 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrendingUp className="w-3.5 h-3.5" />;
      case 2:
        return <PackageIcon className="w-3.5 h-3.5" />;
      case 3:
        return <PackageIcon className="w-3.5 h-3.5" />;
      default:
        return <span className="text-xs font-bold">{rank}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            disabled={loading}
            className="text-sm px-2.5 py-1.5 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">
            Revenue by Product
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Top performers in {periodLabels[period]}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
              No sales data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => `₹${(Number(v) * 100000).toLocaleString()}`}
                />
                <Bar dataKey="sales" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Top 5 Products</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            By revenue and quantity
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
          {displayData.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              No products sold
            </div>
          ) : (
            <div className="space-y-3">
              {displayData.map((p: any) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200/70 hover:bg-gray-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${getRankBadgeColor(
                        p.rank
                      )}`}
                    >
                      {getRankIcon(p.rank)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4
                          className="font-medium text-sm truncate max-w-[140px] sm:max-w-none"
                          title={p.product.ItemName}
                        >
                          {p.product.ItemName}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-5 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {p.product.ItemCode}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <span className="truncate max-w-[100px]">
                          {p.product.Group || "General"}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>Qty: {p.totalQuantity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="font-semibold text-sm text-teal-700 whitespace-nowrap">
                      ₹{(p.totalSales / 100000).toFixed(1)}L
                    </p>
                    <p className="text-xs text-gray-600">
                      {p.totalOrders} {p.totalOrders === 1 ? "order" : "orders"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
