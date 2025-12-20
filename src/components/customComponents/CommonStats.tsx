import React from "react";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import type { LucideIcon } from "lucide-react";

// ----------------------------------------------------------------------
// 1. CONFIGURATION & TYPES
// ----------------------------------------------------------------------

const VARIANTS = {
  teal: {
    bg: "bg-gradient-to-br from-teal-500 to-teal-600",
    text: "text-teal-100",
    icon: "text-teal-200",
    pulse: "bg-teal-400",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-500 to-blue-600",
    text: "text-blue-100",
    icon: "text-blue-200",
    pulse: "bg-blue-400",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-500 to-purple-600",
    text: "text-purple-100",
    icon: "text-purple-200",
    pulse: "bg-green-400", // Green pulse on purple bg usually looks good for "Active"
  },
  green: {
    bg: "bg-gradient-to-br from-green-500 to-green-600",
    text: "text-green-100",
    icon: "text-green-200",
    pulse: "bg-green-400",
  },
  orange: {
    bg: "bg-gradient-to-br from-orange-500 to-orange-600",
    text: "text-orange-100",
    icon: "text-orange-200",
    pulse: "bg-orange-400",
  },
  red: {
    bg: "bg-gradient-to-br from-red-500 to-red-600",
    text: "text-red-100",
    icon: "text-red-200",
    pulse: "bg-red-400",
  },
  indigo: {
    bg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    text: "text-indigo-100",
    icon: "text-indigo-200",
    pulse: "bg-indigo-400",
  },
};

export type StatVariant = keyof typeof VARIANTS;

// Data structure for a single stat item
export interface StatItem {
  title: string;
  value: string | number | undefined | null;
  icon?: LucideIcon;
  variant?: StatVariant;
  showPulse?: boolean; // If true, shows a blinking dot instead of icon
}

// Props for the main component
interface CommonStatsProps {
  stats: StatItem[]; // Array of data objects
  loading?: boolean; // Global loading state
  columns?: 3 | 4 | 5; // How many columns?
  className?: string; // Optional styling overrides
}

// ----------------------------------------------------------------------
// 2. SUB-COMPONENT: SINGLE CARD (Internal)
// ----------------------------------------------------------------------

const SingleStatCard = ({
  item,
  loading,
}: {
  item: StatItem;
  loading: boolean;
}) => {
  const theme = VARIANTS[item.variant || "teal"];
  const Icon = item.icon;

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-12" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${theme.bg} text-white border-0 shadow-lg`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`${theme.text} text-sm font-medium mb-1`}>
              {item.title}
            </p>
            <p className="text-2xl font-bold tracking-tight">
              {item.value ?? 0}
            </p>
          </div>

          {/* Render Pulse Dot OR Icon */}
          {item.showPulse ? (
            <div
              className={`w-3 h-3 ${theme.pulse} rounded-full animate-pulse`}
            />
          ) : (
            Icon && <Icon className={`w-6 h-6 ${theme.icon}`} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ----------------------------------------------------------------------
// 3. MAIN COMPONENT: STATS GROUP
// ----------------------------------------------------------------------

const CommonStats: React.FC<CommonStatsProps> = ({
  stats,
  loading = false,
  columns = 4,
  className = "",
}) => {
  // Map column numbers to Tailwind grid classes
  const gridMap = {
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
  };

  return (
    <div
      className={`grid grid-cols-1 ${gridMap[columns]} gap-6 mb-8 ${className}`}
    >
      {stats.map((stat, index) => (
        <SingleStatCard key={index} item={stat} loading={loading} />
      ))}
    </div>
  );
};

export default CommonStats;