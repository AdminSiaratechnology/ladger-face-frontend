import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { fetchItemsByStockGroup } from "../../api/api";
import { useCompanyStore } from "../../../store/companyStore";
import { useStockGroup } from "../../../store/stockGroupStore";
import { toast } from "sonner";

const CircleLoader = () => (
  <div className="flex justify-center items-center py-6">
    <div className="h-6 w-6 rounded-full border-4 border-gray-300 border-t-teal-600 animate-spin"></div>
  </div>
);

export default function CreatePriceListPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { priceLevel, applicableFrom, groupIds } = state || {};
  const { defaultSelected } = useCompanyStore();
  const { stockGroups } = useStockGroup();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(40);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);


  const selectedGroupNames = stockGroups
    .filter((g) => groupIds?.includes(g._id))
    .map((g) => g.name)
    .join(", ");

  /* =========================
     LOAD ITEMS
  ========================= */
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    if (!defaultSelected?._id || !groupIds?.length) return;

    const load = async () => {
      setLoading(true);
      try {
        const gid = groupIds[0]; // ek group ke liye
        const res = await fetchItemsByStockGroup(
          gid,
          defaultSelected._id,
          page
        );

        setRows(
          res.data.products.map((item: any, idx: number) => ({
            id: item._id + "-" + idx,
            itemId: item._id,
            name: item.name,
            fromQty: 1,
            lessThanQty: 0,
            rate: 0,
            discount: 0,
          }))
        );

        setHasMore(res.data.hasMore);
        setTotal(res.data.total);
      } catch {
        toast.error("Failed to load items");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, groupIds, defaultSelected?._id]);


  const goNext = () => {
    if (hasMore) setPage((p) => p + 1);
  };

  const goPrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  /* =========================
     HELPERS
  ========================= */
  const sanitizeNumber = (v: string) => {
    if (v === "") return "";
    const n = Number(v.replace(/[^0-9]/g, ""));
    return isNaN(n) ? "" : n;
  };

  const updateRow = (index: number, field: string, value: any) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };
  const addSlabAfter = (index: number) => {
    const base = rows[index];

    // CASE: Less Than blank → just focus, no toast
    if (base.lessThanQty === "") {
      const lessThanRefIndex = index * 4 + 1;
      inputRefs.current[lessThanRefIndex]?.focus();
      return;
    }

    // CASE: Less Than = 0
    if (Number(base.lessThanQty) === 0) {
      toast.error("Please enter Less Than value before creating next slab");
      return;
    }

    setRows((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, {
        ...base,
        id: base.itemId + "-slab-" + Date.now(),
        fromQty: Number(base.lessThanQty) + 1,
        lessThanQty: "",
        rate: 0,
        discount: 0,
      });
      return copy;
    });

    // ✅ NEW slab ke Less Than pe focus
    setTimeout(() => {
      const nextLessThan = (index + 1) * 4 + 1;
      inputRefs.current[nextLessThan]?.focus();
    }, 0);
  };


  const removeRow = (index: number) => {
    setRows((p) => p.filter((_, i) => i !== index));
  };

  const getSerialNo = (index: number) => {
    const first = rows.findIndex((r) => r.itemId === rows[index].itemId);
    if (first !== index) return "";
    const uniques = rows
      .slice(0, index + 1)
      .filter(
        (r, i, a) => a.findIndex((x) => x.itemId === r.itemId) === i
      );
    return uniques.length;
  };

  const getSerialColor = (index: number) => {
    const firstIndex = rows.findIndex(
      (r) => r.itemId === rows[index].itemId
    );

    const serialNo = rows
      .slice(0, firstIndex + 1)
      .filter(
        (r, i, a) => a.findIndex((x) => x.itemId === r.itemId) === i
      ).length;

    return serialNo % 2 === 0 ? "bg-gray-100" : "bg-white";
  };

  const focusNext = (i: number) => {
    inputRefs.current[i + 1]?.focus();
  };

  const inputCls =
    "h-7 w-full bg-transparent border-0 outline-none ring-0 shadow-none text-center focus:outline-none focus:ring-0";

  /* =========================
     UI
  ========================= */
  return (
    <div className="custom-container pt-2 space-y-3">

      {/* BASIC INFO */}
      <div className="bg-white border rounded-lg px-4 py-3">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs">Stock Group</Label>
            <Input value={selectedGroupNames} disabled className="h-8" />
          </div>
          <div>
            <Label className="text-xs">Price Level</Label>
            <Input value={priceLevel} disabled className="h-8" />
          </div>
          <div>
            <Label className="text-xs">Applicable From</Label>
            <Input value={applicableFrom} disabled className="h-8" />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="border border-gray-300 border-collapse">

            <TableHeader className="bg-gradient-to-r from-teal-50 to-emerald-50">
              <TableRow className="border-b border-gray-200">
                <TableHead className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                  #
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">
                  Item
                </TableHead>
                <TableHead colSpan={2} className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-center border-x border-gray-200">
                  <div className="flex flex-col items-center">
                    <span>Quantities</span>
                    <div className="flex gap-38 mt-1">
                      <span className="text-xs font-medium text-gray-600">From</span>
                      <span className="text-xs font-medium text-gray-600">Less Than</span>
                    </div>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-center min-w-[120px]">
                  Rate
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-center min-w-[120px]">
                  Discount
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-center w-20">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-12">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
                        <div className="h-12 w-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={`
    hover:bg-gray-50 transition-colors duration-150
    ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
  `}
                  >
                    {/* SERIAL NUMBER – NO DESIGN AT ALL */}
                    <TableCell className="px-4 py-3 text-center text-sm text-gray-700">
                      {getSerialNo(index) || ""}
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {getSerialNo(index) ? row.name : ""}
                      </div>
                    </TableCell>

                    {["fromQty", "lessThanQty", "rate"].map((f, i) => (
                      <TableCell key={f} className="px-4 py-3">
                        <div className="relative">
                          <Input
                            ref={(el) => (inputRefs.current[index * 4 + i] = el)}
                            value={row[f]}
                            readOnly={f === "fromQty"}
                            className={`
            ${inputCls}
            w-full px-3 py-2.5 rounded-lg
            focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20
            transition-all duration-200
            text-gray-900 placeholder-gray-500
            ${f === "fromQty" ? "bg-gray-50 text-gray-700 cursor-not-allowed" : ""}
            hover:border-gray-400
          `}
                            onChange={(e) =>
                              updateRow(index, f, sanitizeNumber(e.target.value))
                            }
                          />
                        </div>
                      </TableCell>
                    ))}

                    {/* DISCOUNT */}
                    <TableCell className="px-4 py-3">
                      <div className="relative">
                        <Input
                          ref={(el) => (inputRefs.current[index * 4 + 3] = el)}
                          value={`${row.discount}%`}
                          className={`
          ${inputCls}
          w-full px-3 py-2.5 pr-8 rounded-lg
          focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20
          transition-all duration-200
          text-gray-900
          hover:border-gray-400
        `}
                          onChange={(e) =>
                            updateRow(
                              index,
                              "discount",
                              sanitizeNumber(e.target.value.replace("%", ""))
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSlabAfter(index);
                            }
                          }}

                        />
                      </div>
                    </TableCell>

                    {/* ACTION */}
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="
          text-gray-400 hover:text-red-500
          hover:bg-red-50
          rounded-full p-1.5
          transition-all duration-200
          transform hover:scale-110
        "
                          onClick={() => removeRow(index)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && rows.length === 0 && (
          <div className="py-12 text-center">
            <div className="inline-flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No items added yet</p>
              <p className="text-gray-400 text-sm mt-1">Add your first slab to get started</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={goPrev}
        >
          ← Previous
        </Button>

        <span className="text-sm text-gray-600">
          Page {page} | Showing {(page - 1) * limit + 1}–
          {Math.min(page * limit, total)} of {total}
        </span>

        <Button
          variant="outline"
          disabled={!hasMore}
          onClick={goNext}
        >
          Next →
        </Button>
      </div>




    </div>
  );
}
