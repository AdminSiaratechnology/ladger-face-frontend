import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import {
  Package,
  Tag,
  Archive,
  Settings2,
  Star,
  Trash2,
  Eye,
  Table,
  Grid3X3,
  Layers,
  Building2,
  FileText,
  Plus,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Heading1,
} from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";
import { useCompanyStore } from "../../../store/companyStore";
import { useGodownStore } from "../../../store/godownStore";
import { useStockCategory } from "../../../store/stockCategoryStore";
import { useStockGroup } from "../../../store/stockGroupStore";
import { useUOMStore } from "../../../store/uomStore";
import { useProductStore } from "../../../store/productStore";
import FilterBar from "../customComponents/FilterBar";
import HeaderGradient from "../customComponents/HeaderGradint";
import { CheckAccess } from "../customComponents/CheckAccess";
import ActionsDropdown from "../customComponents/ActionsDropdown";
import useUnsavedChangesWarning from "../../lib/hooks/useUnsavedChangesWarning";
import { TableViewSkeleton } from "../customComponents/TableViewSkeleton";
// import CustomFormDialogHeader from "../customComponents/CustomFormDialogHeader";
import MultiStepNav from "../customComponents/MultiStepNav";
import CustomStepNavigation from "../customComponents/CustomStepNavigation";
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";
import ViewModeToggle from "../customComponents/ViewModeToggle";
import PaginationControls from "../customComponents/CustomPaginationControls";
import TableHeader from "../customComponents/CustomTableHeader";
import SectionHeader from "../customComponents/SectionHeader";
import EmptyStateCard from "../customComponents/EmptyStateCard";
import ImagePreviewDialog from "../customComponents/ImagePreviewDialog";
import SelectedCompany from "../customComponents/SelectedCompany";
import { useVendorStore } from "../../../store/vendorStore";
import { DatePickerField } from "../customComponents/DatePickerField";
import UniversalProductDetailsModal from "../customComponents/UniversalProductDetailsModal";

// Interfaces
interface Unit {
  id: number;
  name: string;
  type: "simple" | "compound";
  symbol?: string;
  decimalPlaces?: number;
  firstUnit?: string;
  conversion?: number;
  secondUnit?: string;
  createdAt: string;
}

interface TaxConfiguration {
  applicable: boolean;
  hsnCode: string;
  taxPercentage: number;
  cgst: number;
  sgst: number;
  cess: number;
  additionalCess: number;
  applicableDate: string;
}

interface ProductImage {
  id: number;
  angle: string;
  file: File;
  previewUrl: string;
}

interface OpeningQuantity {
  id: number;
  godown: string;
  batch: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Product {
  id: number;
  _id?: string;
  code: string;
  name: string;
  partNo: string;
  stockGroup: string;
  stockCategory: string;
  batch: boolean;
  unit: string;
  alternateUnit: string;
  createdAt: string;
  openingQuantities?: OpeningQuantity[];
  minimumQuantity?: number;
  defaultSupplier?: string;
  minimumRate?: number;
  companyId?: string;
  maximumRate?: number;
  defaultGodown?: string;
  productType?: string;
  taxConfiguration?: TaxConfiguration;
  images?: ProductImage[];
  remarks?: string;
  isDeleted: boolean;
  status: string;
}

interface ProductForm {
  code: string;
  name: string;
  partNo: string;
  stockGroup: string;
  stockCategory: string;
  batch: boolean;
  unit: string;
  alternateUnit: string;
  minimumQuantity?: number;
  defaultSupplier?: string;
  minimumRate?: number;
  maximumRate?: number;
  companyId?: string | null;
  defaultGodown?: string;
  productType?: string;
  taxConfiguration: TaxConfiguration;
  images: ProductImage[];
  remarks: string;
  status: string;
}

interface Supplier {
  id: number;
  name: string;
  code: string;
}

const stepIcons = {
  basic: <Package className="w-2 h-2 md:w-5 md:h-5" />,
  tax: <FileText className="w-2 h-2 md:w-5 md:h-5" />,
  opening: <Star className="w-2 h-2 md:w-5 md:h-5" />,
  settings: <Settings2 className="w-2 h-2 md:w-5 md:h-5" />,
};

const ProductPage: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  useUnsavedChangesWarning(isFormDirty);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [openingQuantities, setOpeningQuantities] = useState<OpeningQuantity[]>(
    [{ id: 1, godown: "", batch: "", quantity: 0, rate: 0, amount: 0 }]
  );
  const [totalOpeningQuantity, setTotalOpeningQuantity] = useState<number>(0);
  const [usedQuantity, setUsedQuantity] = useState<number>(0);
  const [remainingQuantity, setRemainingQuantity] = useState<number>(0);
  const [viewingImage, setViewingImage] = useState<ProductImage | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<
    "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc"
  >("dateDesc");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  const { companies, defaultSelected } = useCompanyStore();
  const { godowns } = useGodownStore();
  const { stockCategories } = useStockCategory();
  const { stockGroups } = useStockGroup();
  const { units } = useUOMStore();
  const {
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    products,
    filterProducts,
    pagination,
    loading,
    resetProductStore,
    initialLoading,
  } = useProductStore();
  const { vendors } = useVendorStore();
  const [country] = useState<string>("india");
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState<ProductForm>({
    code: "",
    name: "",
    partNo: "",
    stockGroup: "",
    stockCategory: "",
    batch: false,
    unit: "",
    alternateUnit: "",
    minimumQuantity: 0,
    defaultSupplier: "",
    minimumRate: 0,
    maximumRate: 0,
    companyId: defaultSelected?._id,
    defaultGodown: "",
    productType: "",
    taxConfiguration: {
      applicable: false,
      hsnCode: "",
      taxPercentage: 0,
      cgst: 0,
      sgst: 0,
      cess: 0,
      additionalCess: 0,
      applicableDate: today,
    },
    images: [],
    remarks: "",
    status: "active",
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  useEffect(() => {
    if (defaultSelected) {
      setFormData((prev) => ({ ...prev, companyId: defaultSelected?._id }));
    }
  }, [defaultSelected, companies]);
  useEffect(() => {
    // Cleanup when leaving the page_
    return () => {
      resetProductStore();
    };
  }, [resetProductStore]);
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);
  // Initial fetch
  // useEffect(() => {
  //   fetchProducts(currentPage, limit, defaultSelected?._id);
  // }, [fetchProducts, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length >= 3) {
        filterProducts(
          searchTerm,
          statusFilter,
          sortBy,
          currentPage,
          limit,
          defaultSelected?._id
        )
          .then((result) => {
            setFilteredProducts(result);
          })
          .catch((err) => {
            console.error("Error filtering products:", err);
          });
      } else if (searchTerm.length === 0) {
        filterProducts(
          "",
          statusFilter,
          sortBy,
          currentPage,
          limit,
          defaultSelected?._id
        );
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [
    searchTerm,
    statusFilter,
    sortBy,
    currentPage,
    filterProducts,
    defaultSelected,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setIsFormDirty(true);
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (name: keyof ProductForm, value: string): void => {
    setIsFormDirty(true);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "companyId") {
      localStorage.setItem("selectedCompanyId", value);
    }
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    const newValue =
      type === "checkbox" ? checked : type === "number" ? Number(value) : value;
    setIsFormDirty(true);

    setFormData((prev) => {
      const updatedTaxConfig = {
        ...prev.taxConfiguration,
        [name]: newValue,
      };

      if (name === "taxPercentage" && country.toLowerCase() === "india") {
        const taxPercent = Number(value);
        updatedTaxConfig.cgst = taxPercent / 2;
        updatedTaxConfig.sgst = taxPercent / 2;
      }

      return {
        ...prev,
        taxConfiguration: updatedTaxConfig,
      };
    });
  };

  const isTaxValid = (): boolean => {
    const { cgst, sgst, taxPercentage } = formData.taxConfiguration;
    return cgst + sgst <= taxPercentage;
  };

  const addOpeningQuantityRow = () => {
    setIsFormDirty(true);
    setOpeningQuantities((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        godown: "",
        batch: "",
        quantity: 0,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const handleOpeningQuantityChange = (
    id: number,
    field: keyof OpeningQuantity,
    value: string | number
  ) => {
    setIsFormDirty(true);
    if (field === "quantity") {
      const currentRow = openingQuantities.find((item) => item.id === id);
      const currentQuantity = currentRow ? currentRow.quantity : 0;
      const newQuantity = Number(value);
      const quantityChange = newQuantity - currentQuantity;

      if (quantityChange > remainingQuantity) {
        toast.error("Quantity exceeds remaining opening quantity");
        return;
      }
    }

    setOpeningQuantities((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = {
            ...item,
            [field]: value,
          };
          if (field === "quantity" || field === "rate") {
            updatedItem.amount =
              Number(updatedItem.quantity) * Number(updatedItem.rate);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const removeOpeningQuantityRow = (id: number) => {
    if (openingQuantities.length > 1) {
      setIsFormDirty(true);
      setOpeningQuantities((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleProductImageUpload = (
    imageType: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsFormDirty(true);
      const previewUrl = URL.createObjectURL(file);
      const newImage: ProductImage = {
        id: Date.now(),
        angle: imageType,
        file,
        previewUrl,
      };
      setFormData((prev) => ({
        ...prev,
        images: [
          ...prev.images.filter((img) => img.angle !== imageType),
          newImage,
        ],
      }));
    }
  };

  const removeProductImage = (id: number) => {
    setIsFormDirty(true);
    const imageToRemove = formData.images.find((img) => img.id === id);
    if (
      imageToRemove &&
      imageToRemove.previewUrl &&
      imageToRemove.previewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  const cleanupImageUrls = (): void => {
    formData.images.forEach((img) => {
      if (img.previewUrl && img.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
  };

  const resetForm = () => {
    const today = new Date().toISOString().split("T")[0];
    cleanupImageUrls();
    setFormData({
      code: "",
      name: "",
      partNo: "",
      stockGroup: "",
      stockCategory: "",
      batch: false,
      unit: "",
      alternateUnit: "",
      minimumQuantity: 0,
      defaultSupplier: "",
      minimumRate: 0,
      maximumRate: 0,
      companyId: defaultSelected?._id,
      defaultGodown: "",
      productType: "",
      taxConfiguration: {
        applicable: false,
        hsnCode: "",
        taxPercentage: 0,
        cgst: 0,
        sgst: 0,
        cess: 0,
        additionalCess: 0,
        applicableDate: today,
      },
      images: [],
      remarks: "",
      status: "active",
    });
    setEditingProduct(null);
    setOpeningQuantities([
      { id: 1, godown: "", batch: "", quantity: 0, rate: 0, amount: 0 },
    ]);
    setTotalOpeningQuantity(0);
    setActiveTab("basic");
    setIsFormDirty(false);
  };

  const handleEditProduct = (product: Product): void => {
    const today = new Date().toISOString().split("T")[0];
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      partNo: product.partNo,
      stockGroup: product.stockGroup?._id,
      stockCategory: product.stockCategory?._id,
      batch: product.batch,
      unit: product.unit?._id,
      alternateUnit: product.alternateUnit,
      minimumQuantity: product.minimumQuantity || 0,
      defaultSupplier: product.defaultSupplier || "",
      minimumRate: product.minimumRate || 0,
      maximumRate: product.maximumRate || 0,
      companyId: product.companyId?._id || "",
      defaultGodown: product.defaultGodown || "",
      productType: product.productType || "",
      taxConfiguration: product.taxConfiguration || {
        applicable: false,
        hsnCode: "",
        taxPercentage: 0,
        cgst: 0,
        sgst: 0,
        cess: 0,
        additionalCess: 0,
        applicableDate: today,
      },
      images: product.images || [],
      remarks: product.remarks || "",
      status: product.status || "active",
    });
    if (product.openingQuantities && product.openingQuantities.length > 0) {
      setOpeningQuantities(product.openingQuantities);
      const totalQty = product.openingQuantities.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      setTotalOpeningQuantity(totalQty);
    }
    setOpen(true);
    setIsFormDirty(false);
  };

  const handleDeleteProduct = (id: string): void => {
    deleteProduct(id);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!formData.code.trim()) {
      toast.error("Please enter Product Code");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Please enter Product Name");
      return;
    }
    if (!formData.companyId) {
      toast.error("Please select Company");
      return;
    }
    if (formData.taxConfiguration.applicable && !isTaxValid()) {
      toast.error("CGST + SGST cannot exceed the tax percentage");
      return;
    }
    if (remainingQuantity < 0) {
      toast.error(
        "Total quantity in the table exceeds the available opening quantity"
      );
      return;
    }

    const productFormData = new FormData();
    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof ProductForm];
      if (key === "images" || key === "taxConfiguration") return;
      if (value !== null && value !== undefined && value !== "") {
        productFormData.append(key, String(value));
      }
    });
    productFormData.append(
      "taxConfiguration",
      JSON.stringify(formData.taxConfiguration)
    );
    const validOpeningQuantities = openingQuantities.filter(
      (q) => q.godown && (q.quantity > 0 || q.rate > 0)
    );
    productFormData.append(
      "openingQuantities",
      JSON.stringify(validOpeningQuantities)
    );
    formData.images.forEach((image) => {
      productFormData.append("productImages", image.file);
    });
    productFormData.append(
      "productImageTypes",
      JSON.stringify(formData.images.map((img) => img.angle))
    );
    productFormData.append(
      "productImagesCount",
      String(formData.images.length)
    );

    if (editingProduct) {
      await updateProduct({
        id: editingProduct._id || "",
        product: productFormData,
      });
      await fetchProducts(currentPage, limit, defaultSelected?._id);
    } else {
      await addProduct(productFormData);
      await fetchProducts(currentPage, limit, defaultSelected?._id);
    }
    setOpen(false);
    resetForm();
  };

  useEffect(() => {
    const used = openingQuantities.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    setUsedQuantity(used);
    setRemainingQuantity(totalOpeningQuantity - used);
  }, [openingQuantities, totalOpeningQuantity]);

  const getCompanyName = (companyId: string) => {
    const company = companies?.find((c) => c._id === companyId);
    return company ? company?.namePrint : "Unknown Company";
  };

  const getStockGroupName = (stockGroupId: string) => {
    const stockGroup = stockGroups?.find((g) => g._id === stockGroupId);
    return stockGroup ? stockGroup?.name : stockGroupId;
  };

  const getCategoryName = (categoryId: string) => {
    const category = stockCategories?.find((c) => c._id === categoryId);
    return category ? category?.name : categoryId;
  };

  const getUnitName = (unitId: string) => {
    const unit = units?.find((u) => u?._id === unitId);
    return unit ? unit.name : unitId;
  };

  const getMaintainGodownStatus = (companyId: string) => {
    const company = companies?.find((c) => c._id === companyId);
    return company ? company?.maintainGodown : false;
  };

  const getMaintainBatchStatus = (companyId: string) => {
    const company = companies?.find((c) => c._id === companyId);
    return company ? company?.maintainBatch : false;
  };

  const selectedCompanyId = defaultSelected?._id;

  const stats = useMemo(
    () => ({
      totalProducts: pagination?.total || 0,
      activeProducts:
        statusFilter === "active"
          ? pagination?.total
          : filteredProducts?.filter((p) => p.status === "active").length || 0,
      batchProducts: filteredProducts?.filter((p) => p.batch).length || 0,
      taxableProducts:
        filteredProducts?.filter((p) => p.taxConfiguration?.applicable)
          .length || 0,
    }),
    [filteredProducts, pagination, statusFilter]
  );

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "tax", label: "Tax" },
    { id: "opening", label: "Opening" },
    { id: "settings", label: "Settings" },
  ];
  const headers = [
    "Product",
    "Details",
    "Company",
    "Stock Group",
    "Category",
    "Status",
    "Actions",
  ];

  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader headers={headers} />

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => {
              return (
                <tr
                  key={product._id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-4">
                    <div className="flex items-center">
                      <Package className="h-10 w-10 text-teal-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-teal-600">
                          {product.code}
                        </div>
                        {product.partNo && (
                          <div className="text-xs text-gray-500">
                            Part: {product.partNo}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className=" py-4  whitespace-nowrap">
                    <div className="text-sm text-gray-900 space-y-1">
                      <div className="flex items-center">
                        <Archive className="w-3 h-3 text-gray-400 mr-2" />
                        <span>Unit: {getUnitName(product?.unit?.name)}</span>
                      </div>
                      {product?.minimumQuantity &&
                        product?.minimumQuantity > 0 && (
                          <div className="flex items-center">
                            <Settings2 className="w-3 h-3 text-gray-400 mr-2" />
                            <span>Min Qty: {product?.minimumQuantity}</span>
                          </div>
                        )}
                      <div className="flex items-center">
                        <Tag className="w-3 h-3 text-gray-400 mr-2" />
                        <span>Batch: {product?.batch ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product?.companyId?.namePrint || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getStockGroupName(product?.stockGroup?.name)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getCategoryName(product?.stockCategory?.name)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={`${
                        product.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      } hover:bg-current`}
                    >
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CheckAccess
                      module="InventoryManagement"
                      subModule="Product"
                      type="update"
                    >
                      <ActionsDropdown
                        onView={() => handleViewProduct(product)}
                        onEdit={() => handleEditProduct(product)}
                        onDelete={() => handleDeleteProduct(product._id || "")}
                        module="InventoryManagement"
                        subModule="Product"
                      />
                    </CheckAccess>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredProducts.map((product: Product) => (
        <Card
          key={product._id}
          className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
        >
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                  {product.name}
                </CardTitle>
                <p className="text-teal-600 font-medium">{product.code}</p>
                {product.partNo && (
                  <p className="text-sm text-gray-600 mt-1">
                    Part No: {product.partNo}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${
                    product.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  } hover:bg-current`}
                >
                  {product.status}
                </Badge>
                <CheckAccess
                  module="InventoryManagement"
                  subModule="product"
                  type="update"
                >
                  <ActionsDropdown
                    onEdit={() => handleEditProduct(product)}
                    onDelete={() => handleDeleteProduct(product._id || "")}
                    module="InventoryManagement"
                    subModule="product"
                  />
                </CheckAccess>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Building2 className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">
                  Company: {product?.companyId?.namePrint || "—"}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Layers className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">
                  Group: {getStockGroupName(product?.stockGroup?.name)}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Package className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">
                  Category: {getCategoryName(product?.stockCategory?.name)}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Archive className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">
                  Unit: {getUnitName(product?.unit?.name)}
                </span>
              </div>
              {product.minimumQuantity && product.minimumQuantity > 0 && (
                <div className="flex items-center text-sm">
                  <Settings2 className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">
                    Min Qty: {product.minimumQuantity}
                  </span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Tag className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">
                  Batch: {product.batch ? "Yes" : "No"}
                </span>
              </div>
              {product.taxConfiguration?.applicable && (
                <div className="flex items-center text-sm">
                  <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">
                    Tax: {product.taxConfiguration.taxPercentage}%
                  </span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">
                  Created: {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
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

  return (
    <div className="custom-container">
      <div className="flex justify-between items-center mb-4">
        <HeaderGradient
          title="Product Management"
          subtitle="Manage your product inventory and details"
        />
        <CheckAccess
          module="InventoryManagement"
          subModule="Product"
          type="create"
        >
          <Button
            onClick={() => {
              resetForm();
              setOpen(true);
              useEffect(() => {
                if (defaultSelected) {
                  setFormData((prev) => ({
                    ...prev,
                    companyId: defaultSelected?._id,
                  }));
                }
              }, [defaultSelected, companies]);
            }}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Package className="w-4 h-4" />
            Add Product
          </Button>
        </CheckAccess>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">
                  Total Products
                </p>
                <p className="text-2xl font-bold">{stats?.totalProducts}</p>
              </div>
              <Package className="w-6 h-6 text-teal-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Active Products
                </p>
                <p className="text-2xl font-bold">{stats?.activeProducts}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Batch Managed
                </p>
                <p className="text-2xl font-bold">{stats?.batchProducts}</p>
              </div>
              <Tag className="w-6 h-6 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  Taxable Products
                </p>
                <p className="text-2xl font-bold">{stats.taxableProducts}</p>
              </div>
              <FileText className="w-6 h-6 text-purple-200" />
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
          icon={Package}
          title="No products registered yet"
          description="Create your first product to get started"
          buttonLabel="Add Your First Product"
          module="InventoryManagement"
          subModule="product"
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
            itemName="products"
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
            title={editingProduct ? "Edit Product" : "Add New Product"}
            subtitle={
              editingProduct
                ? "Update the product details"
                : "Complete product registration information"
            }
          />
          <MultiStepNav
            steps={tabs}
            currentStep={activeTab}
            onStepChange={(nextTab) => {
              const stepOrder = ["basic", "tax", "opening", "settings"];
              const currentIndex = stepOrder.indexOf(activeTab);
              const nextIndex = stepOrder.indexOf(nextTab);

              if (nextIndex < currentIndex) {
                setActiveTab(nextTab);
              }
              if (activeTab === "basic") {
                if (!formData.code.trim() || !formData.name.trim()) {
                  toast.error("Please enter Product Code and Name");
                  return;
                }
              }
              setActiveTab(nextTab);
            }}
            stepIcons={stepIcons}
          />
          <div className="flex-1 overflow-y-auto">
            {activeTab === "basic" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                {/* <SectionHeader
                  icon={<Package className="w-4 h-4 text-white" />}
                  title="Product Information"
                  gradientFrom="from-pink-400"
                  gradientTo="to-pink-500"
                /> */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomInputBox
                    label="Product Code"
                    placeholder="e.g., PRD001"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required={true}
                  />
                  <CustomInputBox
                    label="Product Name"
                    placeholder="e.g., Widget A"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={true}
                  />
                  <CustomInputBox
                    label="Part Number"
                    placeholder="e.g., PART123"
                    name="partNo"
                    value={formData.partNo}
                    onChange={handleChange}
                  />
                  <div className="flex flex-col gap-1">
                    <SelectedCompany />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Stock Group
                    </label>
                    <select
                      value={formData.stockGroup}
                      onChange={(e) =>
                        handleSelectChange("stockGroup", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Stock Group</option>
                      {stockGroups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Stock Category
                    </label>
                    <select
                      value={formData.stockCategory}
                      onChange={(e) =>
                        handleSelectChange("stockCategory", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Stock Category</option>
                      {stockCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        if (selectedValue === formData.alternateUnit) {
                          alert("Unit and Alternate Unit cannot be the same.");
                          return;
                        }
                        handleSelectChange("unit", selectedValue);
                      }}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg 
               focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
               focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Unit</option>
                      {units.map((unit) => (
                        <option key={unit._id} value={unit._id}>
                          {unit.name} {unit.symbol && `(${unit.symbol})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Alternate Unit
                    </label>
                    <select
                      value={formData.alternateUnit}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        if (selectedValue === formData.unit) {
                          toast.error(
                            "Alternate Unit and Unit cannot be the same."
                          );
                          return;
                        }
                        handleSelectChange("alternateUnit", selectedValue);
                      }}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg 
               focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
               focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Alternate Unit</option>
                      {units.map((unit) => (
                        <option key={unit._id} value={unit._id}>
                          {unit.name} {unit.symbol && `(${unit.symbol})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <CustomInputBox
                    label="Minimum Quantity"
                    placeholder="e.g., 100"
                    name="minimumQuantity"
                    value={formData.minimumQuantity}
                    onChange={handleChange}
                    type="number"
                    min="0"
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Default Supplier
                    </label>
                    <select
                      value={formData.defaultSupplier}
                      onChange={(e) =>
                        handleSelectChange("defaultSupplier", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Default Supplier</option>
                      {vendors.map((supplier) => (
                        <option key={supplier.id} value={supplier.vendorName}>
                          {supplier.vendorName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <CustomInputBox
                    label="Minimum Rate"
                    placeholder="e.g., 10.00"
                    name="minimumRate"
                    value={formData.minimumRate}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="0.01"
                  />
                  <CustomInputBox
                    label="Maximum Rate"
                    placeholder="e.g., 20.00"
                    name="maximumRate"
                    value={formData.maximumRate}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="0.01"
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Default Godown
                    </label>
                    <select
                      value={formData.defaultGodown}
                      onChange={(e) =>
                        handleSelectChange("defaultGodown", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Default Godown</option>
                      {godowns.map((godown) => (
                        <option key={godown._id} value={godown._id}>
                          {godown.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Product Type
                    </label>
                    <select
                      value={formData.productType}
                      onChange={(e) =>
                        handleSelectChange("productType", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Product Type</option>
                      <option value="select">Goods</option>
                      <option value="godown">Services</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        handleSelectChange("status", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="mt-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="batch"
                        checked={formData.batch}
                        onChange={handleChange}
                        className="mr-3 h-5 w-5 rounded border-2 border-gray-300 focus:ring-blue-500"
                      />
                      Batch Managed
                    </label>
                  </div>
                </div>
                <CustomStepNavigation
                  currentStep={1}
                  totalSteps={4}
                  showPrevious={false}
                  onNext={() => {
                    if (!formData.code.trim() || !formData.name.trim()) {
                      toast.error("Please enter Product Code and Name");
                      return;
                    }
                    setActiveTab("tax");
                  }}
                  onSubmit={handleSubmit}
                />
              </div>
            )}
            {activeTab === "tax" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Tax Applicability
                    </label>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="tax-applicable"
                          name="applicable"
                          checked={formData.taxConfiguration.applicable}
                          onChange={() =>
                            handleTaxChange({
                              target: {
                                name: "applicable",
                                value: true,
                                type: "checkbox",
                                checked: true,
                              },
                            } as React.ChangeEvent<HTMLInputElement>)
                          }
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                        />
                        <label
                          htmlFor="tax-applicable"
                          className="text-sm font-medium text-green-700"
                        >
                          Applicable
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="tax-not-applicable"
                          name="applicable"
                          checked={!formData.taxConfiguration.applicable}
                          onChange={() =>
                            handleTaxChange({
                              target: {
                                name: "applicable",
                                value: false,
                                type: "checkbox",
                                checked: false,
                              },
                            } as React.ChangeEvent<HTMLInputElement>)
                          }
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                        />
                        <label
                          htmlFor="tax-not-applicable"
                          className="text-sm font-medium text-red-700"
                        >
                          Not Applicable
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                {formData.taxConfiguration.applicable && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomInputBox
                        label="HSN Code"
                        placeholder="e.g., 12345678"
                        name="hsnCode"
                        value={formData.taxConfiguration.hsnCode}
                        onChange={handleTaxChange}
                      />
                      <CustomInputBox
                        label="Tax Percentage (%)"
                        placeholder="e.g., 18"
                        name="taxPercentage"
                        value={formData.taxConfiguration.taxPercentage}
                        onChange={handleTaxChange}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                    {country.toLowerCase() === "india" && (
                      <div>
                        <h4 className="text-md font-semibold text-teal-700 mb-3 flex items-center">
                          <Archive className="w-4 h-4 mr-2" />
                          India Tax Breakdown
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <CustomInputBox
                            label="CGST (%)"
                            placeholder="e.g., 9"
                            name="cgst"
                            value={formData.taxConfiguration.cgst}
                            onChange={handleTaxChange}
                            type="number"
                            min="0"
                            max="50"
                            step="0.01"
                          />
                          <CustomInputBox
                            label="SGST (%)"
                            placeholder="e.g., 9"
                            name="sgst"
                            value={formData.taxConfiguration.sgst}
                            onChange={handleTaxChange}
                            type="number"
                            min="0"
                            max="50"
                            step="0.01"
                          />
                          <CustomInputBox
                            label="Cess (%)"
                            placeholder="e.g., 0"
                            name="cess"
                            value={formData.taxConfiguration.cess}
                            onChange={handleTaxChange}
                            type="number"
                            min="0"
                            step="0.01"
                          />
                          <CustomInputBox
                            label="Additional Cess (%)"
                            placeholder="e.g., 0"
                            name="additionalCess"
                            value={formData.taxConfiguration.additionalCess}
                            onChange={handleTaxChange}
                            type="number"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        {formData.taxConfiguration.cgst +
                          formData.taxConfiguration.sgst >
                          formData.taxConfiguration.taxPercentage && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-700 text-sm font-medium">
                              Warning: CGST + SGST (
                              {formData.taxConfiguration.cgst +
                                formData.taxConfiguration.sgst}
                              %) exceeds Tax Percentage (
                              {formData.taxConfiguration.taxPercentage}%)
                            </p>
                          </div>
                        )}
                        <div className="mt-4 p-3 bg-blue-50 border border-teal-200 rounded-md">
                          <p className="text-teal-700 text-sm font-medium mb-2">
                            Tax Summary:
                          </p>
                          <div className="text-sm text-teal-600 space-y-1">
                            <div className="flex justify-between">
                              <span>CGST:</span>
                              <span>{formData.taxConfiguration.cgst}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>SGST:</span>
                              <span>{formData.taxConfiguration.sgst}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cess:</span>
                              <span>{formData.taxConfiguration.cess}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Additional Cess:</span>
                              <span>
                                {formData.taxConfiguration.additionalCess}%
                              </span>
                            </div>
                            <div className="flex justify-between font-semibold border-t border-teal-300 pt-1">
                              <span>Total:</span>
                              <span>
                                {formData.taxConfiguration.cgst +
                                  formData.taxConfiguration.sgst +
                                  formData.taxConfiguration.cess +
                                  formData.taxConfiguration.additionalCess}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <DatePickerField
                      label="Tax Applicable Date"
                      name="applicableDate"
                      value={formData.taxConfiguration.applicableDate}
                      onChange={handleTaxChange}
                    />
                  </div>
                )}
                {!formData.taxConfiguration.applicable && (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">
                        Tax Not Applicable
                      </p>
                      <p className="text-gray-400 text-sm">
                        This product is not subject to tax
                      </p>
                    </div>
                  </div>
                )}
                <CustomStepNavigation
                  currentStep={2}
                  totalSteps={4}
                  onPrevious={() => setActiveTab("basic")}
                  onNext={() => setActiveTab("opening")}
                  nextDisabled={
                    formData.taxConfiguration.applicable && !isTaxValid()
                  }
                  onSubmit={handleSubmit}
                />
              </div>
            )}
            {activeTab === "opening" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                {/* <SectionHeader
                  icon={<Star className="w-4 h-4 text-white" />}
                  title="Opening Stock Details"
                  gradientFrom="from-blue-400"
                  gradientTo="to-blue-500"
                /> */}
                <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Total Opening Quantity
                    </label>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-teal-600">
                        Used:{" "}
                        <span className="font-semibold">{usedQuantity}</span>
                      </span>
                      <span className="text-sm text-teal-600">
                        Remaining:{" "}
                        <span
                          className={`font-semibold ${
                            remainingQuantity < 0 ? "text-red-600" : ""
                          }`}
                        >
                          {remainingQuantity}
                        </span>
                      </span>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={totalOpeningQuantity}
                    onChange={(e) => {
                      setIsFormDirty(true);
                      setTotalOpeningQuantity(
                        Math.max(0, Number(e.target.value))
                      );
                    }}
                    min="0"
                    step="1"
                    className="w-full h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    placeholder="Enter total opening quantity"
                  />
                  {remainingQuantity < 0 && (
                    <p className="text-red-500 text-sm mt-2">
                      The total quantity in the table exceeds the available
                      opening quantity.
                    </p>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-teal-50">
                        {getMaintainGodownStatus(selectedCompanyId || "") && (
                          <th className="p-2 border border-teal-200 text-left text-sm font-semibold text-gray-700">
                            Godown
                          </th>
                        )}
                        {getMaintainBatchStatus(selectedCompanyId || "") &&
                          formData.batch && (
                            <th className="p-2 border border-teal-200 text-left text-sm font-semibold text-gray-700">
                              Batch
                            </th>
                          )}
                        <th className="p-2 border border-teal-200 text-left text-sm font-semibold text-gray-700">
                          Quantity
                        </th>
                        <th className="p-2 border border-teal-200 text-left text-sm font-semibold text-gray-700">
                          Rate
                        </th>
                        <th className="p-2 border border-teal-200 text-left text-sm font-semibold text-gray-700">
                          Amount
                        </th>
                        <th className="p-2 border border-teal-200 text-left text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {openingQuantities.map((item) => (
                        <tr key={item.id}>
                          {getMaintainGodownStatus(selectedCompanyId || "") && (
                            <td className="p-2 border border-teal-200">
                              <select
                                value={item.godown}
                                onChange={(e) =>
                                  handleOpeningQuantityChange(
                                    item.id,
                                    "godown",
                                    e.target.value
                                  )
                                }
                                className="w-full h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                              >
                                <option value="">Select Godown</option>
                                {godowns.map((godown) => (
                                  <option key={godown._id} value={godown._id}>
                                    {godown.name} ({godown.code})
                                  </option>
                                ))}
                              </select>
                            </td>
                          )}
                          {getMaintainBatchStatus(selectedCompanyId || "") &&
                            formData.batch && (
                              <td className="p-2 border border-teal-200">
                                <input
                                  type="text"
                                  value={item.batch || ""}
                                  onChange={(e) =>
                                    handleOpeningQuantityChange(
                                      item.id,
                                      "batch",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter batch number"
                                  className="w-full h-11 px-4 py-2 border-2 border-gray-300 rounded-lg 
                 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                 focus:outline-none bg-white transition-all"
                                />
                              </td>
                            )}
                          <td className="p-2 border border-teal-200">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleOpeningQuantityChange(
                                  item.id,
                                  "quantity",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                              min="0"
                              step="0.01"
                              max={item.quantity + remainingQuantity}
                            />
                          </td>
                          <td className="p-2 border border-teal-200">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) =>
                                handleOpeningQuantityChange(
                                  item.id,
                                  "rate",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                              min="0"
                              step="1"
                            />
                          </td>
                          <td className="p-2 border border-teal-200">
                            <input
                              type="number"
                              value={item.amount.toFixed(2)}
                              readOnly
                              className="w-full h-11 px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100"
                            />
                          </td>
                          <td className="p-2 border border-teal-200">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeOpeningQuantityRow(item.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              disabled={openingQuantities.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button
                  onClick={addOpeningQuantityRow}
                  variant="outline"
                  className="mt-4 flex items-center"
                  disabled={remainingQuantity <= 0}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Row
                </Button>
                <CustomStepNavigation
                  currentStep={3}
                  totalSteps={4}
                  onPrevious={() => setActiveTab("tax")}
                  onNext={() => setActiveTab("settings")}
                  nextDisabled={remainingQuantity < 0}
                  onSubmit={handleSubmit}
                />
              </div>
            )}
            {activeTab === "settings" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                {/* <SectionHeader
                  icon={<Settings2 className="w-4 h-4 text-white" />}
                  title="Product Settings"
                  gradientFrom="from-cyan-400"
                  gradientTo="to-cyan-500"
                /> */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    Product Images
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {["Front", "Back", "Left", "Right", "Top", "Bottom"].map(
                      (imageType) => (
                        <div
                          key={imageType}
                          className="p-4 bg-white rounded-lg border border-teal-200"
                        >
                          <p className="text-sm font-medium text-teal-700 mb-2">
                            {imageType} View
                          </p>
                          <div className="flex items-center justify-between">
                            <input
                              type="file"
                              id={`${imageType.toLowerCase()}-image`}
                              className="hidden"
                              onChange={(e) =>
                                handleProductImageUpload(imageType, e)
                              }
                              accept="image/*"
                            />
                            <label
                              htmlFor={`${imageType.toLowerCase()}-image`}
                              className="px-4 py-2 bg-teal-50 text-teal-700 rounded-md cursor-pointer hover:bg-teal-100 transition-colors flex items-center"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </label>
                            {formData.images.find(
                              (img) => img.angle === imageType
                            ) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeProductImage(
                                    formData.images.find(
                                      (img) => img.angle === imageType
                                    )!.id
                                  )
                                }
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          {formData.images.find(
                            (img) => img.angle === imageType
                          ) && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 truncate">
                                {
                                  formData.images.find(
                                    (img) => img.angle === imageType
                                  )?.file?.name
                                }
                              </p>
                              {formData.images.find(
                                (img) => img.angle === imageType
                              )?.previewUrl && (
                                <div className="mt-2">
                                  <img
                                    src={
                                      formData.images.find(
                                        (img) => img.angle === imageType
                                      )?.previewUrl
                                    }
                                    alt={`${imageType} view`}
                                    className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-75"
                                    onClick={() =>
                                      setViewingImage(
                                        formData.images.find(
                                          (img) => img.angle === imageType
                                        )!
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Product Remarks
                  </p>
                  <textarea
                    placeholder="Add any additional remarks about the product..."
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none transition-all"
                  />
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Code:</strong> {formData.code || "Not specified"}
                    </p>
                    <p>
                      <strong>Name:</strong> {formData.name || "Not specified"}
                    </p>
                    <p>
                      <strong>Part No:</strong>{" "}
                      {formData.partNo || "Not specified"}
                    </p>
                    <p>
                      <strong>Company:</strong>{" "}
                      {getCompanyName(formData.companyId || "")}
                    </p>
                    <p>
                      <strong>Stock Group:</strong>{" "}
                      {getStockGroupName(formData.stockGroup)}
                    </p>
                    <p>
                      <strong>Category:</strong>{" "}
                      {getCategoryName(formData.stockCategory)}
                    </p>
                    <p>
                      <strong>Unit:</strong> {getUnitName(formData.unit)}
                    </p>
                    <p>
                      <strong>Batch Managed:</strong>{" "}
                      {formData.batch ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Tax Applicable:</strong>{" "}
                      {formData.taxConfiguration.applicable ? "Yes" : "No"}
                    </p>
                    {formData.taxConfiguration.applicable && (
                      <>
                        <p>
                          <strong>HSN Code:</strong>{" "}
                          {formData.taxConfiguration.hsnCode || "Not specified"}
                        </p>
                        <p>
                          <strong>Tax Percentage:</strong>{" "}
                          {formData.taxConfiguration.taxPercentage}%
                        </p>
                        {country.toLowerCase() === "india" && (
                          <>
                            <p>
                              <strong>CGST:</strong>{" "}
                              {formData.taxConfiguration.cgst}%
                            </p>
                            <p>
                              <strong>SGST:</strong>{" "}
                              {formData.taxConfiguration.sgst}%
                            </p>
                            <p>
                              <strong>Cess:</strong>{" "}
                              {formData.taxConfiguration.cess}%
                            </p>
                            <p>
                              <strong>Additional Cess:</strong>{" "}
                              {formData.taxConfiguration.additionalCess}%
                            </p>
                          </>
                        )}
                      </>
                    )}
                    <p>
                      <strong>Status:</strong> {formData.status}
                    </p>
                  </div>
                </div>
                <CustomStepNavigation
                  currentStep={4}
                  totalSteps={4}
                  onPrevious={() => setActiveTab("opening")}
                  onSubmit={handleSubmit}
                  submitLabel={
                    editingProduct ? "Update Product" : "Save Product"
                  }
                  isLastStep={true}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <ImagePreviewDialog
        viewingImage={viewingImage}
        onClose={() => setViewingImage(null)}
      />
      <UniversalProductDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedProduct}
        />
    </div>
  );
};

export default ProductPage;
