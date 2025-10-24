import { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import {
  Layers,
  Building2,
  FileText,
  Star,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings2,
} from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";
import { useStockGroup } from "../../../store/stockGroupStore";
import { useCompanyStore } from "../../../store/companyStore";
import { formatSimpleDate } from "../../lib/formatDates";

import FilterBar from "../customComponents/FilterBar";
import HeaderGradient from "../customComponents/HeaderGradint";
import ActionsDropdown from "../customComponents/ActionsDropdown";
import { CheckAccess } from "../customComponents/CheckAccess";
import { TableViewSkeleton } from "../customComponents/TableViewSkeleton";
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";
import CustomStepNavigation from "../customComponents/CustomStepNavigation";
// import { MultiStepNav } from "../customComponents/MultiStepNav"; // Assuming shared component
import ViewModeToggle from "../customComponents/ViewModeToggle";
import PaginationControls from "../customComponents/CustomPaginationControls";
import TableHeader from "../customComponents/CustomTableHeader";
import SectionHeader from "../customComponents/SectionHeader";
import EmptyStateCard from "../customComponents/EmptyStateCard";
import SelectedCompany from "../customComponents/SelectedCompany";

// StockGroup interface (adjusted to match store)
interface StockGroup {
  _id: string;
  clientId?: string;
  companyId?: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  stockGroupId?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface StockGroupForm {
  name: string;
  description: string;
  status: "active" | "inactive";
  stockGroupId: string;
  companyId: string;
}

const StockGroupRegistration: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [editingStockGroup, setEditingStockGroup] = useState<StockGroup | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<
    "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc"
  >("nameAsc");
  const [filteredStockGroups, setFilteredStockGroups] = useState<StockGroup[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // Fixed limit per page

  const {
    fetchStockGroup,
    addStockGroup,
    updateStockGroup,
    deleteStockGroup,
    stockGroups,
    pagination,
    loading,
    error,
    filterStockGroups,
  } = useStockGroup();
  const { companies, defaultSelected } = useCompanyStore();

  // Initial fetch
  useEffect(() => {
    fetchStockGroup(currentPage, limit,defaultSelected);
  }, [fetchStockGroup, currentPage,defaultSelected]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      filterStockGroups(searchTerm, statusFilter, sortBy, currentPage, limit, defaultSelected)
        .then((result) => {
          setFilteredStockGroups(result);
        })
        .catch((err) => {
          console.error("Error filtering stock groups:", err);
        });
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, statusFilter, sortBy, currentPage, filterStockGroups, defaultSelected]);

  const [formData, setFormData] = useState<StockGroupForm>({
    name: "",
    description: "",
    status: "active",
    stockGroupId: "",
    companyId: "",
  });
  useEffect(() => {
    console.log("defaultSelected:", defaultSelected);
    console.log("companies:", companies);
    if (defaultSelected && companies.length > 0) {
      const selectedCompany = companies.find((c) => c._id === defaultSelected);
      console.log(selectedCompany);
      if (selectedCompany) {
        setFormData((prev) => ({ ...prev, companyId: selectedCompany._id }));
      }
    }
  }, [defaultSelected, companies]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (
    name: keyof StockGroupForm,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "active",
      stockGroupId: "",
      companyId: "",
    });
    setEditingStockGroup(null);
    setActiveTab("basic");
  };

  const handleEditStockGroup = (stockGroup: StockGroup): void => {
    setEditingStockGroup(stockGroup);
    setFormData({
      name: stockGroup.name,
      description: stockGroup.description || "",
      status: stockGroup.status,
      stockGroupId: stockGroup.stockGroupId || "",
      companyId: stockGroup.companyId || "",
    });
    setOpen(true);
  };

  const handleDeleteStockGroup = (stockGroupId: string): void => {
    deleteStockGroup(stockGroupId);
  };

  const handleSubmit = (): void => {
    if (!formData.name.trim()) {
      toast.error("Please enter Stock Group Name");
      return;
    }
    // if (!formData.companyId) {
    //   toast.error("Please select Company");
    //   return;
    // }

    if (editingStockGroup) {
      updateStockGroup(editingStockGroup._id, formData);
    } else {
      addStockGroup(formData);
    }

    resetForm();
    setOpen(false);
  };

  // Statistics calculations
  const stats = useMemo(
    () => ({
      totalGroups: pagination?.total,
      primaryGroups: filteredStockGroups?.filter((g) => !g.stockGroupId).length,
      activeGroups:
        statusFilter === "active"
          ? pagination.total
          : filteredStockGroups?.filter((g) => g.status === "active").length,
      inactiveGroups:
        statusFilter === "inactive"
          ? pagination.total
          : filteredStockGroups?.filter((g) => g.status === "inactive").length,
    }),
    [filteredStockGroups, pagination, statusFilter]
  );

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "hierarchy", label: "Hierarchy" },
    { id: "settings", label: "Settings" },
  ];

  const stepIcons = {
    basic: <FileText className="w-2 h-2 md:w-5 md:h-5 " />,
    hierarchy: <Layers className="w-2 h-2 md:w-5 md:h-5 " />,
    settings: <Settings2 className="w-2 h-2 md:w-5 md:h-5 " />,
  };

  // Table View Component
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader
            headers={[
              "Group Name",
              "Description",
              "Parent Group",
              "Created At",
              "Status",
              "Actions",
            ]}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStockGroups.map((group) => (
              <tr
                key={group._id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {group.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {group.description || "No description"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {group.stockGroupId
                    ? stockGroups.find((g) => g._id === group.stockGroupId)
                        ?.name || "Unknown"
                    : "Primary"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatSimpleDate(group.createdAt || "")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    className={`${
                      group.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {group.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <ActionsDropdown
                    onEdit={() => handleEditStockGroup(group)}
                    onDelete={() => handleDeleteStockGroup(group._id)}
                    module="InventoryManagement"
                    subModule="StockGroup"
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
      {filteredStockGroups.map((group) => (
        <Card
          key={group._id}
          className="overflow-hidden shadow-md hover:shadow-lg transition-shadow"
        >
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{group.name}</CardTitle>
              <Badge
                className={`${
                  group.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {group.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              {group.description || "No description"}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Layers className="w-4 h-4 mr-2 text-gray-400" />
                Parent:{" "}
                {group.stockGroupId
                  ? stockGroups.find((g) => g._id === group.stockGroupId)
                      ?.name || "Unknown"
                  : "Primary"}
              </div>
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                Created: {formatSimpleDate(group.createdAt || "")}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <ActionsDropdown
                onEdit={() => handleEditStockGroup(group)}
                onDelete={() => handleDeleteStockGroup(group._id)}
                module="InventoryManagement"
                subModule="StockGroup"
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
          title="Stock Group Management"
          subtitle="Manage your stock group information and categories"
        />
        <CheckAccess
          module="InventoryManagement"
          subModule="StockGroup"
          type="create"
        >
          <Button
            onClick={() => {
              resetForm();
              setOpen(true);
              if (defaultSelected && companies.length > 0) {
                const selectedCompany = companies.find(
                  (c) => c._id === defaultSelected
                );
                if (selectedCompany) {
                  setFormData((prev) => ({
                    ...prev,
                    companyId: selectedCompany._id,
                  }));
                }
              }
              setOpen(true);
            }}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Layers className="w-4 h-4" />
            Add Group
          </Button>
        </CheckAccess>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Total Groups
                </p>
                <p className="text-2xl font-bold">{stats.totalGroups}</p>
              </div>
              <Layers className="w-6 h-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Primary Groups
                </p>
                <p className="text-2xl font-bold">{stats.primaryGroups}</p>
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
                  Active Groups
                </p>
                <p className="text-2xl font-bold">{stats.activeGroups}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">
                  Inactive Groups
                </p>
                <p className="text-2xl font-bold">{stats.inactiveGroups}</p>
              </div>
              <Building2 className="w-6 h-6 text-teal-200" />
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
          icon={Layers}
          title="No stock groups registered yet"
          description="Create your first stock group to get started"
          buttonLabel="Add Your First Group"
          module="InventoryManagement"
          subModule="StockGroup"
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
            itemName="stock groups"
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
            title={
              editingStockGroup ? "Edit Stock Group" : "Add New Stock Group"
            }
            subtitle={
              editingStockGroup
                ? "Update the stock group details"
                : "Fill in the stock group details and information"
            }
          />

          <div className="space-y-6 py-4">
            <div className="bg-white p-4 rounded-lg">
              {/* <SectionHeader
        icon={<Layers className="w-4 h-4 text-white" />}
        title="Group Information"
        gradientFrom="from-pink-400"
        gradientTo="to-Pink-500"
      />   */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <CustomInputBox
                  placeholder="Group Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  label="Group Name"
                />
                              <SelectedCompany/>
                {/* <div className="flex flex-col gap-1">
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
              </div>

              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Description
                </label>
                <textarea
                  placeholder="Enter group description..."
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1 mb-4">
                <label className="text-sm font-semibold text-gray-700">
                  Parent Group
                </label>
                <select
                  value={formData.stockGroupId || ""}
                  onChange={(e) =>
                    handleSelectChange("stockGroupId", e.target.value)
                  }
                  className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                >
                  <option value="">Primary (No Parent)</option>
                  {stockGroups
                    .filter((g) => g._id !== editingStockGroup?._id)
                    .map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 mb-4">
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
                  {editingStockGroup ? "Update Group" : "Save Group"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockGroupRegistration;
