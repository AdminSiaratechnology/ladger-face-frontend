// src/components/dashboards/sections/SalesmanPerformance.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Filter } from "lucide-react";
import api from "../../../api/api";

type TimePeriod = "day" | "week" | "month" | "year";

interface SalesmanPerformanceProps {
  companyId: string;
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

export const SalesmanPerformance = ({
  companyId,
  period,
  onPeriodChange,
}: SalesmanPerformanceProps) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [response, setResponse] = useState<any>(null);

  const periodLabels: Record<TimePeriod, string> = {
    day: "Today",
    week: "This Week",
    month: "This Month",
    year: "This Year",
  };

  const fetchSalesmanData = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await api.getSalesmanWiseSales({ companyId, period });
      setData(res.data || []);
      setResponse(res);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesmanData();
  }, [companyId, period]);

  const performanceData = data.map((s: any) => ({
    name:
      `${s.salesman.firstName || ""} ${s.salesman.lastName || ""}`.trim() ||
      s.salesman.email.split("@")[0],
    email: s.salesman.email,
    sales: s.totalSales,
    orders: s.totalOrders,
    averageOrderValue: s.averageOrderValue,
    isActive: s.salesman.status === "active" ? true : false,
  }));

  return (
    <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Sales Team Performance</CardTitle>
          <CardDescription>
            Target achievement for {periodLabels[period]}
            {response?.dateRange && (
              <span className="text-xs ml-2 text-gray-500">
                ({new Date(response.dateRange.start).toLocaleDateString()} -{" "}
                {new Date(response.dateRange.end).toLocaleDateString()})
              </span>
            )}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value as TimePeriod)}
            disabled={loading}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : performanceData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Salesman
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Sales
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Avg Order
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performanceData.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="font-semibold text-blue-800 text-sm">
                            {s.name.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className="text-sm font-medium text-gray-900 truncate"
                            title={s.name}
                          >
                            {s.name}
                          </div>
                          <div
                            className="text-xs text-gray-500 truncate"
                            title={s.email}
                          >
                            {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-900">
                      <div className="font-medium">
                        ₹{(s.sales / 100000).toFixed(1)}L
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-900">
                      {s.orders}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-900">
                      ₹{Math.round(s.averageOrderValue || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Badge
                        variant={s.isActive ? "default" : "secondary"}
                        className={`text-xs ${
                          s.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {s.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
