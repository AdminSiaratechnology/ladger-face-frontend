import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import {
  Calculator,
  Building2,
  FileText,
  Star,
  Zap,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings2,
} from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";
import { useUOMStore } from "../../../store/uomStore";
import { useCompanyStore } from "../../../store/companyStore";
import { UQC_LIST } from "../../lib/UQC_List";
import { formatSimpleDate } from "../../lib/formatDates";
import HeaderGradient from "../customComponents/HeaderGradint";
import FilterBar from "../customComponents/FilterBar";
import ActionsDropdown from "../customComponents/ActionsDropdown";
import { CheckAccess } from "../customComponents/CheckAccess";
import { TableViewSkeleton } from "../customComponents/TableViewSkeleton";
import TableHeader from "../customComponents/CustomTableHeader";
import PaginationControls from "../customComponents/CustomPaginationControls";
import ViewModeToggle from "../customComponents/ViewModeToggle";
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";
import CustomStepNavigation from "../customComponents/CustomStepNavigation";
import MultiStepNav from "../customComponents/MultiStepNav"; // Assuming shared component
import SectionHeader from "../customComponents/SectionHeader";
import EmptyStateCard from "../customComponents/EmptyStateCard";
import SelectedCompany from "../customComponents/SelectedCompany";

// Unit interface
interface Unit {
  _id: string;
  name: string;
  type: "simple" | "compound";
  status: "active" | "inactive";
  // Simple unit fields
  symbol?: string;
  decimalPlaces?: number;
  // Compound unit fields
  firstUnit?: string;
  conversion?: number;
  secondUnit?: string;
  createdAt: string;
  companyId: string;
  UQC: string;
}

// Form interface
interface UnitForm {
  name: string;
  type: "simple" | "compound";
  status: "active" | "inactive";
  symbol: string;
  decimalPlaces: number;
  firstUnit: string;
  conversion: number;
  secondUnit: string;
  companyId: string;
  UQC: string;
}

const UnitManagement: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<
    "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc"
  >("nameAsc");
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  const {
    fetchUnits,
    units,
    addUnit,
    updateUnit,
    deleteUnit,
    filterUnits,
    pagination,
    loading,
    error,
  } = useUOMStore();
  const { companies, defaultSelected } = useCompanyStore();

  useEffect(() => {
    fetchUnits(currentPage, limit, defaultSelected._id);
  }, [fetchUnits, currentPage, defaultSelected]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    const handler = setTimeout(() => {
      filterUnits(searchTerm, statusFilter, sortBy, currentPage, limit, defaultSelected._id)
        .then(setFilteredUnits)
        .catch(console.error);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, sortBy, currentPage, filterUnits, defaultSelected]);
   useEffect(() => {
     if (defaultSelected) {
       setFormData((prev) => ({ ...prev, companyId: defaultSelected._id }));
     }
   }, [defaultSelected, companies]);
  const [formData, setFormData] = useState<UnitForm>({
    name: "",
    type: "simple",
    status: "active",
    symbol: "",
    decimalPlaces: 2,
    firstUnit: "",
    conversion: 1,
    secondUnit: "",
    companyId: "",
    UQC: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type: inputType } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        inputType === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const handleSelectChange = (name: keyof UnitForm, value: string): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "simple",
      status: "active",
      symbol: "",
      decimalPlaces: 2,
      firstUnit: "",
      conversion: 1,
      secondUnit: "",
      companyId: "",
      UQC: "",
    });
    setEditingUnit(null);
    setActiveTab("basic");
  };

  const handleEditUnit = (unit: Unit): void => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      type: unit.type,
      status: unit.status,
      symbol: unit.symbol || "",
      decimalPlaces: unit.decimalPlaces || 2,
      firstUnit: unit.firstUnit || "",
      conversion: unit.conversion || 1,
      secondUnit: unit.secondUnit || "",
      companyId: unit.companyId,
      UQC: unit.UQC || "",
    });
    setOpen(true);
  };

  const handleDeleteUnit = (id: string): void => {
    deleteUnit(id);
  };

  const handleSubmit = (): void => {
    if (!formData.name.trim()) {
      toast.error("Please enter Unit Name");
      return;
    }
    if (!formData.companyId) {
      toast.error("Please select Company");
      return;
    }

    if (formData.type === "simple") {
      if (!formData.symbol.trim()) {
        toast.error("Please enter Symbol for Simple unit");
        return;
      }
      if (formData.decimalPlaces < 0) {
        toast.error("Decimal Places cannot be negative");
        return;
      }
    } else {
      if (!formData.firstUnit || !formData.secondUnit) {
        toast.error(
          "Please select both First and Second Units for Compound unit"
        );
        return;
      }
      if (formData.firstUnit === formData.secondUnit) {
        toast.error("First and Second Units cannot be the same");
        return;
      }
      if (formData.conversion <= 0) {
        toast.error("Conversion factor must be positive");
        return;
      }
    }

    const submitData = {
      name: formData.name,
      type: formData.type,
      status: formData.status,
      companyId: formData.companyId,
      ...(formData.type === "simple"
        ? {
            symbol: formData.symbol,
            decimalPlaces: formData.decimalPlaces,
            UQC: formData.UQC,
          }
        : {
            firstUnit: formData.firstUnit,
            conversion: formData.conversion,
            secondUnit: formData.secondUnit,
          }),
    };

    if (editingUnit) {
      updateUnit({ unitId: editingUnit._id, data: submitData });
    } else {
      addUnit(submitData);
    }
    setOpen(false);
    resetForm();
  };

  // Get simple units for compound dropdowns
  const simpleUnits = useMemo(
    () => units.filter((u) => u.type === "simple"),
    [units]
  );

  const stats = useMemo(
    () => ({
      totalUnits: pagination?.total || 0,
      simpleUnits: filteredUnits.filter((u) => u.type === "simple").length,
      compoundUnits: filteredUnits.filter((u) => u.type === "compound").length,
      activeUnits:
        statusFilter === "active"
          ? pagination?.total || 0
          : filteredUnits.filter((u) => u.status === "active").length,
    }),
    [filteredUnits, pagination, statusFilter]
  );

  const tabs = [{ id: "basic", label: "Basic Info" }];

  const stepIcons = {
    basic: <FileText className="w-2 h-2 md:w-5 md:h-5" />,
    details: <Calculator className="w-2 h-2 md:w-5 md:h-5" />,
    settings: <Settings2 className="w-2 h-2 md:w-5 md:h-5" />,
  };

  // Table View Component
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader
            headers={[
              "Unit Name",
              "Type",
              "Details",
              "Status",
              "Created Date",
              "Actions",
            ]}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUnits.map((unit) => (
              <tr
                key={unit._id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {unit.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    className={`${
                      unit.type === "simple"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {unit.type}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {unit.type === "simple"
                    ? `${unit.symbol || "N/A"} (${
                        unit.decimalPlaces || 0
                      } decimals)`
                    : `${unit.conversion || 1} ${unit.firstUnit || "N/A"} = 1 ${
                        unit.secondUnit || "N/A"
                      }`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    className={`${
                      unit.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {unit.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatSimpleDate(unit.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <ActionsDropdown
                    onEdit={() => handleEditUnit(unit)}
                    onDelete={() => handleDeleteUnit(unit._id)}
                    module="InventoryManagement"
                    subModule="Unit"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Card View Component
  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredUnits.map((unit) => (
        <Card
          key={unit._id}
          className="overflow-hidden shadow-md hover:shadow-lg transition-shadow"
        >
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{unit.name}</CardTitle>
              <Badge
                className={`${
                  unit.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {unit.status}
              </Badge>
            </div>
            <Badge
              className={`mt-2 ${
                unit.type === "simple"
                  ? "bg-green-100 text-green-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {unit.type}
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 text-sm">
              {unit.type === "simple" ? (
                <>
                  {unit.symbol && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2 text-gray-400" />
                      Symbol: {unit.symbol}
                    </div>
                  )}
                  {unit.decimalPlaces !== undefined && (
                    <div className="flex items-center">
                      <Calculator className="w-4 h-4 mr-2 text-gray-400" />
                      Decimal Places: {unit.decimalPlaces}
                    </div>
                  )}
                  {unit.UQC && (
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-400" />
                      UQC: {unit.UQC}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {unit.firstUnit && (
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-gray-400" />
                      First Unit: {unit.firstUnit}
                    </div>
                  )}
                  {unit.conversion && (
                    <div className="flex items-center">
                      <Calculator className="w-4 h-4 mr-2 text-gray-400" />
                      Conversion: {unit.conversion}
                    </div>
                  )}
                  {unit.secondUnit && (
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                      Second Unit: {unit.secondUnit}
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center pt-2 border-t">
                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                Created: {formatSimpleDate(unit.createdAt)}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <ActionsDropdown
                onEdit={() => handleEditUnit(unit)}
                onDelete={() => handleDeleteUnit(unit._id)}
                module="InventoryManagement"
                subModule="Unit"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="custom-container">
      <div className="flex justify-between items-center mb-8">
        <HeaderGradient
          title="Unit of Measurement"
          subtitle="Manage your unit measurements and conversions"
        />
        <CheckAccess
          module="InventoryManagement"
          subModule="unit"
          type="create"
        >
          <Button
            onClick={() => {
              setOpen(true);
               if (defaultSelected && companies.length > 0) {
                setFormData((prev) => ({
                  ...prev,
                  companyId: defaultSelected._id,
                }));
              }
            }}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Calculator className="w-4 h-4 " />
            Add Unit
          </Button>
        </CheckAccess>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Units</p>
                <p className="text-2xl font-bold">{stats.totalUnits}</p>
              </div>
              <Calculator className="w-6 h-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Simple Units
                </p>
                <p className="text-2xl font-bold">{stats.simpleUnits}</p>
              </div>
              <Star className="w-6 h-6 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  Compound Units
                </p>
                <p className="text-2xl font-bold">{stats.compoundUnits}</p>
              </div>
              <Zap className="w-6 h-6 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">
                  Active Units
                </p>
                <p className="text-2xl font-bold">{stats.activeUnits}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onClearFilters={() => {
          setSearchTerm("");
          setStatusFilter("all");
          setSortBy("nameAsc");
          setCurrentPage(1);
        }}
      />
      {loading && <TableViewSkeleton />}

      <ViewModeToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalItems={pagination?.total}
      />

      {pagination?.total === 0 ? (
        <EmptyStateCard
          icon={Calculator}
          title="No units registered yet"
          description="Create your first unit to get started"
          buttonLabel="Add Your First Unit"
          module="InventoryManagement"
          subModule="unit"
          type="create"
          onButtonClick={() => setOpen(true)}
        />
      ) : (
        <>
          {viewMode === "table" ? <TableView /> : <CardView />}
          <PaginationControls
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pagination={pagination}
            itemName="units"
          />
        </>
      )}

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            resetForm();
          }
        }}
      >
        <DialogContent className="custom-dialog-container">
          <CustomFormDialogHeader
            title={editingUnit ? "Edit Unit" : "Add New Unit"}
            subtitle={
              editingUnit
                ? "Update the unit details"
                : "Create a new unit measurement with specific properties"
            }
          />

          <div className="space-y-6 py-4">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <CustomInputBox
                label="Unit Name "
                placeholder="e.g., Meter"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={true}
              />
              <div className="mt-6">
                <SelectedCompany />
              </div>
              {/* <div className="mt-6 flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) =>
                      handleSelectChange("companyId", e.target.value)
                    }
                    className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.namePrint}
                      </option>
                    ))}
                  </select>
                </div> */}

              <div className="mt-6 flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Unit Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleSelectChange("type", e.target.value)}
                  className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                >
                  <option value="simple">Simple</option>
                  <option value="compound">Compound</option>
                </select>
              </div>
              {formData.type === "simple" ? (
                <>
                  <div className="mt-6">
                    <CustomInputBox
                      label="Symbol "
                      placeholder="e.g., m"
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleChange}
                      required={true}
                    />
                  </div>
                  <div className="mt-6">
                    <CustomInputBox
                      label="Decimal Places"
                      placeholder="e.g., 2"
                      name="decimalPlaces"
                      type="number"
                      value={formData.decimalPlaces}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-1 mt-6">
                    <label className="text-sm font-semibold text-gray-700">
                      UQC
                    </label>
                    <select
                      value={formData.UQC}
                      onChange={(e) =>
                        handleSelectChange("UQC", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select UQC</option>
                      {UQC_LIST.map((uqc) => (
                        <option key={uqc.code} value={uqc.code}>
                          {uqc.description} ({uqc.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      First Unit *
                    </label>
                    <select
                      value={formData.firstUnit}
                      onChange={(e) =>
                        handleSelectChange("firstUnit", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select First Unit</option>
                      {simpleUnits.map((unit) => (
                        <option key={unit._id} value={unit.name}>
                          {unit.name} {unit.symbol && `(${unit.symbol})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <CustomInputBox
                    label="Conversion *"
                    placeholder="e.g., 1000"
                    name="conversion"
                    type="number"
                    value={formData.conversion}
                    onChange={handleChange}
                    required={true}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Second Unit *
                    </label>
                    <select
                      value={formData.secondUnit}
                      onChange={(e) =>
                        handleSelectChange("secondUnit", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Second Unit</option>
                      {simpleUnits
                        .filter((u) => u.name !== formData.firstUnit)
                        .map((unit) => (
                          <option key={unit._id} value={unit.name}>
                            {unit.name} {unit.symbol && `(${unit.symbol})`}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}
              <div className="flex flex-col gap-1 mt-6">
                <label className="text-sm font-semibold text-gray-700">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleSelectChange("status", e.target.value)}
                  className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end mt-6">
                              <Button
                                onClick={handleSubmit}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 md:px-8 md:py-3 rounded-lg flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
                              >
                                {editingUnit ? "Update Unit" : "Save Unit"}
                              </Button>
                            </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnitManagement;
