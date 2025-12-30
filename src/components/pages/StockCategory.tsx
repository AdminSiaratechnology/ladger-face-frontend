import { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import {
  Package,
  Building2,
  FileText,
  Star,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  Calculator,
} from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";
import { useStockCategory } from "../../../store/stockCategoryStore";
import { useCompanyStore } from "../../../store/companyStore";
import { useStockGroup } from "../../../store/stockGroupStore";
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
import TableHeader from "../customComponents/CustomTableHeader";
import PaginationControls from "../customComponents/CustomPaginationControls";
import SectionHeader from "../customComponents/SectionHeader";
import EmptyStateCard from "../customComponents/EmptyStateCard";
import SelectedCompany from "../customComponents/SelectedCompany";
import { set } from "react-hook-form";
import UniversalInventoryDetailsModal from "../customComponents/UniversalInventoryDetailsModal";
import CommonStats from "../customComponents/CommonStats";

// StockCategory interface
interface StockCategory {
  _id: string;
  name: string;
  description: string;
  parent: string;
  status: string;
  createdAt: string;
  companyId: string;
}

interface StockCategoryForm {
  name: string;
  description: string;
  parent: string | null;
  status: string;
  companyId: string;
  code: string | null;
}

const StockCategoryRegistration: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [editingStockCategory, setEditingStockCategory] =
    useState<StockCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<
    "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc"
  >("dateDesc");
  const [filteredStockCategories, setFilteredStockCategories] = useState<
    StockCategory[]
  >([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 12; // Fixed limit per page
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const {
    fetchStockCategory,
    addStockCategory,
    updateStockCategory,
    deleteStockCategory,
    stockCategories,
    pagination,
    counts,
    loading,
    error,
    filterStockCategories,
    initialLoading,
  } = useStockCategory();
  const { companies, defaultSelected } = useCompanyStore();
  const { stockGroups } = useStockGroup();
  const [selectedCategory, setSelectedCatgeory] =
    useState<StockCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleViewCategory = (category: any) => {
    setSelectedCatgeory(category);
    setIsModalOpen(true);
  };
  useEffect(() => {
    setFilteredStockCategories(stockCategories);
  }, [stockCategories]);
  // Initial fetch
  // useEffect(() => {
  //   fetchStockCategory(currentPage, limit,defaultSelected?._id);
  // }, [fetchStockCategory, currentPage, defaultSelected]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length >= 3) {
        filterStockCategories(
          searchTerm,
          statusFilter,
          sortBy,
          currentPage,
          limit,
          defaultSelected?._id
        )
          .then((result) => {
            setFilteredStockCategories(result);
          })
          .catch((err) => {
            console.error("Error filtering stock categories:", err);
          });
      } else if (searchTerm.length === 0) {
        filterStockCategories(
          "",
          statusFilter,
          sortBy,
          currentPage,
          limit,
          defaultSelected?._id
        );
      }
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [
    searchTerm,
    statusFilter,
    sortBy,
    currentPage,
    filterStockCategories,
    defaultSelected,
  ]);

  const [formData, setFormData] = useState<StockCategoryForm>({
    name: "",
    description: "",
    parent: null,
    status: "active",
    companyId: "",
    code: null,
  });

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
    name: keyof StockCategoryForm,
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
      parent: null,
      status: "active",
      companyId: "",
      code: null,
    });
    setEditingStockCategory(null);
  };

  const handleEditStockCategory = (stockCategory: StockCategory): void => {
    setEditingStockCategory(stockCategory);
    setFormData({
      name: stockCategory.name,
      description: stockCategory.description,
      parent: stockCategory.parent,
      status: stockCategory.status,
      companyId: stockCategory.companyId,
      code: stockCategory.code || null,
    });
    setOpen(true);
  };

  const handleDeleteStockCategory = (stockCategoryId: string): void => {
    deleteStockCategory(stockCategoryId);
  };

  const handleSubmit = async (): Promise<void> => {
    if (isSubmitting) return; // ⛔ prevent multiple rapid clicks
    setIsSubmitting(true);
    setShowProgress(true);
    try {
      if (!formData.name.trim()) {
        toast.error("Please enter Stock Category Name");
        return;
      }

      if (editingStockCategory) {
        await updateStockCategory({
          stockCategoryId: editingStockCategory._id,
          data: formData,
        });
        fetchStockCategory(currentPage, limit, defaultSelected?._id);
      } else {
        await addStockCategory(formData);
        fetchStockCategory(currentPage, limit, defaultSelected?._id);
      }

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setShowProgress(false);
    }
  };

  // Statistics calculations
  const stats = useMemo(
    () => ({
      totalCategories: pagination?.total || 0,
      primaryCategories: counts?.totalPrimary,
      activeCategories: counts?.totalActive,
      inactiveCategories: counts?.totalInactive,
    }),
    [filteredStockCategories, pagination, statusFilter]
  );

  // Get company name by ID
  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c._id === companyId);
    return company ? company.namePrint : "Unknown Company";
  };

  // Get stock group name by ID
  const getStockGroupName = (stockGroupId: string) => {
    const stockGroup = stockGroups.find((g) => g._id === stockGroupId);
    return stockGroup ? stockGroup.name : "Unknown Group";
  };

  // Get category name by ID for parent display
  const getCategoryName = (categoryId: string) => {
    const category = stockCategories.find((c) => c._id === categoryId);
    return category ? category.name : categoryId;
  };

  // Table View Component
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader
            headers={[
              "Category",
              "Description",
              "Company",
              "Parent",
              "Created",
              "Status",
              "Actions",
            ]}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStockCategories.map((category) => (
              <tr
                key={category._id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {category.name} <br />
                  <span className="text-gray-500 text-xs">
                    {category?.code}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {category.description || "No description"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="text-sm text-gray-900">
                    {category?.companyId?.namePrint || "—"}
                  </div>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getStockGroupName(category.stockGroupId)}
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.parent === "primary"
                    ? "Primary"
                    : category?.parent?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatSimpleDate(category.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    className={`${
                      category.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {category.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <ActionsDropdown
                    onView={() => handleViewCategory(category)}
                    onEdit={() => handleEditStockCategory(category)}
                    onDelete={() => handleDeleteStockCategory(category._id)}
                    module="InventoryManagement"
                    subModule="StockCategory"
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {filteredStockCategories.map((category) => (
        <Card
          key={category._id}
          className="overflow-hidden shadow-md hover:shadow-lg transition-shadow"
        >
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                {category.name} <br />
                <span className="text-gray-500 text-xs">{category?.code}</span>
              </CardTitle>
              <Badge
                className={`${
                  category.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {category.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              {category.description || "No description"}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                Company: {category?.companyId?.namePrint || "—"}
              </div>
              {/* <div className="flex items-center">
                <Layers className="w-4 h-4 mr-2 text-gray-400" />
                Group: {getStockGroupName(category.stockGroupId)}
              </div> */}
              {/* <div className="flex items-center">
                <Package className="w-4 h-4 mr-2 text-gray-400" />
                Parent:{" "}
                {category.parent === "primary"
                  ? "Primary"
                  : getCategoryName(category.parent)}
              </div> */}
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                Created: {formatSimpleDate(category.createdAt)}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <ActionsDropdown
                onEdit={() => handleEditStockCategory(category)}
                onDelete={() => handleDeleteStockCategory(category._id)}
                module="InventoryManagement"
                subModule="StockCategory"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  useEffect(() => {
    return () => {
      initialLoading();
    };
  }, []);

  const categoryStats = useMemo(
    () => [
      {
        title: "Total Categories",
        value: stats?.totalCategories || 0,
        icon: Package,
        variant: "blue",
      },
      {
        title: "Primary Categories",
        value: stats?.primaryCategories || 0,
        icon: Star,
        variant: "green",
      },
      {
        title: "Active Categories",
        value: stats?.activeCategories || 0,
        variant: "purple",
        showPulse: true, // Pulse animation
      },
      {
        title: "Inactive Categories",
        value: stats?.inactiveCategories || 0,
        icon: Building2,
        variant: "teal",
      },
    ],
    [stats]
  );

  return (
    <div className="custom-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <HeaderGradient
          title="Stock Category Management"
          subtitle="Manage your stock category information and classifications"
        />
        <CheckAccess
          module="InventoryManagement"
          subModule="StockCategory"
          type="create"
        >
          <Button
            onClick={() => {
              resetForm();
              setOpen(true);
              if (defaultSelected && companies.length > 0) {
                setFormData((prev) => ({
                  ...prev,
                  companyId: defaultSelected?._id,
                }));
              }
            }}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Package className="w-4 h-4" />
            Add Category
          </Button>
        </CheckAccess>
      </div>

      {/* Stats Cards */}
      <CommonStats stats={categoryStats} columns={4} loading={loading} />

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

      {!loading &&
        (pagination?.total === 0 ? (
          <EmptyStateCard
            icon={Package}
            title="No categories registered yet"
            description="Create your first category to get started"
            buttonLabel="Add Your First Category"
            module="InventoryManagement"
            subModule="StockCategory"
            type="create"
            onButtonClick={() => setOpen(true)}
          />
        ) : (
          <>
            <ViewModeToggle
              viewMode={viewMode}
              setViewMode={setViewMode}
              totalItems={pagination?.total}
            />
            {viewMode === "table" ? <TableView /> : <CardView />}

            <PaginationControls
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pagination={pagination}
              itemName="stock categories"
            />
          </>
        ))}

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
          {showProgress && (
            <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-200 z-50 overflow-hidden">
              <div className="absolute inset-0 bg-blue-500 animate-progressFlow" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/50 to-blue-400/0 animate-shimmer" />
            </div>
          )}
          <CustomFormDialogHeader
            title={
              editingStockCategory
                ? "Edit Stock Category"
                : "Add New Stock Category"
            }
            subtitle={
              editingStockCategory
                ? "Update the stock category details"
                : "Fill in the stock category details and information"
            }
          />

          <div className="bg-white p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <SelectedCompany />
              <CustomInputBox
                label="Category Code"
                placeholder="e.g., PRD001"
                name="code"
                value={formData.code}
                disabled={true}
                readOnly={true}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <CustomInputBox
                label="Category Name "
                placeholder="e.g., Electronics"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={true}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Parent Category
                </label>
                <select
                  value={formData.parent?._id || formData.parent || ""}
                  onChange={(e) => handleSelectChange("parent", e.target.value)}
                  className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                >
                  <option value={null}>Primary (No Parent)</option>
                  {stockCategories
                    .filter((c) => c._id !== editingStockCategory?._id)
                    .map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Description
              </label>
              <textarea
                placeholder="Enter category description..."
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none transition-all"
              />
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
                disabled={isSubmitting}
                className={`${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                } bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 md:px-8 md:py-3 rounded-lg flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl transition-all text-sm md:text-base`}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingStockCategory
                  ? "Update Category"
                  : "Save Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <UniversalInventoryDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedCategory}
        type="stockCategory" // or "stockGroup" | "stockCategory" | "unit"
      />
    </div>
  );
};

export default StockCategoryRegistration;
