import { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";

import { useStockGroup } from "../../../store/stockGroupStore";
import { useCompanyStore } from "../../../store/companyStore";

import HeaderGradient from "../customComponents/HeaderGradint";
import ViewModeToggle from "../customComponents/ViewModeToggle";
import EmptyStateCard from "../customComponents/EmptyStateCard";
import TableHeader from "../customComponents/CustomTableHeader";
import SettingsDropdown from "../customComponents/SettingsDropdown";

import { createPriceLevel, fetchPriceLevels } from "../../api/api";
import { exportToExcel } from "../../lib/exportToExcel";

/* =========================
   TYPES
========================= */
interface PriceList {
  id: number;
  name: string;
  status: "active" | "inactive" | "draft";
  assignedCustomers: number;
  validFrom: string;
}

const mockPriceLists: PriceList[] = [
  {
    id: 1,
    name: "Wholesale Price List",
    status: "active",
    assignedCustomers: 45,
    validFrom: "2024-08-01",
  },
];

export default function PriceListManagement() {
  const { stockGroups, filterStockGroups } = useStockGroup();
  const { defaultSelected } = useCompanyStore();

  const [priceLists] = useState(mockPriceLists);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");

  const [newPriceList, setNewPriceList] = useState({
    groupId: "",
    priceLevel: "",
    applicableFrom: "",
  });
  const [priceLevels, setPriceLevels] = useState<any[]>([]);
  const [priceLevelOpen, setPriceLevelOpen] = useState(false);
  const [newPriceLevelInput, setNewPriceLevelInput] = useState("");


  const navigate = useNavigate();

  /* =========================
     EXPORT FUNCTION
  ========================= */
  const exportPriceListsToExcel = async () => {
    if (!defaultSelected?._id) {
      toast.error("No company selected");
      return;
    }

    if (!priceLists.length) {
      toast.error("No data to export");
      return;
    }

    try {
      exportToExcel({
        data: priceLists,
        company: defaultSelected,
        sheetName: "Price Lists",
        fileNamePrefix: "price_lists",
        title: "Price List Export Report",
        tableHeaders: [
          "Price List Name",
          "Status",
          "Assigned Customers",
          "Valid From",
        ],
        rowMapper: (p: any) => [
          p.name || "",
          p.status || "",
          p.assignedCustomers || 0,
          p.validFrom || "",
        ],
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to export price lists");
    }
  };

  useEffect(() => {
    if (!defaultSelected?._id) return;

    fetchPriceLevels(defaultSelected._id)
      .then((res) => {
        setPriceLevels(res.data.data);
      })
      .catch(() => {
        toast.error("Failed to load Price Levels");
      });
  }, [defaultSelected?._id]);

  useEffect(() => {
    filterStockGroups(groupSearch, "", "desc", 1, 10, defaultSelected?._id);
  }, [groupSearch]);

  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return stockGroups;
    return stockGroups.filter((g) =>
      g.name.toLowerCase().includes(groupSearch.toLowerCase())
    );
  }, [stockGroups, groupSearch]);



  const handleAddPriceLevelInline = async () => {
    if (!newPriceLevelInput.trim()) {
      toast.error("Price Level is required");
      return;
    }

    try {
      const res = await createPriceLevel({
        name: newPriceLevelInput,
        companyId: defaultSelected._id,
      });

      setPriceLevels((prev) => [...prev, res.data.data]);

      setNewPriceList({
        ...newPriceList,
        priceLevel: res.data.data.name,
      });

      setNewPriceLevelInput("");
      setPriceLevelOpen(false);

      toast.success("Price Level added");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to add Price Level"
      );
    }
  };



  const stats = {
    total: priceLists.length,
    active: priceLists.filter((p) => p.status === "active").length,
    customers: priceLists.reduce((s, p) => s + p.assignedCustomers, 0),
    draft: priceLists.filter((p) => p.status === "draft").length,
  };

  /* =========================
     TABLE VIEW
  ========================= */
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <TableHeader
          headers={[
            "Price List Name",
            "Status",
            "Customers",
            "Valid From",
            "Actions",
          ]}
        />
        <tbody className="divide-y divide-gray-200">
          {priceLists.map((pl) => (
            <tr key={pl.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">{pl.name}</td>
              <td className="px-6 py-4">
                <Badge>{pl.status}</Badge>
              </td>
              <td className="px-6 py-4">{pl.assignedCustomers}</td>
              <td className="px-6 py-4">{pl.validFrom}</td>
              <td className="px-6 py-4 text-right">
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /* =========================
     CARD VIEW
  ========================= */
  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {priceLists.map((pl) => (
        <Card key={pl.id}>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>{pl.name}</CardTitle>
              <Badge>{pl.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              {pl.assignedCustomers} Customers
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {pl.validFrom}
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
          <SettingsDropdown onExport={exportPriceListsToExcel} />

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
              <p>Customers</p>
              <p className="text-2xl font-bold">{stats.customers}</p>
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
        totalItems={priceLists.length}
      />

      {priceLists.length === 0 ? (
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
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
          <div className="px-6 py-5 space-y-5">
            {/* STOCK GROUP */}
            <div>
              <Label className="mb-1 block text-sm font-semibold text-gray-700">
                Stock Group
              </Label>

              <Input
                readOnly
                placeholder="Select stock group..."
                value={
                  newPriceList.groupId
                    ? stockGroups.find(
                      (g) => g._id === newPriceList.groupId
                    )?.name || "All"
                    : "All"
                }
                onClick={() => setGroupDropdownOpen((p) => !p)}
                className="cursor-pointer bg-gray-50 focus:bg-white"
              />

              {groupDropdownOpen && (
                <div className="mt-2 bg-white border rounded-xl shadow-md">
                  <div className="p-2 border-b bg-gray-50 rounded-t-xl">
                    <Input
                      placeholder="Search stock group..."
                      value={groupSearch}
                      onChange={(e) => setGroupSearch(e.target.value)}
                    />
                  </div>

                  <div className="max-h-[220px] overflow-auto">
                    <div
                      onClick={() => {
                        setNewPriceList({
                          ...newPriceList,
                          groupId: "undefined",
                        });
                        setGroupDropdownOpen(false);
                        setGroupSearch("");
                      }}
                      className="px-4 py-2 text-sm cursor-pointer hover:bg-teal-50"
                    >
                      All
                    </div>

                    {filteredGroups.map((g) => (
                      <div
                        key={g._id}
                        onClick={() => {
                          setNewPriceList({
                            ...newPriceList,
                            groupId: g._id,
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
          placeholder="New price level"
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
              className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl"
              onClick={() => {
                if (
                  !newPriceList.groupId ||
                  !newPriceList.priceLevel ||
                  !newPriceList.applicableFrom
                ) {
                  toast.error("Please fill all fields");
                  return;
                }

                setIsCreateDialogOpen(false);

                navigate("/price-list/create", {
                  state: {
                    priceLevel: newPriceList.priceLevel,
                    applicableFrom: newPriceList.applicableFrom,
                    groupIds: [newPriceList.groupId],
                  },
                });
              }}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
