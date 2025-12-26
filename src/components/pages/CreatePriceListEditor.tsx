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

import { fetchItemsByStockGroup, savePriceListPage } from "../../api/api";
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
  const { priceLevel, applicableFrom, groupIds, groupNames } = state || {};
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
  const totalPages = Math.ceil(total / limit);

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

      // 🔥 IMPORTANT LOGIC
      // Agar lessThanQty change ho aur next row same item ki slab ho
      if (
        field === "lessThanQty" &&
        value !== "" &&
        prev[index + 1] &&
        prev[index + 1].itemId === prev[index].itemId
      ) {
        copy[index + 1] = {
          ...copy[index + 1],
          fromQty: Number(value) + 1,
        };
      }

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



  const focusNext = (i: number) => {
    inputRefs.current[i + 1]?.focus();
  };

  const inputCls =
    "h-7 w-full bg-white border border-transparent outline-none shadow-none text-center focus:outline-none focus:ring-0";



  const focusNextEditable = (currentIndex) => {
    let next = currentIndex + 1;

    while (inputRefs.current[next]) {
      const el = inputRefs.current[next];
      if (el && !el.readOnly && !el.disabled) {
        el.focus();
        return;
      }
      next++;
    }
  };

  // backend or data store
const getValidRowsOfCurrentPage = () => {
  return rows.filter((r) => {
    return (
      (Number(r.rate) > 0 || Number(r.discount) > 0) &&
      Number(r.fromQty) > 0 &&
      (
        r.lessThanQty === "" ||
        r.lessThanQty === null ||
        Number(r.lessThanQty) > Number(r.fromQty)
      )
    );
  });
};


  const buildSavePagePayload = () => {
    const validRows = getValidRowsOfCurrentPage();
    console.log("hiiihhihi")
    if (validRows.length === 0) return null;
    console.log("faileddddd")

    const itemMap = {};

    validRows.forEach((r) => {
      if (!itemMap[r.itemId]) {
        itemMap[r.itemId] = {
          itemId: r.itemId,
          itemName: r.name,
          slabs: [],
        };
      }

      itemMap[r.itemId].slabs.push({
        fromQty: r.fromQty,
        lessThanQty: r.lessThanQty,
        rate: r.rate,
        discount: r.discount,
      });
    });

    return {
      companyId: defaultSelected._id,
      clientId: state?.clientId || null,

      priceLevel,
      stockGroupId: groupIds?.[0],
      stockGroupName: selectedGroupNames,

      applicableFrom,
      page,
      items: Object.values(itemMap),
    };
  };

  const saveCurrentPage = async () => {
    const payload = buildSavePagePayload();

    if (!payload) {
      toast.error("No item is present");
      return;
    }

    try {
      await savePriceListPage(payload);

      toast.success(`Page ${page} saved successfully`);

      // 🔥 CLEAR CURRENT PAGE DATA
      setRows((prev) =>
        prev.map((r) => ({
          ...r,
          lessThanQty: 0,
          rate: 0,
          discount: 0,
        }))
      );
    } catch (e) {
      toast.error("Error Occured while uploading the pricelist");
    }
  };



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
      <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">

          <Table className="border border-gray-300 border-collapse w-full">

            {/* ================= HEADER ================= */}
            <TableHeader className="bg-gradient-to-r from-teal-50 to-emerald-50">
              <TableRow>

                <TableHead className="border border-gray-300 px-3 py-2 w-[5%] text-xs font-semibold text-gray-700">
                  #
                </TableHead>

                <TableHead className="border border-gray-300 px-3 py-2 w-[30%] text-xs font-semibold text-gray-700">
                  Item
                </TableHead>

                <TableHead
                  colSpan={2}
                  className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center"
                >
                  <div className="flex flex-col items-center">
                    <span>Quantities</span>
                    <div className="flex justify-between w-full px-8 mt-1">
                      <span className="text-[11px] font-medium text-gray-600">
                        From
                      </span>
                      <span className="text-[11px] font-medium text-gray-600">
                        Less Than
                      </span>
                    </div>
                  </div>
                </TableHead>

                <TableHead className="border border-gray-300 px-3 py-2 w-[15%] text-xs font-semibold text-gray-700 text-center">
                  Rate
                </TableHead>

                <TableHead className="border border-gray-300 px-3 py-2 w-[15%] text-xs font-semibold text-gray-700 text-center">
                  Discount
                </TableHead>

                <TableHead className="border border-gray-300 px-3 py-2 w-[10%] text-xs font-semibold text-gray-700 text-center">
                  Action
                </TableHead>

              </TableRow>
            </TableHeader>

            {/* ================= BODY ================= */}
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="border border-gray-300 py-10">
                    <div className="flex justify-center">
                      <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-teal-600 animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={row.id} className="bg-white">

                    {/* SERIAL */}
                    <TableCell className="border border-gray-300 text-center text-sm">
                      {getSerialNo(index) || ""}
                    </TableCell>

                    {/* ITEM */}
                    <TableCell className="border border-gray-300 text-sm font-medium">
                      {getSerialNo(index) ? row.name : ""}
                    </TableCell>

                    {/* FROM + LESS THAN + RATE */}
                    {["fromQty", "lessThanQty", "rate"].map((f, i) => (
                      <TableCell key={f} className="border border-gray-300">
                        <Input
                          ref={(el) => (inputRefs.current[index * 4 + i] = el)}
                          value={row[f]}
                          readOnly={f === "fromQty"}
                          className={`${inputCls} h-8 ${f === "fromQty"
                              ? "bg-gray-100 cursor-not-allowed"
                              : "cursor-pointer"
                            }`}
                          onChange={(e) =>
                            updateRow(index, f, sanitizeNumber(e.target.value))
                          }
                          /* ✅ ENTER → NEXT EDITABLE CELL */
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              focusNextEditable(index * 4 + i);
                            }
                          }}
                        />
                      </TableCell>
                    ))}

                    {/* DISCOUNT */}
                    <TableCell className="border border-gray-300">
                      <Input
                        ref={(el) => (inputRefs.current[index * 4 + 3] = el)}
                        value={`${row.discount}%`}
                        className={`${inputCls} h-8 cursor-pointer`}
                        onChange={(e) =>
                          updateRow(
                            index,
                            "discount",
                            sanitizeNumber(e.target.value.replace("%", ""))
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key !== "Enter") return;

                          const lessThan = rows[index].lessThanQty;

                          // CASE 1: Less Than filled → add slab
                          if (lessThan !== "" && Number(lessThan) > 0) {
                            addSlabAfter(index);
                            return;
                          }

                          // CASE 2: Less Than empty → next row lessThan
                          const nextRow = index + 1;
                          if (!rows[nextRow]) return;

                          const nextLessThanRef = nextRow * 4 + 1;
                          inputRefs.current[nextLessThanRef]?.focus();
                        }}
                      />
                    </TableCell>

                    {/* ACTION */}
                    <TableCell className="border border-gray-300 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(index)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        ✕
                      </Button>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>

          </Table>
        </div>

        {/* ================= EMPTY STATE ================= */}
        {!loading && rows.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500 font-medium">No items added yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Add your first slab to get started
            </p>
          </div>
        )}
      </div>

      {/* ACTION BAR BELOW TABLE */}
      <div className="mt-4 flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/price-list")}
        >
          ← Back
        </Button>

        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white px-7 py-3 rounded-full"
          onClick={saveCurrentPage}
        >
          Set Price List
        </Button>
      </div>

      {total > limit && (
        <div className="w-full bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between border">

          {/* LEFT TEXT */}
          <span className="text-sm text-gray-600">
            Showing {(page - 1) * limit + 1} – {Math.min(page * limit, total)} of {total} records
          </span>

          {/* RIGHT PAGINATION */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={goPrev}
              className="h-7 px-2 text-gray-700"
            >
              ‹
            </Button>

            <span className="text-sm text-gray-700">
              {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore}
              onClick={goNext}
              className="h-7 px-2 text-gray-700"
            >
              ›
            </Button>
          </div>
        </div>
      )}







    </div>
  );
}
