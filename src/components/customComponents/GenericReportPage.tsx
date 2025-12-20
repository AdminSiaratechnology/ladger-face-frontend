// customComponents/GenericReportPage.tsx
import React, { ReactNode, useMemo, useCallback, memo } from "react";
import ViewModeToggle from "./ViewModeToggle";
import PaginationControls from "./CustomPaginationControls";
import { TableViewSkeleton } from "./TableViewSkeleton";
import EmptyStateCard from "./EmptyStateCard";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import HeaderGradient from "./HeaderGradint";
import { exportToExcel } from "@/lib/utils";

interface StatCardData {
  label: string;
  value: string | number;
  icon: ReactNode;
  colorClass: string;
}

interface GenericReportPageProps {
  title: string;
  subtitle: string;
  stats: StatCardData[];
  loading: boolean;
  viewMode: "table" | "cards";
  onViewModeChange: (mode: "table" | "cards") => void;
  totalItems: number;
  children: ReactNode;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit: number;
  onClearFilters: () => void;
  customFilterBar?: ReactNode;
  data: any[];
  exportFileName: string;
  onExportDetailed?: () => Promise<any[]>;
  reportType: "order" | "payment" | "customer-wise" | "pos";
  emptyStateTitle?: string;
}

const StatCard = memo(({ stat }: { stat: StatCardData }) => (
  <div className={`bg-gradient-to-br ${stat.colorClass} text-white shadow-lg rounded-xl p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium">{stat.label}</p>
        <p className="text-3xl font-bold">{stat.value}</p>
      </div>
      <div className="opacity-80">{stat.icon}</div>
    </div>
  </div>
));
StatCard.displayName = "StatCard";

const GenericReportPage: React.FC<GenericReportPageProps> = ({
  title,
  subtitle,
  stats,
  loading,
  viewMode,
  onViewModeChange,
  totalItems,
  children,
  currentPage,
  totalPages,
  onPageChange,
  limit,
  onClearFilters,
  customFilterBar,
  data,
  exportFileName,
  onExportDetailed,
  reportType,
  emptyStateTitle = "No records found",
}) => {
  const gridCols = useMemo(
    () => (stats.length > 4 ? 4 : stats.length),
    [stats.length]
  );

  const paginationData = useMemo(
    () => ({ total: totalItems, limit, totalPages }),
    [totalItems, limit, totalPages]
  );

  const handlePageChangeWrapper = useCallback(
    (pageAction: number | ((prev: number) => number)) => {
      const newPage =
        typeof pageAction === "function"
          ? pageAction(currentPage)
          : pageAction;
      onPageChange(newPage);
    },
    [currentPage, onPageChange]
  );

  const handleExportNormal = useCallback(() => {
    exportToExcel({ data, type: reportType, fileName: exportFileName });
  }, [data, reportType, exportFileName]);

  const handleExportDetailed = useCallback(async () => {
    if (!onExportDetailed) return;
    const fullData = await onExportDetailed();
    exportToExcel({
      data: fullData,
      type: reportType,
      fileName: exportFileName,
      isDetailed: true,
    });
  }, [onExportDetailed, reportType, exportFileName]);

  return (
    <div className="custom-container">
      {/* HEADER */}
      <div className="mb-4">
        <HeaderGradient title={title} subtitle={subtitle} />
      </div>

      {/* STATS */}
      <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-6 mb-6`}>
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* ROW 1 → Clear / Filter (RIGHT) */}
      <div className="flex justify-end items-center mb-4">
        {customFilterBar}
      </div>

      {/* ROW 2 → View Toggle (LEFT) + Export (RIGHT) */}
      <div className="flex justify-between items-center mb-6">
        <ViewModeToggle
          viewMode={viewMode}
          setViewMode={onViewModeChange}
          totalItems={totalItems}
        />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              disabled={loading || data.length === 0}
              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg"
            >
              Export Report <Download className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleExportNormal}>
              Current View (Filtered)
            </DropdownMenuItem>
            {onExportDetailed && (
              <DropdownMenuItem
                onClick={handleExportDetailed}
                className="font-medium text-teal-600"
              >
                All Data (Detailed)
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* CONTENT */}
      {loading ? (
        <TableViewSkeleton />
      ) : totalItems === 0 ? (
        <EmptyStateCard
          icon={FileText}
          title={emptyStateTitle}
          description="Try adjusting your filters or date range"
          buttonLabel="Clear Filters"
          onButtonClick={onClearFilters}
        />
      ) : (
        <>
          {children}
          <div className="mt-8" />
          <PaginationControls
            currentPage={currentPage}
            setCurrentPage={handlePageChangeWrapper}
            pagination={paginationData}
            itemName="records"
          />
        </>
      )}
    </div>
  );
};

export default memo(GenericReportPage);
