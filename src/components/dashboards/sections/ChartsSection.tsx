import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import api from "../../../api/api";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export const ChartsSection = ({ companyId }: { companyId: string }) => {
  const [salesTrend, setSalesTrend] = useState<
    Array<{ name: string; sales: number }>
  >([]);
  const [regionData, setRegionData] = useState<any[]>([]);

  const fetchData = async () => {
    if (!companyId) return;
    try {
      const [trendRes, stateRes] = await Promise.all([
        api.getSalesTrend(companyId),
        api.getStateWiseSales(companyId),
      ]);

      const trend = (trendRes.data || []).map((d: any) => ({
        name: d.name,
        sales: Number(d.sales.toFixed(2)),
      }));
      setSalesTrend(trend);

      const region = (stateRes.data || [])
        .filter((s: any) => s._id)
        .slice(0, 6)
        .map((s: any, i: number) => ({
          name: s._id,
          value: s.totalSales / 100000,
          color: COLORS[i % COLORS.length],
        }));
      setRegionData(region);
    } catch (error) {
      console.error("Charts error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
        <CardHeader className="pb-3 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base md:text-lg font-semibold text-gray-900">
                Sales Trend
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-gray-600 mt-0.5">
                Last 12 months
              </CardDescription>
            </div>
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
          {salesTrend.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
              No sales data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={salesTrend}
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
                  formatter={(v) => [
                    `₹${(Number(v) * 100000).toLocaleString("en-IN")}`,
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.12}
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
        <CardHeader className="pb-3 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base md:text-lg font-semibold text-gray-900">
                Regional Sales
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-gray-600 mt-0.5">
                Distribution by states
              </CardDescription>
            </div>
            <PieChartIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
          {regionData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
              No regional data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={(props) => {
                    const { cx, cy, midAngle, outerRadius, percent, name } =
                      props;
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius * 1.2;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#374151"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        className="text-[10px] md:text-xs font-medium"
                      >
                        {name} {(percent * 100).toFixed(0)}%
                      </text>
                    );
                  }}
                >
                  {regionData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [
                    `₹${(Number(v) * 100000).toLocaleString("en-IN")}`,
                    "Sales",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
