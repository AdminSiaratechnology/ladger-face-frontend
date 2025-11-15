// src/components/dashboards/shared/SalesSummary.tsx
import React from "react";
import { Card } from "../../ui/card";
import { Banknote, TrendingUp, DollarSign } from "lucide-react";

interface SalesSummaryProps {
  todaySales: number;
  lastMonthSales: number;
  totalSales: number;
  role: "Salesman" | "Customer";
  todayChange?: string;
  lastMonthChange?: string;
  totalChange?: string;
}

const buildStats = (props: SalesSummaryProps) => {
  const {
    todaySales,
    lastMonthSales,
    totalSales,
    role,
    todayChange,
    lastMonthChange,
    totalChange,
  } = props;
  const isSalesman = role === "Salesman";

  return [
    {
      title: "Today",
      value: `₹${todaySales.toLocaleString("en-IN")}`,
      change: todayChange,
      sub: isSalesman ? "Sales" : "Purchases",
      Icon: Banknote,
    },
    {
      title: "Last Month",
      value: `₹${lastMonthSales.toLocaleString("en-IN")}`,
      change: lastMonthChange,
      sub: "Total",
      Icon: TrendingUp,
    },
    {
      title: "All Time",
      value: `₹${totalSales.toLocaleString("en-IN")}`,
      change: totalChange ?? "+ Lifetime",
      sub: isSalesman ? "Sales" : "Spent",
      Icon: DollarSign,
    },
  ] as const;
};

const gradients = [
  "bg-gradient-to-r from-teal-500 to-teal-600",
  "bg-gradient-to-r from-blue-500 to-blue-600",
  "bg-gradient-to-r from-purple-500 to-purple-600",
] as const;

export function SalesSummary(props: SalesSummaryProps) {
  const stats = buildStats(props);

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
      <div className="flex gap-3 min-w-[640px] sm:min-w-0 sm:grid sm:grid-cols-3">
        {stats.map(({ title, value, change, sub, Icon }, idx) => {
          const isPositive = change && !change.startsWith("-");

          return (
            <Card
              key={idx}
              className={`
                ${gradients[idx]}
                relative overflow-hidden
                flex-shrink-0 w-48 sm:w-auto
                p-3 rounded-lg text-white
                shadow-md hover:shadow-lg
                transition-all duration-300
                group
              `}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

              <div className="relative z-10 flex items-center justify-between mb-1.5">
                <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-md">
                  <Icon className="w-4 h-4" />
                </div>
                {change && (
                  <span
                    className={`text-[10px] font-bold ${
                      isPositive ? "text-green-200" : "text-red-200"
                    }`}
                  >
                    {change}
                  </span>
                )}
              </div>

              <div className="relative z-10">
                <p className="text-xs opacity-90 font-medium">{title}</p>
                <p className="text-base font-bold tracking-tight mt-0.5">
                  {value}
                </p>
                <p className="text-[10px] opacity-70 mt-0.5">{sub}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
