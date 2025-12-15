import React, { useMemo, useState, useEffect } from "react";
import { usePosStore } from "../../../store/posStore";
import { useCompanyStore } from "../../../store/companyStore";
import GenericReportPage from "../customComponents/GenericReportPage";
import TableHeader from "../customComponents/CustomTableHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Smartphone, Receipt } from "lucide-react";
import { format } from "date-fns";

const PosReport = () => {
  const {
    sessionSales,
    openingCash,
    sessionStart,

    posReportData,
    posReportStats,
    posReportLoading,
    fetchCompanyPosReport,
  } = usePosStore();

  const { defaultSelected } = useCompanyStore();
  const companyId = defaultSelected?._id;

  // ---------------- FETCH BACKEND DATA ----------------
  useEffect(() => {
    if (companyId) {
      fetchCompanyPosReport({
        companyId,
        page: 1,
        limit: 10,
      });
    }
  }, [companyId]);

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // ---------------- NORMALIZE DATA (MOST IMPORTANT) ----------------
  const rows = useMemo(() => {
    const source = posReportData?.length ? posReportData : sessionSales;

    return source.map((s: any) => {
      // BACKEND BILL
      if (s.paymentInfo) {
        return {
          billNumber: s.billNumber,
          createdAt: s.createdAt,
          paymentMode: s.paymentInfo.paymentType.toLowerCase(),
          grandTotal: Number(s.grandTotal || 0),
          payments: s.paymentInfo.payments || null,
        };
      }

      // SESSION SALE
      return {
        billNumber: s.billNumber,
        createdAt: s.time,
        paymentMode: s.paymentMode,
        grandTotal: Number(s.amount || 0),
        payments: s.split || null,
      };
    });
  }, [posReportData, sessionSales]);

  // ---------------- CALCULATE TOTALS ----------------
  const totals = useMemo(() => {
    let cash = 0;
    let card = 0;
    let upi = 0;

    rows.forEach((r) => {
      if (r.paymentMode === "split" && r.payments) {
        cash += r.payments.cash || 0;
        card += r.payments.card || 0;
        upi += r.payments.upi || 0;
      } else {
        if (r.paymentMode === "cash") cash += r.grandTotal;
        if (r.paymentMode === "card") card += r.grandTotal;
        if (r.paymentMode === "upi") upi += r.grandTotal;
      }
    });

    return { cash, card, upi };
  }, [rows]);

  // ---------------- STATS ----------------
  const statCards = [
    {
      label: "Total Bills",
      value: rows.length,
      icon: <Receipt className="w-8 h-8" />,
      colorClass: "from-blue-500 to-blue-600",
    },
    {
      label: "Cash Sales",
      value: `₹${totals.cash.toLocaleString()}`,
      icon: <DollarSign className="w-8 h-8" />,
      colorClass: "from-green-500 to-green-600",
    },
    {
      label: "Card Sales",
      value: `₹${totals.card.toLocaleString()}`,
      icon: <CreditCard className="w-8 h-8" />,
      colorClass: "from-indigo-500 to-indigo-600",
    },
    {
      label: "UPI Sales",
      value: `₹${totals.upi.toLocaleString()}`,
      icon: <Smartphone className="w-8 h-8" />,
      colorClass: "from-purple-500 to-purple-600",
    },
  ];

  // ---------------- TABLE VIEW ----------------
  const headers = ["Time", "Bill No", "Payment Mode", "Amount"];

  const TableView = (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader headers={headers} />
          <tbody className="divide-y divide-gray-100">
            {rows.map((s, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">
                  {s.createdAt
                    ? format(new Date(s.createdAt), "hh:mm a")
                    : "-"}
                </td>
                <td className="px-6 py-4 font-medium">
                  {s.billNumber || "-"}
                </td>
                <td className="px-6 py-4">
                  <Badge className="capitalize">
                    {s.paymentMode}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-green-600">
                  ₹{s.grandTotal.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ---------------- CARD VIEW ----------------
  const CardView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {rows.map((s, i) => (
        <Card key={i} className="hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium">
                  {s.billNumber || "Bill"}
                </p>
                <p className="text-xs text-gray-500">
                  {s.createdAt
                    ? format(new Date(s.createdAt), "dd MMM yyyy, hh:mm a")
                    : "-"}
                </p>
              </div>
              <Badge className="capitalize">
                {s.paymentMode}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between font-bold text-green-600">
              <span>Amount</span>
              <span>₹{s.grandTotal.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // ---------------- RENDER ----------------
  return (
    <GenericReportPage
      title="POS Report"
      subtitle={`Session started at ${
        sessionStart
          ? format(new Date(sessionStart), "dd MMM yyyy, hh:mm a")
          : "-"
      }`}
      stats={statCards}
      loading={posReportLoading}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      data={rows}
      totalItems={rows.length}
      totalPages={1}
      currentPage={1}
      onPageChange={() => {}}
      onClearFilters={() => {}}
      reportType="pos"
      exportFileName="POS_Report"
    >
      {viewMode === "table" ? TableView : CardView}
    </GenericReportPage>
  );
};

export default PosReport;
