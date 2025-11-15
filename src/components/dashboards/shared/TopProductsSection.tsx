import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Filter, Package } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PRODUCT_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
];

interface TopProduct {
  totalQuantity: number;
  totalSales: number;
  totalOrders: number;
  productId: string;
  product: {
    _id: string;
    ItemName: string;
    ItemCode: string;
    Group?: string;
  };
  rank: number;
}

interface TopProductsSectionProps {
  topProductsChartData: Array<{
    name: string;
    sales: number;
    fullName: string;
  }>;
  topProductsDisplayData: TopProduct[];
  topProductsPeriod: "day" | "week" | "month" | "year";
  periodLabels: Record<"day" | "week" | "month" | "year", string>;
  onPeriodChange: (period: "day" | "week" | "month" | "year") => void;
  topProductsLoading: boolean;
  title?: string;
}

export function TopProductsSection({
  topProductsChartData,
  topProductsDisplayData,
  topProductsPeriod,
  periodLabels,
  onPeriodChange,
  topProductsLoading,
  title = "Top Products",
}: TopProductsSectionProps) {
  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-white";
      case 2:
        return "bg-gray-400 text-white";
      case 3:
        return "bg-orange-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Package className="w-4 h-4" />;
      case 2:
        return <Package className="w-4 h-4" />;
      case 3:
        return <Package className="w-4 h-4" />;
      default:
        return <span className="text-xs font-bold">{rank}</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
            <CardDescription>Revenue by best-selling products</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={topProductsPeriod}
              onChange={(e) => onPeriodChange(e.target.value as any)}
              className="block w-full md:w-auto px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
              disabled={topProductsLoading}
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {topProductsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `₹${(Number(value) * 100000).toLocaleString()}`,
                    "Sales",
                  ]}
                />
                <Bar dataKey="sales" fill="#8884D8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle>Best Selling Products</CardTitle>
          <CardDescription>Top 5 products by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProductsDisplayData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No data available for this period.
              </div>
            ) : (
              topProductsDisplayData.map((product) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getRankBadgeColor(
                        product.rank
                      )}`}
                    >
                      {getRankIcon(product.rank)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className="font-medium text-sm truncate"
                          title={product.product.ItemName}
                        >
                          {product.product.ItemName}
                        </h4>
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs bg-blue-50"
                        >
                          {product.product.ItemCode}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-600">
                          {product.product.Group || "General"}
                        </p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-600">
                          Qty: {product.totalQuantity}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="font-medium text-sm whitespace-nowrap text-green-600">
                      ₹{(product.totalSales / 100000).toFixed(1)}L
                    </p>
                    <p className="text-xs text-gray-600 whitespace-nowrap">
                      {product.totalOrders} orders
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
