// pages/reports/ProductWiseReportPage.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useProductWiseReportStore } from "../../../store/ProductWiseReportStore";
import { useCompanyStore } from "../../../store/companyStore";
import { useUserManagementStore } from "../../../store/userManagementStore";
import GenericReportPage from "../customComponents/GenericReportPage";
import ReportFilterBar from "../customComponents/CustomerWiseReportFilterBar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Package, DollarSign, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";
import TableHeader from "../customComponents/CustomTableHeader";

const ProductWiseReportPage = () => {
  const { defaultSelected } = useCompanyStore();
  const { users } = useUserManagementStore();
  const companyId = defaultSelected?._id;

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
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

  // Debounced search
  //   (same as before)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) setFilter("search", localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, filters?.search, setFilter]);

  const applyDateRange = useCallback(() => {
    setFilter("startDate", localDateRange.from?.toISOString());
    setFilter("endDate", localDateRange.to?.toISOString());
    setFilter("page", 1);
  }, [localDateRange, setFilter]);

  const handleFilterChange = useCallback(
    (key: any, value: any) => {
      setFilter(key, value);
      if (key !== "page") setFilter("page", 1);
    },
    [setFilter]
  );

  const handleClearAll = useCallback(() => {
    setLocalSearch("");
    setLocalDateRange({});
    resetFilters();
  }, [resetFilters]);

  const isAnyFilterActive = useMemo(() => {
    return (
      localSearch || filters?.salesmanId !== "all" || !!localDateRange?.from
    );
  }, [localSearch, filters, localDateRange?.from]);

  useEffect(() => {
    if (companyId) fetchReport(companyId);
  }, [companyId, filters, fetchReport]);

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
        value: `${stats?.totalRevenue?.toLocaleString() || 0}`,
        icon: <DollarSign className="w-8 h-8" />,
        colorClass: "from-teal-500 to-teal-600",
      },
      {
        label: "Total Tax",
        value: `${stats?.totalTax?.toLocaleString() || 0}`,
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

  // DYNAMIC HEADERS — CHANGES BASED ON COUNTRY
  const headers = useMemo(() => {
    const base = [
      "Date",
      "HSN",
      "Product",
      "Salesman",
      "Qty",
      "Rate",
      "Taxable",
    ];
    if (isIndia) {
      return [...base, "CGST", "SGST", "IGST", "Total", "Salesman"];
      // ];
    } else {
      return [...base, "VAT Rate", "VAT Amount", "Total"];
    }
  }, [isIndia]);

  const TableView = useMemo(
    () => (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader headers={headers} />
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs md:text-sm whitespace-nowrap">
                    {format(new Date(p?.date), "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-3 text-center text-xs md:text-sm">
                    {p?.hsnCode || "-"}
                  </td>
                  <td
                    className="px-4 py-3 font-medium text-sm max-w-[220px] truncate"
                    title={p.productName}
                  >
                    {p.productName}
                  </td>
                  <td className="px-4 py-3 text-xs md:text-sm text-gray-600 truncate max-w-[140px]">
                    {p?.salesmanName}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {p?.qty}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {p?.rate?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {p?.taxable?.toLocaleString()}
                  </td>

                  {/* TAX COLUMNS — SEPARATE & CLEAN */}
                  {isIndia ? (
                    <>
                      <td className="px-4 py-3 text-left text-orange-600 text-xs ">
                        {p.cgst > 0 ? `${p?.cgst?.toLocaleString()}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-left text-orange-600 text-xs">
                        {p.sgst > 0 ? `${p?.sgst?.toLocaleString()}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-left text-purple-600 text-xs">
                        {p.igst > 0 ? `${p?.igst?.toLocaleString()}` : "-"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-left text-purple-600 font-medium">
                        {p.vatRate || 0}%
                      </td>
                      <td className="px-4 py-3 text-left text-purple-600 font-medium">
                        {p.vatAmount?.toLocaleString() || "0"}
                      </td>
                    </>
                  )}

                  <td className="px-4 py-3 text-left font-bold text-teal-600">
                    {p?.total?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
    [products, isIndia, headers]
  );

  const CardView = useMemo(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <Card key={p?._id} className="hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg truncate">{p?.productName}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(p?.date), "dd MMM yyyy")}
                  </p>
                </div>
                <Badge className="text-xs">HSN: {p?.hsnCode || "N/A"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Qty</span>
                  <span className="font-bold">{p.qty}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rate</span>
                  <span>{p.rate?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxable</span>
                  <span>{p.taxable?.toLocaleString()}</span>
                </div>

                <div className="pt-3 border-t">
                  {isIndia ? (
                    <div className="space-y-1 text-xs">
                      {p.cgst > 0 && (
                        <div className="flex justify-between">
                          <span>CGST</span>
                          <span className="text-orange-600">
                            {p.cgst.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {p.sgst > 0 && (
                        <div className="flex justify-between">
                          <span>SGST</span>
                          <span className="text-orange-600">
                            {p.sgst.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {p.igst > 0 && (
                        <div className="flex justify-between">
                          <span>IGST</span>
                          <span className="text-purple-600">
                            {p.igst.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>VAT Rate</span>
                        <span>{p.vatRate || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT Amount</span>
                        <span className="text-purple-600">
                          {p.vatAmount?.toLocaleString() || "0"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-xl font-bold text-teal-600">
                      {p.total?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Salesman</p>
                    <p className="text-sm font-medium">{p.salesmanName}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
    [products, isIndia]
  );

  return (
    <GenericReportPage
      title="Product Wise Report"
      subtitle="Detailed sales by product with proper tax breakdown"
      stats={statCards}
      loading={loading}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      data={products}
      totalItems={pagination.total || 0}
      totalPages={pagination.totalPages || 1}
      currentPage={filters.page}
      onPageChange={(p) => setFilter("page", p)}
      limit={filters.limit}
      onClearFilters={handleClearAll}
      reportType="product-wise"
      exportFileName="Product_Wise_Report"
      onExportDetailed={async () => await fetchAllReport(companyId)}
      customFilterBar={
        <ReportFilterBar
          localSearch={localSearch}
          setLocalSearch={setLocalSearch}
          salesmanId={filters.salesmanId}
          onSalesmanChange={(v) => handleFilterChange("salesmanId", v)}
          users={users}
          localDateRange={localDateRange}
          setLocalDateRange={setLocalDateRange}
          applyDateRange={applyDateRange}
          resetDateRange={() => setLocalDateRange({})}
          onClearAll={handleClearAll}
          isAnyFilterActive={isAnyFilterActive}
        />
      }
    >
      {viewMode === "table" ? TableView : CardView}
    </GenericReportPage>
  );
};

export default ProductWiseReportPage;
