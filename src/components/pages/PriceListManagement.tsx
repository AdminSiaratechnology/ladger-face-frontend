import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";


import {
  DollarSign,
  Plus,
  Edit,
  FileText,
  Users,
  Calendar,
  Eye,
} from "lucide-react";

import { useStockGroup } from "../../../store/stockGroupStore";
import { useCompanyStore } from "../../../store/companyStore";

import HeaderGradient from "../customComponents/HeaderGradint";
import ViewModeToggle from "../customComponents/ViewModeToggle";
import EmptyStateCard from "../customComponents/EmptyStateCard";
import TableHeader from "../customComponents/CustomTableHeader";
import SettingsDropdown from "../customComponents/SettingsDropdown";

import { createPriceLevel, fetchPriceLevels, fetchPriceList, fetchPriceListById, importPriceListFromCSV } from "../../api/api";
import { exportToExcel } from "../../lib/exportToExcel";
import { ImportCSVModal } from "../customComponents/ImportCSVModal";
import UniversalInventoryDetailsModal from "../customComponents/UniversalInventoryDetailsModal";
import PriceListViewModal from "../customComponents/PriceListViewModal";

/* =========================
   TYPES
========================= */
interface PriceList {
  id: number;
  name: string;
  status: "active" | "inactive" | "draft";
  clientId: string;
  validFrom: string;
}



export default function PriceListManagement() {
  const navigate = useNavigate();
  const groupRef = useRef<HTMLDivElement>(null);

  const { stockGroups, filterStockGroups } = useStockGroup();
  const { defaultSelected } = useCompanyStore();

  const [priceLevelLists, setPriceLevelLists] = useState<PriceList[]>([]);
  const [priceLevels, setPriceLevels] = useState<any[]>([]);

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");

  const [priceLevelOpen, setPriceLevelOpen] = useState(false);
  const [newPriceLevelInput, setNewPriceLevelInput] = useState("");
  const [importModalOpen, setImportModalOpen] = useState(false);
 
  const [isViewOpen, setIsViewOpen] = useState(false);
const [viewData, setViewData] = useState<any>(null);


  const [newPriceList, setNewPriceList] = useState({
    groupId: "",
    groupName: "",
    priceLevel: "",
    applicableFrom: "",
  });

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    if (!defaultSelected?._id) return;

    fetchPriceLevels(defaultSelected._id)
      .then((res) => {
        const data = res.data.data || [];

        // 👇 ONLY dropdown ke liye
        setPriceLevels(data);   // [{ _id, name }]
      })
      .catch(() => toast.error("Failed to load price levels"));
  }, [defaultSelected?._id]);


  useEffect(() => {
    if (!defaultSelected?._id) return;

    fetchPriceList(defaultSelected._id)
      .then((res) => {
        const data = res.data.data || [];

        // 👇 table + card ke liye mapping
        setPriceLevelLists(
          data.map((pl: any, i: number) => ({
            id: pl._id || i,
            name: pl.priceLevel,        // table / card title
            status: "active",           // static
            clientId: pl.clientId || "",
            validFrom: pl.applicableFrom,
            stockGroupName: pl.stockGroupName,
            page: pl.page,
            itemCount: pl.items?.length || 0,
          }))
        );
      })
      .catch(() => toast.error("Failed to load price lists"));
  }, [defaultSelected?._id]);


  /* =========================
     STOCK GROUP SEARCH
  ========================= */
  useEffect(() => {
    filterStockGroups(groupSearch, "", "desc", 1, 10, defaultSelected?._id);
  }, [groupSearch, defaultSelected?._id]);

  /* =========================
     CLICK OUTSIDE GROUP DROPDOWN
  ========================= */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) {
        setGroupDropdownOpen(false);
      }
    };

    if (groupDropdownOpen) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [groupDropdownOpen]);

  /* =========================
     MEMOS
  ========================= */
  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return stockGroups;
    return stockGroups.filter((g) =>
      g.name.toLowerCase().includes(groupSearch.toLowerCase())
    );
  }, [stockGroups, groupSearch]);

  const stats = useMemo(() => ({
    total: priceLevelLists.length,
    active: priceLevelLists.filter(p => p.status === "active").length,
    draft: priceLevelLists.filter(p => p.status === "draft").length,
    client: new Set(
      priceLevelLists
        .map(p => p.clientId)
        .filter(id => id && id !== "0")
    ).size,
  }), [priceLevelLists]);

  /* =========================
     ACTIONS
  ========================= */
  const handleAddPriceLevelInline = useCallback(async () => {
    if (!newPriceLevelInput.trim()) {
      toast.error("Price Level is required");
      return;
    }



    try {
      const res = await createPriceLevel({
        name: newPriceLevelInput,
        companyId: defaultSelected._id,
        stockGroupId: newPriceList.groupId,
        stockGroupName: newPriceList.groupName,
      });

      setPriceLevels((p) => [...p, res.data.data]);
      setNewPriceList((p) => ({ ...p, priceLevel: res.data.data.name }));
      setNewPriceLevelInput("");
      setPriceLevelOpen(false);

      toast.success("Price Level added");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to add Price Level");
    }
  }, [newPriceLevelInput, defaultSelected?._id]);

  /* =========================
     EXPORT
  ========================= */
  const exportPriceListsToExcel = useCallback(() => {
    if (!priceLevelLists.length) {
      toast.error("No data to export");
      return;
    }

    exportToExcel({
      data: priceLevelLists,
      company: defaultSelected,
      sheetName: "Price Lists",
      fileNamePrefix: "price_lists",
      title: "Price List Export Report",
      tableHeaders: ["Price Level", "Status", "Client", "Valid From"],
      rowMapper: (p: any) => [
        p.name,
        p.status,
        p.clientId || "-",
        p.validFrom,
      ],
    });
  }, [priceLevelLists, defaultSelected]);

  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <TableHeader
          headers={[
            "Price Level",
            "Valid From",
            "Stock Groups",
            "Actions",
          ]}
        />

        <tbody className="divide-y divide-gray-200">
          {priceLevelLists.map((pl) => (
            <tr key={pl.id} className="hover:bg-gray-50">

              {/* Price Level */}
              <td className="px-6 py-4 font-medium align-middle">
                {pl.name}
              </td>

              {/* Valid From */}
              <td className="px-6 py-4 align-middle">
                {pl.validFrom || "-"}
              </td>

              {/* Stock Groups */}
              <td className="px-6 py-4 align-middle">
                {pl.stockGroupName || "-"}
              </td>

              {/* Actions */}
              <td className=" py-4 text-left align-middle">
                <div className="flex items-center gap-2">

                  {/* VIEW */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={async () => {
  try {
    const res = await fetchPriceListById(pl.id);
    setViewData(res.data.data);   // 🔥 FULL document with items
    setIsViewOpen(true);
  } catch {
    toast.error("Failed to load price list");
  }
}}


                  >
                    <Eye className="w-4 h-4" />
                  </Button>


                  {/* EDIT */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700 cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                </div>
              </td>


            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );



  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {priceLevelLists.map((pl) => (
        <Card key={pl.id} className="rounded-2xl shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base font-semibold">
                {pl.name}
              </CardTitle>

              <Badge>{pl.status}</Badge>
            </div>
          </CardHeader>

          <CardContent className="text-sm space-y-3 text-gray-700">

            {/* Valid From */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                <b>Valid From:</b> {pl.validFrom || "-"}
              </span>
            </div>

            {/* Stock Groups */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>
                <b>Stock Groups:</b> {pl.stockGroupName || "-"}
              </span>
            </div>

            {/* Action */}
            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                onClick={async () => {
  try {
    const res = await fetchPriceListById(pl.id);
    setViewData(res.data.data);   // 🔥 FULL document with items
    setIsViewOpen(true);
  } catch {
    toast.error("Failed to load price list");
  }
}}

                <Eye className="w-4 h-4" />
              </Button>

              {/* EDIT */}
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
                onClick={() => {
  const fullDoc = priceLevels.find(
    (p) => p._id === pl.id
  );

  setViewData(fullDoc);
  setIsViewOpen(true);
}}

              >
                <Eye className="w-4 h-4" />
              </Button>


            </div>


          </CardContent>
        </Card>
      ))}
    </div>
  );


  return (
    <div className="custom-container">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <HeaderGradient
          title="Price List Management"
          subtitle="Create and manage your pricing structure"
        />

        <div className="flex items-center gap-3">
          <SettingsDropdown
            onExport={exportPriceListsToExcel}
            onImport={() => setImportModalOpen(true)}
          />


          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Price List
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-blue-600 text-white">
          <CardContent className="p-4 flex justify-between">
            <div>
              <p>Total Lists</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FileText />
          </CardContent>
        </Card>

        <Card className="bg-green-600 text-white">
          <CardContent className="p-4 flex justify-between">
            <div>
              <p>Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <DollarSign />
          </CardContent>
        </Card>

        <Card className="bg-purple-600 text-white">
          <CardContent className="p-4 flex justify-between">
            <div>
              <p>client</p>
              <p className="text-2xl font-bold">{stats.client}</p>
            </div>
            <Users />
          </CardContent>
        </Card>

        <Card className="bg-teal-600 text-white">
          <CardContent className="p-4 flex justify-between">
            <div>
              <p>Draft</p>
              <p className="text-2xl font-bold">{stats.draft}</p>
            </div>
            <FileText />
          </CardContent>
        </Card>
      </div>

      <ViewModeToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalItems={priceLevelLists.length}
      />

      {priceLevelLists.length === 0 ? (
        <EmptyStateCard
          icon={FileText}
          title="No price lists found"
          description="Create your first price list"
          buttonLabel="Create Price List"
          onButtonClick={() => setIsCreateDialogOpen(true)}
        />
      ) : viewMode === "table" ? (
        <TableView />
      ) : (
        <CardView />
      )}

      {/* =========================
         CREATE PRICE LIST DIALOG
         (EXACT SAME AS YOU SENT)
      ========================= */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) {
          setGroupDropdownOpen(false);
          setGroupSearch("");
        }
      }}
      >
        <DialogContent
          className="
            max-w-lg 
            max-h-[85vh] 
            overflow-y-auto 
            p-0 
            rounded-2xl 
            shadow-xl
          "
        >
          {/* HEADER */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-teal-50 to-blue-50 rounded-t-2xl">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Create Price List
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure pricing details for selected stock group
            </p>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-5" >
            {/* STOCK GROUP */}
            <div >
              <Label className="mb-1 block text-sm font-semibold text-gray-700">
                Stock Group
              </Label>

              <Input
                readOnly
                placeholder="Select stock group..."
                value={newPriceList.groupName}
                onClick={() => setGroupDropdownOpen((p) => !p)}
                className="cursor-pointer bg-gray-50 focus:bg-white"
              />


              {groupDropdownOpen && (
                <div className="mt-2 bg-white border rounded-xl shadow-md">

                  {/* SEARCH */}
                  <div className="p-2 border-b bg-gray-50 rounded-t-xl">
                    <Input
                      placeholder="Search stock group..."
                      value={groupSearch}
                      onChange={(e) => setGroupSearch(e.target.value)}
                    />
                  </div>

                  {/* LIST */}
                  <div className="max-h-[220px] overflow-auto">

                    {/* ALL */}
                    <div
                      onClick={() => {
                        setNewPriceList({
                          ...newPriceList,
                          groupId: "All",
                          groupName: "All",
                        });
                        setGroupDropdownOpen(false);
                        setGroupSearch("");
                      }}
                      className="px-4 py-2 text-sm cursor-pointer hover:bg-teal-50"
                    >
                      All
                    </div>


                    {/* GROUPS */}
                    {filteredGroups.map((g) => (
                      <div
                        key={g._id}
                        onClick={() => {
                          setNewPriceList({
                            ...newPriceList,
                            groupId: g._id,
                            groupName: g.name,
                          });
                          setGroupDropdownOpen(false);
                          setGroupSearch("");
                        }}

                        className="px-4 py-2 text-sm cursor-pointer hover:bg-teal-50"
                      >
                        {g.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>



            {/* PRICE LEVEL */}
            <div>
              <Label className="mb-1 block text-sm font-semibold text-gray-700">
                Price Level
              </Label>

              {/* SELECT BOX */}
              <div
                className="w-full border rounded-md px-3 py-2 text-sm cursor-pointer bg-white"
                onClick={() => setPriceLevelOpen(!priceLevelOpen)}
              >
                {newPriceList.priceLevel || "Select Price Level"}
              </div>

              {/* DROPDOWN (NOW PUSHES CONTENT DOWN) */}
              {priceLevelOpen && (
                <div className="mt-2 w-full bg-white border rounded-md shadow-lg">

                  {/* INPUT + PLUS */}
                  <div className="flex gap-2 p-2 border-b bg-gray-50">

                    <input
                      className="flex-1 border rounded px-2 py-1 text-sm"
                      placeholder=" Create New price level"
                      value={newPriceLevelInput}
                      onChange={(e) => setNewPriceLevelInput(e.target.value)}
                    />

                    <button
                      className="px-3 py-1 bg-black text-white rounded"
                      onClick={handleAddPriceLevelInline}
                    >
                      +
                    </button>
                  </div>

                  {/* EXISTING PRICE LEVELS */}
                  <div className="max-h-[220px] overflow-auto">
                    {priceLevels.map((pl) => (
                      <div
                        key={pl._id}
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-teal-50"
                        onClick={() => {
                          setNewPriceList({
                            ...newPriceList,
                            priceLevel: pl.name,
                          });
                          setPriceLevelOpen(false);
                        }}
                      >
                        {pl.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>





            {/* DATE */}
            <div>
              <Label className="mb-1 block text-sm font-semibold text-gray-700">
                Applicable From
              </Label>
              <Input
                type="date"
                value={newPriceList.applicableFrom}
                onChange={(e) =>
                  setNewPriceList({
                    ...newPriceList,
                    applicableFrom: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
<Button
  onClick={() => {
    if (
      !newPriceList.groupId ||
      !newPriceList.priceLevel ||
      !newPriceList.applicableFrom
    ) {
      toast.error("Please fill all fields");
      return;
    }

    const isAlreadyCreated = priceLevelLists.some((pl: any) =>
      pl.stockGroupName === newPriceList.groupName &&
      pl.name === newPriceList.priceLevel &&
      pl.validFrom === newPriceList.applicableFrom
    );

   if (isAlreadyCreated) {
  toast.error("Price list is already created");

  setNewPriceList({
    groupId: "",
    groupName: "",
    priceLevel: "",
    applicableFrom: "",
  });

  return;
}


    setIsCreateDialogOpen(false);

    navigate("/price-list/create", {
      state: {
        priceLevel: newPriceList.priceLevel,
        applicableFrom: newPriceList.applicableFrom,
        groupIds: [newPriceList.groupId],
        groupNames: [newPriceList.groupName],
      },
    });
  }}
>
  Continue
</Button>



          </div>
        </DialogContent>
      </Dialog>
      <ImportCSVModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSuccess={() => {
          toast.success("Price list imported successfully");
          fetchPriceList(defaultSelected?._id);
        }}
        title="Import Price List from CSV"
        resourceName="price-list"
        importFn={importPriceListFromCSV}
      />
      <PriceListViewModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setViewData(null);
        }}
        data={viewData}
        
        type="priceList"  
      />


    </div>
  );
}
