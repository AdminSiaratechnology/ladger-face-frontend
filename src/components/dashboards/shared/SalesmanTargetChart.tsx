// src/components/dashboards/shared/SalesmanTargetChart.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SalesmanTargetChartProps {
  target: number;
  achieved: number;
  period: string;
}

export function SalesmanTargetChart({
  target,
  achieved,
  period,
}: SalesmanTargetChartProps) {
  const percent = target ? Math.round((achieved / target) * 100) : 0;
  const data = [
    { name: "Achieved", value: achieved, fill: "#10B981" },
    {
      name: "Remaining",
      value: Math.max(target - achieved, 0),
      fill: "#E5E7EB",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Target vs Achieved ({period})</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
        <p className="mt-2 text-2xl font-bold">{percent}%</p>
        <p className="text-sm text-gray-600">
          ₹{achieved.toLocaleString()} / ₹{target.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
