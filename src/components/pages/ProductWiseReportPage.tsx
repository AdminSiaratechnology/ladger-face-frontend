import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useProductWiseReportStore } from "../../../store/ProductWiseReportStore";
import { useCompanyStore } from "../../../store/companyStore";
import GenericReportPage from "../customComponents/GenericReportPage";
import ReportFilterActions from "../customComponents/ReportFilterActions";
import TableHeader from "../customComponents/CustomTableHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Package, DollarSign, TrendingUp, Users, Banknote } from "lucide-react";
import { format } from "date-fns";
import UniversalReportFilter from "../customComponents/UniversalReportFilter";

const ProductWiseReportPage = () => {
  const { defaultSelected } = useCompanyStore();
   const defaultCurrency = defaultSelected?.defaultCurrencySymbol || "₹";
  const companyId = defaultSelected?._id;

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [openFilter, setOpenFilter] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [localSearch, setLocalSearch] = useState("");

  const today = new Date();
  const firstDayLastMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  );

  const [localDateRange, setLocalDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({
    from: firstDayLastMonth,
    to: today,
  });

  const {
    data: products = [],
    stats,
    isIndia,
    loading,
    filters,
    pagination,
    setFilter,
    fetchReport,
    fetchAllReport,
    resetFilters,
  } = useProductWiseReportStore();

  // =========================
  // SEARCH (DEBOUNCE)
  // =========================
  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== filters.search) {
        setFilter("search", localSearch);
        setFilter("page", 1);
      }
    }, 500);

    return () => clearTimeout(t);
  }, [localSearch, filters.search, setFilter]);

  // =========================
  // DATE RANGE (FIXED)
  // =========================
  const applyDateRange = useCallback(() => {
    setFilter(
      "startDate",
      localDateRange.from
        ? format(localDateRange.from, "yyyy-MM-dd")
        : undefined
    );
    setFilter(
      "endDate",
      localDateRange.to
        ? format(localDateRange.to, "yyyy-MM-dd")
        : undefined
    );
    setFilter("page", 1);
  }, [localDateRange, setFilter]);

  const resetDateRange = useCallback(() => {
    setLocalDateRange({});
    setFilter("startDate", undefined);
    setFilter("endDate", undefined);
  }, [setFilter]);

  // =========================
  // CLEAR ALL
  // =========================
  const handleClearAll = useCallback(() => {
    setLocalSearch("");
    setLocalDateRange({});
    resetFilters();
    setFilterCount(0);
    setOpenFilter(false);
  }, [resetFilters]);

  // =========================
  // FILTER COUNT
  // =========================
  useEffect(() => {
    let count = 0;

    if (filters.search) count++;
    if (filters.salesmanId) count++;
    if (filters.paymentType) count++;
    if (filters.startDate && filters.endDate) count++;

    setFilterCount(count);
  }, [filters]);

  // =========================
  // FETCH DATA (IMPORTANT)
  // =========================
  useEffect(() => {
    if (!companyId) return;
    fetchReport(companyId);
  }, [
    companyId,
    filters.page,
    filters.limit,
    filters.search,
    filters.salesmanId,
    filters.paymentType,
    filters.startDate,
    filters.endDate,
    fetchReport,
  ]);

  // =========================
  // ADAPTER FOR UNIVERSAL FILTER
  // =========================
  const setFilters = (updater: any) => {
    if (typeof updater === "function") {
      const updated = updater(filters);
      Object.keys(updated).forEach((k) => setFilter(k, updated[k]));
    } else {
      Object.keys(updater).forEach((k) => setFilter(k, updater[k]));
    }
  };

  const applyFilters = () => {
    applyDateRange();
    setOpenFilter(false);
  };

  // =========================
  // STATS (UNCHANGED UI)
  // =========================
  const statCards = useMemo(
    () => [
      {
        label: "Total Qty Sold",
        value: stats?.totalQty || 0,
        icon: <Package className="w-8 h-8" />,
        colorClass: "from-purple-500 to-purple-600",
      },
      {
        label: "Total Revenue",
        value: stats?.totalRevenue?.toLocaleString() || 0,
        icon: <Banknote className="w-8 h-8" />,
        colorClass: "from-teal-500 to-teal-600",
      },
      {
        label: "Total Tax",
        value: stats?.totalTax?.toLocaleString() || 0,
        icon: <TrendingUp className="w-8 h-8" />,
        colorClass: "from-orange-500 to-orange-600",
      },
      {
        label: "Unique Products",
        value: stats?.uniqueProducts || 0,
        icon: <Users className="w-8 h-8" />,
        colorClass: "from-blue-500 to-blue-600",
      },
    ],
    [stats]
  );

  // =========================
  // HEADERS
  // =========================
  const headers = useMemo(() => {
    const base = ["Date", "Product", "Salesman", "Qty", "Rate", "Taxable"];
    return isIndia
      ? [...base, "HSN", "CGST", "SGST", "IGST", "Total"]
      : [...base, "VAT Rate", "VAT Amount", "Total"];
  }, [isIndia]);

  // =========================
  // TABLE VIEW
  // =========================
  const TableView = (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader headers={headers} />
          <tbody className="divide-y divide-gray-100">
            {products.map((p: any) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  {format(new Date(p.date), "dd MMM yyyy")}
                </td>
                <td className="px-4 py-3 font-medium">{p.productName}</td>
                <td className="px-4 py-3 text-sm">{p.salesmanName}</td>
                <td className="px-4 py-3 text-center">{p.qty}</td>
                <td className="px-4 py-3">{p.rate}</td>
                <td className="px-4 py-3">{p.taxable}</td>
                <td className="px-4 py-3 font-bold text-teal-600">
                  {p.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // =========================
  // CARD VIEW
  // =========================
  const CardView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((p: any) => (
        <Card key={p._id}>
          <CardHeader>
            <p className="font-bold truncate">{p.productName}</p>
            <p className="text-xs text-gray-500">
              {format(new Date(p.date), "dd MMM yyyy")}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-teal-600">{p.total}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // =========================
  // RENDER
  // =========================
  return (
    <>
      <GenericReportPage
        title="Product Wise Report"
        subtitle="Detailed sales by product with tax breakup"
        stats={statCards}
        loading={loading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        data={products}
        totalItems={pagination.total || 0}
        totalPages={pagination.totalPages || 1}
        currentPage={filters.page}
        limit={filters.limit}
        onPageChange={(p) => setFilter("page", p)}
        onClearFilters={handleClearAll}
        reportType="product-wise"
        exportFileName="Product_Wise_Report"
        onExportDetailed={async () => await fetchAllReport(companyId)}
        customFilterBar={
          <ReportFilterActions
            count={filterCount}
            onClear={handleClearAll}
            onFilter={() => setOpenFilter(true)}
          />
        }
      >
        {viewMode === "table" ? TableView : CardView}
      </GenericReportPage>

      <UniversalReportFilter
        open={openFilter}
        onClose={setOpenFilter}
        filters={filters}
        setFilters={setFilters}
        onApply={applyFilters}
        onReset={handleClearAll}
        companyId={companyId}
        showSalesman
        showMode
        showDateRange
        localDateRange={localDateRange}
        setLocalDateRange={setLocalDateRange}
        applyDateRange={applyDateRange}
        resetDateRange={resetDateRange}
      />
    </>
  );
};

export default ProductWiseReportPage;
