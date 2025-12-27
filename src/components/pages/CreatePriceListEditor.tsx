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

import { fetchItemsByStockGroup, savePriceListPage, updatePriceListPage } from "../../api/api";
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
const mode = state?.mode || "create";
const isEdit = mode === "edit";
const isView = mode === "view";


  const editData = state?.priceListData || state?.data;
  const navigate = useNavigate();
const priceLevel =
  isEdit || isView
    ? editData?.priceLevel
    : state?.priceLevel;

const applicableFrom =
  isEdit || isView
    ? editData?.applicableFrom
    : state?.applicableFrom;


const groupIds = isEdit
  ? editData?.stockGroupId
    ? [editData.stockGroupId]
    : []
  : state?.groupIds || [];

const groupNames = isEdit
  ? editData?.stockGroupName
    ? [editData.stockGroupName]
    : []
  : state?.groupNames || [];

  const { defaultSelected } = useCompanyStore();
  const { stockGroups } = useStockGroup();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(40);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);




  /* =========================
     LOAD ITEMS
  ========================= */
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
  if (isEdit) return;   // 🔥 EDIT MODE → STOP FETCH
  if (!defaultSelected?._id || !groupIds?.length) return;

  const load = async () => {
    setLoading(true);
    try {
      const gid = groupIds[0];
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
}, [page, groupIds, defaultSelected?._id, isEdit  ,isView]);

useEffect(() => {
  if ((!isEdit && !isView) || !editData?.items) return;

  const editRows = [];

  editData.items.forEach((item) => {
    item.slabs.forEach((slab, idx) => {
      editRows.push({
        id: item.itemId + "-view-" + idx,
        itemId: item.itemId,
        name: item.itemName,
        fromQty: slab.fromQty,
        lessThanQty: slab.lessThanQty,
        rate: slab.rate,
        discount: slab.discount,
      });
    });
  });

  setRows(editRows);
  setHasMore(false);
  setTotal(editRows.length);
}, [isEdit, isView, editData]);



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

  // allow digits + dot
  let cleaned = v.replace(/[^0-9.]/g, "");

  // allow only one dot
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    cleaned = parts[0] + "." + parts.slice(1).join("");
  }

  // ❌ yahan Number() mat lagao
  return cleaned;
};

const removeAutoZero = (oldVal, newVal) => {
  if (oldVal === "0" && newVal.length > 1) {
    return newVal.replace(/^0+/, "");
  }
  return newVal;
};


const formatTwoDecimal = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  const n = Number(value);
  if (isNaN(n)) return "";
  return n.toFixed(2);
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
    // if (base.lessThanQty === "") {
    //   const lessThanRefIndex = index * 4 + 1;
    //   inputRefs.current[lessThanRefIndex]?.focus();
    //   return;
    // }

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

  const selectedGroupNames =
  groupNames?.length > 0
    ? groupNames.join(", ")
    : "All";

 const buildSavePagePayload = () => {
  const validRows = getValidRowsOfCurrentPage();
  if (validRows.length === 0) return null;

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

  const isAllGroups = !groupIds || groupIds.length === 0;

  return {
    companyId: defaultSelected._id,
    clientId: state?.clientId || null,
    priceLevel,
    applicableFrom,
    page,
    items: Object.values(itemMap),

    ...(isAllGroups
      ? {
          stockGroupName: "All",        // ✅ ONLY name
        }
      : {
          stockGroupId: groupIds[0],    // ✅ ObjectId only
          stockGroupName: selectedGroupNames,
        }),
  };
};
const saveCurrentPage = async () => {
  const payload = buildSavePagePayload();

  if (!payload) {
    toast.error("No valid data");
    return;
  }

  try {
    if (isEdit) {
      await updatePriceListPage(editData._id, payload);
      toast.success("Price list updated successfully");
    } else {
      await savePriceListPage(payload);
      toast.success(`Page ${page} saved successfully`);
    }
  
    // ✅ REDIRECT AFTER SUCCESS
  
    setTimeout(() => {
      navigate("/price-list");
    }, 300);

  } catch (err) {
    toast.error("Failed to save price list");
  }
};




  return (
    <div className="custom-container pt-2 space-y-3">
      <div className="flex items-center justify-between mb-2">
  <div className="flex items-center gap-3">
   

   <h2 className="text-xl font-semibold text-gray-800">
  {isView
    ? "View Price List"
    : isEdit
    ? "Edit Price List"
    : "Create Price List"}
</h2>

{isView && (
  <span className="px-2 py-1 text-xs font-semibold rounded-full
    bg-blue-100 text-blue-700 border border-blue-300">
    VIEW MODE
  </span>
)}


    {isEdit && (
      <span className="px-2 py-1 text-xs font-semibold rounded-full
        bg-yellow-100 text-yellow-700 border border-yellow-300">
        EDIT MODE
      </span>
    )}
  </div>
</div>


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
{!isView && (
  <TableHead className="border ...">
    Action
  </TableHead>
)}


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
                          readOnly={isView || f === "fromQty"}
  disabled={isView}
                      className={`${inputCls} h-8 ${
    isView
      ? "bg-gray-100 cursor-not-allowed"
      : f === "fromQty"
      ? "bg-gray-100 cursor-not-allowed"
      : "cursor-pointer"
  }`}
                     onChange={(e) => {
  const cleaned = sanitizeNumber(e.target.value);
  const finalVal = removeAutoZero(String(row[f]), cleaned);
  updateRow(index, f, finalVal);
}}

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
  readOnly={isView}
  disabled={isView}

  /* 🔥 ADD: auto zero remove + sanitize */
  onChange={(e) => {
    if (isView) return;

    const raw = e.target.value.replace("%", "");
    const cleaned = sanitizeNumber(raw);
    const finalVal = removeAutoZero(String(row.discount), cleaned);

    updateRow(index, "discount", finalVal);
  }}

  /* 🔥 ADD: proper formatting on blur */
  onBlur={() => {
    if (isView) return;

    if (row.discount === "" || row.discount === ".") {
      updateRow(index, "discount", "");
      return;
    }

    updateRow(
      index,
      "discount",
      Number(Number(row.discount).toFixed(2))
    );
  }}

  /* ✅ EXISTING: Enter → next slab logic (UNCHANGED) */
  onKeyDown={(e) => {
    if (e.key !== "Enter") return;

    const lessThan = rows[index].lessThanQty;

    if (Number(lessThan) === 0) {
      toast.error(
        "Please enter Less Than quantity before going to next slab"
      );
      return;
    }

    addSlabAfter(index);

    const nextRow = index + 1;
    if (!rows[nextRow]) return;

    const nextLessThanRef = nextRow * 4 + 1;
    inputRefs.current[nextLessThanRef]?.focus();
  }}
/>





                    </TableCell>

                    {/* ACTION */}
                  {!isView && (
  <TableCell className="border text-center">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => removeRow(index)}
      className="text-gray-400 hover:text-red-500"
    >
      ✕
    </Button>
  </TableCell>
)}

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
{isEdit && (
  <p className="text-xs text-orange-600 mt-1">
    You are editing an existing price list. Changes will overwrite previous data.
  </p>
)}

      {/* ACTION BAR BELOW TABLE */}
      <div className="mt-4 flex justify-between items-center">

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/price-list")}
        >
          ← Back
        </Button>
{!isView && (
  <Button
    className="bg-teal-600 hover:bg-teal-700 text-white px-7 py-3 rounded-full"
    onClick={saveCurrentPage}
  >
    {isEdit ? "Update Price List" : "Set Price List"}
  </Button>
)}


      </div>

      {!isEdit && total > limit && (
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
