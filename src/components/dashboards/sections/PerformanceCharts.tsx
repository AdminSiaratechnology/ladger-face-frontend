import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";

interface PerformanceChartsProps {
  salesByStateData: Array<{ name: string; sales: number; orders: number }>;
  monthlyComparisonData: Array<{ name: string; sales: number; orders: number }>;
}

export const PerformanceCharts = ({
  salesByStateData,
  monthlyComparisonData,
}: PerformanceChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle>Top States Performance</CardTitle>
          <CardDescription>Revenue by geographic regions</CardDescription>
        </CardHeader>
        <CardContent>
          {salesByStateData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByStateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [
                    `₹${(Number(value) * 100000).toLocaleString()}`,
                    "Sales",
                  ]}
                  contentStyle={{
                    fontSize: "12px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle>Monthly Comparison</CardTitle>
          <CardDescription>Current vs previous month</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyComparisonData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "sales")
                      return [
                        `₹${(Number(value) * 100000).toLocaleString()}`,
                        "Sales",
                      ];
                    return [value, "Orders"];
                  }}
                  contentStyle={{
                    fontSize: "12px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="sales"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#FF8042"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
