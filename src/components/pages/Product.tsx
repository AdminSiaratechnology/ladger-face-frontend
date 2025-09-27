import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  Package, 
  Tag, 
  Archive, 
  Settings2, 
  Star, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  Table, 
  Grid3X3, 
  Layers,
  Building2,
  FileText,
  Plus,
  Camera,
  Upload,
  X,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";
import CustomSelect from "../customComponents/CustomSelect";
import { useCompanyStore } from "../../../store/companyStore";
import { useGodownStore } from "../../../store/godownStore";
import { useStockCategory } from "../../../store/stockCategoryStore";
import { useStockGroup } from "../../../store/stockGroupStore";
import { useUOMStore } from "../../../store/uomStore";
import { useProductStore } from "../../../store/productStore";
import { Input } from "../ui/input";
import FilterBar from "../customComponents/FilterBar";
import HeaderGradient from "../customComponents/HeaderGradint";
import { CheckAccess } from "../customComponents/CheckAccess";
import ActionsDropdown from "../customComponents/ActionsDropdown";


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
  companyId?: string;
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

const formatSimpleDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const ProductPage: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [openingQuantities, setOpeningQuantities] = useState<OpeningQuantity[]>(
    [{ id: 1, godown: "", batch: "", quantity: 0, rate: 0, amount: 0 }]
  );
  const [totalOpeningQuantity, setTotalOpeningQuantity] = useState<number>(0);
  const [usedQuantity, setUsedQuantity] = useState<number>(0);
  const [remainingQuantity, setRemainingQuantity] = useState<number>(0);
  const [viewingImage, setViewingImage] = useState<ProductImage | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc'>('nameAsc');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // Fixed limit per page
  
  const { companies } = useCompanyStore();
  const { godowns } = useGodownStore();
  const { stockCategories } = useStockCategory();
  const { stockGroups } = useStockGroup();
  const { units } = useUOMStore();
  const { fetchProducts, addProduct, updateProduct, deleteProduct, products, filterProducts, pagination, loading, error } = useProductStore();
  console.log(products,"prodiuctsss")

  // Simulated country from backend - can be replaced with actual backend call
  const [country] = useState<string>("india");

  // Suppliers data
  const [suppliers] = useState<Supplier[]>([
    { id: 1, name: "Tech Suppliers Inc", code: "SUP001" },
    { id: 2, name: "Global Parts Ltd", code: "SUP002" },
    { id: 3, name: "Quality Materials Co", code: "SUP003" },
    { id: 4, name: "Prime Components Corp", code: "SUP004" },
  ]);

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
    companyId: "",
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
      applicableDate: "",
    },
    images: [],
    remarks: "",
    status: "Active"
  });

  // Initial fetch
  useEffect(() => {
    fetchProducts(currentPage, limit);
  }, [fetchProducts, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      filterProducts(searchTerm, statusFilter, sortBy, currentPage, limit)
        .then((result) => {
          setFilteredProducts(result);
        })
        .catch((err) => {
          console.error("Error filtering products:", err);
        });
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, statusFilter, sortBy, currentPage, filterProducts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : type === "number" ? Number(value) : value;

    setFormData((prev) => {
      const updatedTaxConfig = {
        ...prev.taxConfiguration,
        [name]: newValue,
      };

      // Auto-calculate CGST and SGST when tax percentage changes
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

  const handleTaxSelectChange = (name: keyof TaxConfiguration, value: string): void => {
    setFormData((prev) => ({
      ...prev,
      taxConfiguration: {
        ...prev.taxConfiguration,
        [name]: value,
      },
    }));
  };

  // Validation for CGST + SGST not exceeding tax percentage
  const isTaxValid = (): boolean => {
    const { cgst, sgst, taxPercentage } = formData.taxConfiguration;
    return cgst + sgst <= taxPercentage;
  };

  const addOpeningQuantityRow = () => {
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
    // If changing quantity, check if it exceeds remaining quantity
    if (field === "quantity") {
      const currentRow = openingQuantities.find((item) => item.id === id);
      const currentQuantity = currentRow ? currentRow.quantity : 0;
      const newQuantity = Number(value);
      const quantityChange = newQuantity - currentQuantity;

      if (quantityChange > remainingQuantity) {
        // Don't allow the change if it exceeds remaining quantity
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

          // Calculate amount if quantity or rate changes
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
      setOpeningQuantities((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Product image upload handler - Only show if tax is applicable
  const handleProductImageUpload = (imageType: string, e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const previewUrl = URL.createObjectURL(file);
    
    const newImage: ProductImage = {
      id: Date.now(),
      angle: imageType,
      file: file,
      previewUrl: previewUrl
    };
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images.filter(img => img.angle !== imageType), newImage]
    }));
  }
};

// Remove product image handler - Only show if tax is applicable
const removeProductImage = (id: number) => {
  const imageToRemove = formData.images.find(img => img.id === id);
  if (imageToRemove && imageToRemove.previewUrl && imageToRemove.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(imageToRemove.previewUrl);
  }
  
  setFormData(prev => ({
    ...prev,
    images: prev.images.filter(img => img.id !== id)
  }));
};

  const removeImage = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  const handleRemarksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      remarks: e.target.value,
    }));
  };

  const cleanupImageUrls = (): void => {
  formData.images.forEach(img => {
    if (img.previewUrl && img.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(img.previewUrl);
    }
  });
};

const resetForm = () => {
  cleanupImageUrls(); // Clean up image URLs
  
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
    companyId: "",
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
      applicableDate: "",
    },
    images: [],
    remarks: "",
    status: "Active"
  });
  setEditingProduct(null);
  setOpeningQuantities([
    { id: 1, godown: "", batch: "", quantity: 0, rate: 0, amount: 0 },
  ]);
  setTotalOpeningQuantity(0);
  setActiveTab("basic");
};

  const handleEditProduct = (product: Product): void => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      partNo: product.partNo,
      stockGroup: product.stockGroup,
      stockCategory: product.stockCategory,
      batch: product.batch,
      unit: product.unit,
      alternateUnit: product.alternateUnit,
      minimumQuantity: product.minimumQuantity || 0,
      defaultSupplier: product.defaultSupplier || "",
      minimumRate: product.minimumRate || 0,
      maximumRate: product.maximumRate || 0,
      companyId: product.companyId || "",
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
        applicableDate: "",
      },
      images: product.images || [],
      remarks: product.remarks || "",
      status: product.status || "Active"
    });
    
    if (product.openingQuantities && product.openingQuantities.length > 0) {
      setOpeningQuantities(product.openingQuantities);
      const totalQty = product.openingQuantities.reduce((sum, item) => sum + item.quantity, 0);
      setTotalOpeningQuantity(totalQty);
    }
    
    setOpen(true);
  };

  const handleDeleteProduct = (id: string): void => {
    console.log("delete id", id);
    deleteProduct(id);
  };

  const handleSubmit = (): void => {
    if (!formData.code.trim() || !formData.name.trim()) {
      alert("Please fill in Product Code and Name");
      return;
    }

    if (formData.taxConfiguration.applicable && !isTaxValid()) {
      alert("CGST + SGST cannot exceed the tax percentage");
      return;
    }

    // Create FormData for file uploads (similar to company form)
    const productFormData = new FormData();
    
    // Append all text fields
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof ProductForm];
      
      if (key === 'images' || key === 'taxConfiguration') {
        return; // Handle these separately
      }
      
      if (value !== null && value !== undefined && value !== '') {
        productFormData.append(key, String(value));
      }
    });
    
    // Append tax configuration as JSON
    productFormData.append('taxConfiguration', JSON.stringify(formData.taxConfiguration));
    
    // Append opening quantities
    const validOpeningQuantities = openingQuantities.filter(
      (q) => q.godown && (q.quantity > 0 || q.rate > 0)
    );
    productFormData.append('openingQuantities', JSON.stringify(validOpeningQuantities));
    
    // Append product images
    formData.images.forEach((image) => {
      productFormData.append('productImages', image.file);
    });
    productFormData.append('productImageTypes', JSON.stringify(formData.images.map(img => img.angle)));
    productFormData.append('productImagesCount', String(formData.images.length));

    if (editingProduct) {
      updateProduct({ id: editingProduct._id || '', product: productFormData });
    } else {
      addProduct(productFormData);
    }
    
    setOpen(false);
    resetForm();
  };

  // Statistics
  const stats = useMemo(
    () => ({
      totalProducts: pagination?.total,
      activeProducts: statusFilter === 'Active' ? pagination?.total : filteredProducts?.filter(p => p.status === 'Active').length,
      batchProducts: filteredProducts?.filter((p) => p.batch).length,
      taxableProducts: filteredProducts?.filter(p => p.taxConfiguration?.applicable).length,
    }),
    [filteredProducts, pagination, statusFilter]
  );

  // Form tabs
  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "tax", label: "Tax" },
    { id: "opening", label: "Opening" },
    { id: "settings", label: "Settings" },
  ];

  // Calculate used and remaining quantities whenever openingQuantities or totalOpeningQuantity changes
  useEffect(() => {
    const used = openingQuantities.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    setUsedQuantity(used);
    setRemainingQuantity(totalOpeningQuantity - used);
  }, [openingQuantities, totalOpeningQuantity]);

  // Get company name by ID
  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c._id === companyId);
    return company ? company.namePrint : 'Unknown Company';
  };

  // Get stock group name
  const getStockGroupName = (stockGroupId: string) => {
    const stockGroup = stockGroups.find(g => g._id === stockGroupId);
    return stockGroup ? stockGroup.name : stockGroupId;
  };

  // Get category name
  const getCategoryName = (categoryId: string) => {
    const category = stockCategories.find(c => c._id === categoryId);
    return category ? category.name : categoryId;
  };

  // Actions dropdown component
  // const ActionsDropdown = ({ product }: { product: Product }) => {
  //   const [showActions, setShowActions] = useState(false);
    
  //   return (
  //     <div className="relative">
  //       <Button
  //         variant="ghost"
  //         size="sm"
  //         onClick={() => setShowActions(!showActions)}
  //         className="h-8 w-8 p-0 hover:bg-gray-100"
  //       >
  //         <MoreHorizontal className="h-4 w-4" />
  //       </Button>
        
  //       {showActions && (
  //         <>
  //           <div
  //             className="fixed inset-0 z-10"
  //             onClick={() => setShowActions(false)}
  //           />
  //           <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
  //             <Button
  //               variant="ghost"
  //               size="sm"
  //               onClick={() => {
  //                 handleEditProduct(product);
  //                 setShowActions(false);
  //               }}
  //               className="w-full justify-start text-left hover:bg-gray-50 rounded-none"
  //             >
  //               <Edit className="h-4 w-4 mr-2" />
  //               Edit
  //             </Button>
  //             <Button
  //               variant="ghost"
  //               size="sm"
  //               onClick={() => {
  //                 handleDeleteProduct(product._id || product.id.toString());
  //                 setShowActions(false);
  //               }}
  //               className="w-full justify-start text-left rounded-none text-red-600 hover:bg-red-50"
  //             >
  //               <Trash2 className="h-4 w-4 mr-2" />
  //               Delete
  //             </Button>
  //           </div>
  //         </>
  //       )}
  //     </div>
  //   );
  // };

  // Table View Component
  const TableView = () => {
   

   return  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-teal-50 to-teal-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Group
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => {
              console.log(product)
              
           return(   <tr key={product?.["_id"]} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.code}</div>
                    {product.partNo && (
                      <div className="text-sm text-gray-500">Part: {product.partNo}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <div>Unit: {product?.unit?.name}</div>
                    {product?.minimumQuantity && product?.minimumQuantity > 0 && (
                      <div>Min Qty: {product?.minimumQuantity}</div>
                    )}
                    <div>Batch: {product?.batch ? "Yes" : "No"}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getCompanyName(product?.companyId || "")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {product?.stockGroup?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {product?.stockCategory?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`${
                    product?.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  } hover:bg-green-100`}>
                    {product?.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* <ActionsDropdown product={product} /> */}
                                                   <ActionsDropdown
                    onEdit={() =>  handleEditProduct(product)}
                    onDelete={() =>handleDeleteProduct(product._id || '')}
                    module="InventoryManagement" subModule="product"
                  />
                </td>
              </tr>)
  })}
          </tbody>
        </table>
      </div>
    </div>
  };

  // Card View Component
  const CardView = () => {
    
  
  return   <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredProducts.map((product: Product) => (
        <Card key={product?._id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                  {product?.name}
                </CardTitle>
                <p className="text-teal-600 font-medium">
                  {product?.code}
                </p>
                {product.partNo && (
                  <p className="text-sm text-gray-600 mt-1">
                    Part No: {product?.partNo}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${product?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-green-100`}>
                  {product.status}
                </Badge>
                {/* <ActionsDropdown product={product} /> */}
                                                <ActionsDropdown
                    onEdit={() =>  handleEditProduct(product)}
                    onDelete={() =>handleDeleteProduct(product._id || '')}
                    module="InventoryManagement" subModule="product"
                  />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Building2 className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Company: {getCompanyName(product?.companyId || "")}</span>
              </div>

              <div className="flex items-center text-sm">
                <Layers className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Group: {product?.stockGroup?.name}</span>
              </div>

              <div className="flex items-center text-sm">
                <Package className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Category: {product.stockCategory?.name}</span>
              </div>

              <div className="flex items-center text-sm">
                <Archive className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Unit: {product.unit?.name}</span>
              </div>

              {product.minimumQuantity && product.minimumQuantity > 0 && (
                <div className="flex items-center text-sm">
                  <Settings2 className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Min Qty: {product.minimumQuantity}</span>
                </div>
              )}

              <div className="flex items-center text-sm">
                <Tag className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Batch: {product.batch ? "Yes" : "No"}</span>
              </div>

              {product.taxConfiguration?.applicable && (
                <div className="flex items-center text-sm">
                  <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Tax: {product.taxConfiguration.taxPercentage}%</span>
                </div>
              )}
              
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Created: {formatSimpleDate(product.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  };

  // Pagination controls
  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm">
      <div className="text-sm text-gray-600">
        Showing {(currentPage - 1) * pagination?.limit + 1} - {Math.min(currentPage * pagination?.limit, pagination?.total)} of {pagination?.total} products
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {pagination?.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(pagination?.totalPages, prev + 1))}
          disabled={currentPage === pagination?.totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );


  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
       
        <HeaderGradient
        title="Product Management"
        subtitle="Manage your product inventory and details"
        />
                <CheckAccess module="InventoryManagement" subModule="product" type="create">
        
        <Button
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Package className="w-4 h-4 mr-2" />
          Add Product
        </Button>
        </CheckAccess>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">
                  Total Products
                </p>
                <p className="text-3xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-teal-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Active Products</p>
                <p className="text-3xl font-bold">{stats.activeProducts}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Batch Managed</p>
                <p className="text-3xl font-bold">{stats.batchProducts}</p>
              </div>
              <Tag className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Taxable Products</p>
                <p className="text-3xl font-bold">{stats.taxableProducts}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-200" />
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
          setSearchTerm('');
          setStatusFilter('all');
          setSortBy('nameAsc');
          setCurrentPage(1);
        }}
      />

      {pagination?.total ? (
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">View Mode:</span>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'table'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table className="w-4 h-4 mr-2" />
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'cards'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Card View
            </button>
          </div>
        </div>
      ) : null}

      {pagination?.total === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">
              No products created yet
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Create your first product to get started
            </p>
                    <CheckAccess module="InventoryManagement" subModule="product" type="create">
            
            <Button
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              Add Your First Product
            </Button>
            </CheckAccess>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'table' ? <TableView /> : <CardView />}
          <PaginationControls />
        </>
      )}

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-full flex flex-col sm:w-[75vw] max-h-[80vh] min-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200 h-16">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <p className="text-gray-600 text-sm">
              {editingProduct ? 'Update the product details' : 'Fill in the product details and configuration'}
            </p>
          </DialogHeader>

          <div className="flex border-0 outline-0 h-[100%] flex-1">
            {/* Form Tabs */}
            <div className="flex flex-wrap gap-2 flex-col bg-teal-50 w-52">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-md text-start font-semibold ring-0 rounded-none transition-colors ${
                    activeTab === tab.id
                      ? "bg-teal-600 text-white"
                      : "bg-teal-50 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-6 w-full">
              {/* Basic Information Tab */}
              {activeTab === "basic" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Product Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInputBox
                      placeholder="Product Code *"
                      label="Product Code *"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      placeholder="Product Name *"
                      label="Product Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <CustomInputBox
                      placeholder="Part Number"
                      label="Part Number"
                      name="partNo"
                      value={formData.partNo}
                      onChange={handleChange}
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Batch Managed
                      </label>
                      <div className="flex items-center space-x-2 h-10 px-3 py-2 border border-teal-200 rounded-md focus-within:border-teal-500">
                        <input
                          type="checkbox"
                          id="batch"
                          name="batch"
                          checked={formData.batch}
                          onChange={handleChange}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <label htmlFor="batch" className="text-sm font-medium">
                          Batch Managed
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Company *
                      </label>
                      <select
                        value={formData.companyId}
                        onChange={(e) => handleSelectChange("companyId", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
                      >
                        <option value="">Select Company</option>
                        {companies.map((company) => (
                          <option key={company._id} value={company._id}>
                            {company.namePrint}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Stock Group *
                      </label>
                      <select
                        value={formData.stockGroup}
                        onChange={(e) => handleSelectChange("stockGroup", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
                      >
                        <option value="">Select Stock Group</option>
                        {stockGroups.map((group) => (
                          <option key={group._id} value={group._id}>
                            {group.name} ({group.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Stock Category *
                      </label>
                      <select
                        value={formData.stockCategory}
                        onChange={(e) => handleSelectChange("stockCategory", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
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
                      <label className="text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleSelectChange("status", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Unit *
                      </label>
                      <select
                        value={formData.unit}
                        onChange={(e) => handleSelectChange("unit", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
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
                      <label className="text-sm font-medium text-gray-700">
                        Alternate Unit
                      </label>
                      <select
                        value={formData.alternateUnit}
                        onChange={(e) => handleSelectChange("alternateUnit", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
                      >
                        <option value="">Select Alternate Unit</option>
                        {units.map((unit) => (
                          <option key={unit._id} value={unit._id}>
                            {unit.name} {unit.symbol && `(${unit.symbol})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <CustomInputBox
                      type="number"
                      placeholder="Minimum Quantity"
                      label="Minimum Quantity"
                      name="minimumQuantity"
                      value={formData.minimumQuantity}
                      onChange={handleChange}
                      className="border-teal-200 focus:border-teal-500 pl-10"
                      min="0"
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Default Supplier
                      </label>
                      <select
                        value={formData.defaultSupplier}
                        onChange={(e) => handleSelectChange("defaultSupplier", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
                      >
                        <option value="">Select Default Supplier</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.name}>
                            {supplier.name} ({supplier.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <CustomInputBox
                      type="number"
                      placeholder="Minimum Rate"
                      label="Minimum Rate"
                      name="minimumRate"
                      value={formData.minimumRate}
                      onChange={handleChange}
                      className="border-teal-200 focus:border-teal-500 pl-10"
                      min="0"
                      step="0.01"
                    />

                    <CustomInputBox
                      type="number"
                      placeholder="Maximum Rate"
                      label="Maximum Rate"
                      name="maximumRate"
                      value={formData.maximumRate}
                      onChange={handleChange}
                      className="border-teal-200 focus:border-teal-500 pl-10"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Default Godown
                      </label>
                      <select
                        value={formData.defaultGodown}
                        onChange={(e) => handleSelectChange("defaultGodown", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
                      >
                        <option value="">Select Default Godown</option>
                        {godowns.map((godown) => (
                          <option key={godown._id} value={godown._id}>
                            {godown.name} ({godown.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Product Type
                      </label>
                      <select
                        value={formData.productType}
                        onChange={(e) => handleSelectChange("productType", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
                      >
                        <option value="">Select Product Type</option>
                        <option value="select">Select</option>
                        <option value="godown">Godown</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() => setActiveTab("tax")}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      Next: Tax
                    </Button>
                  </div>
                </div>
              )}

              {/* Tax Tab */}
              {activeTab === "tax" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Tax Configuration
                  </h3>

                  {/* Tax Applicable Toggle */}
                  <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Tax Applicability
                      </label>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="tax-applicable"
                            name="applicable"
                            checked={formData.taxConfiguration.applicable === true}
                            onChange={() => handleTaxChange({ 
                              target: { name: 'applicable', value: true, type: 'checkbox', checked: true } 
                            } as React.ChangeEvent<HTMLInputElement>)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <label htmlFor="tax-applicable" className="text-sm font-medium text-green-700">
                            Applicable
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="tax-not-applicable"
                            name="applicable"
                            checked={formData.taxConfiguration.applicable === false}
                            onChange={() => handleTaxChange({ 
                              target: { name: 'applicable', value: false, type: 'checkbox', checked: false } 
                            } as React.ChangeEvent<HTMLInputElement>)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <label htmlFor="tax-not-applicable" className="text-sm font-medium text-red-700">
                            Not Applicable
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Details - Only show if tax is applicable */}
                  {formData.taxConfiguration.applicable && (
                    <div className="space-y-4">
                      {/* HSN Code and Tax Percentage */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomInputBox
                          placeholder="HSN Code"
                          label="HSN Code"
                          name="hsnCode"
                          value={formData.taxConfiguration.hsnCode}
                          onChange={handleTaxChange}
                        />
                        <CustomInputBox
                          type="number"
                          placeholder="Tax Percentage"
                          label="Tax Percentage (%)"
                          name="taxPercentage"
                          value={formData.taxConfiguration.taxPercentage}
                          onChange={handleTaxChange}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>

                      {/* India-specific tax fields */}
                      {country.toLowerCase() === "india" && (
                        <div>
                          <h4 className="text-md font-semibold text-teal-700 mb-3 flex items-center">
                            <Archive className="w-4 h-4 mr-2" />
                            India Tax Breakdown
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CustomInputBox
                              type="number"
                              placeholder="CGST (%)"
                              label="CGST (%)"
                              name="cgst"
                              value={formData.taxConfiguration.cgst}
                              onChange={handleTaxChange}
                              min="0"
                              max="50"
                              step="0.01"
                            />
                            <CustomInputBox
                              type="number"
                              placeholder="SGST (%)"
                              label="SGST (%)"
                              name="sgst"
                              value={formData.taxConfiguration.sgst}
                              onChange={handleTaxChange}
                              min="0"
                              max="50"
                              step="0.01"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <CustomInputBox
                              type="number"
                              placeholder="Cess (%)"
                              label="Cess (%)"
                              name="cess"
                              value={formData.taxConfiguration.cess}
                              onChange={handleTaxChange}
                              min="0"
                              step="0.01"
                            />
                            <CustomInputBox
                              type="number"
                              placeholder="Additional Cess (%)"
                              label="Additional Cess (%)"
                              name="additionalCess"
                              value={formData.taxConfiguration.additionalCess}
                              onChange={handleTaxChange}
                              min="0"
                              step="0.01"
                            />
                          </div>

                          {/* Tax validation message */}
                          {(formData.taxConfiguration.cgst + formData.taxConfiguration.sgst > formData.taxConfiguration.taxPercentage) && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-red-700 text-sm font-medium">
                                Warning: CGST + SGST ({formData.taxConfiguration.cgst + formData.taxConfiguration.sgst}%) 
                                exceeds Tax Percentage ({formData.taxConfiguration.taxPercentage}%)
                              </p>
                            </div>
                          )}

                          {/* Tax summary */}
                          <div className="mt-4 p-3 bg-blue-50 border border-teal-200 rounded-md">
                            <p className="text-teal-700 text-sm font-medium mb-2">Tax Summary:</p>
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
                                <span>{formData.taxConfiguration.additionalCess}%</span>
                              </div>
                              <div className="flex justify-between font-semibold border-t border-teal-300 pt-1">
                                <span>Total:</span>
                                <span>
                                  {formData.taxConfiguration.cgst + 
                                   formData.taxConfiguration.sgst + 
                                   formData.taxConfiguration.cess + 
                                   formData.taxConfiguration.additionalCess}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tax Applicable Date */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomInputBox
                          type="date"
                          placeholder="Applicable Date"
                          label="Tax Applicable Date"
                          name="applicableDate"
                          value={formData.taxConfiguration.applicableDate}
                          onChange={handleTaxChange}
                        />
                      </div>
                    </div>
                  )}

                  {/* Non-applicable message */}
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

                  <div className="mt-6 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("basic")}
                    >
                      Previous: Basic Info
                    </Button>
                    <Button
                      onClick={() => setActiveTab("opening")}
                      className="bg-teal-600 hover:bg-teal-700"
                      disabled={formData.taxConfiguration.applicable && !isTaxValid()}
                    >
                      Next: Opening
                    </Button>
                  </div>
                </div>
              )}

              {/* Opening Tab */}
              {activeTab === "opening" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Opening Stock
                  </h3>

                  {/* Total Opening Quantity Input */}
                  <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="totalOpeningQuantity"
                        className="block text-sm font-medium text-teal-700"
                      >
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
                      id="totalOpeningQuantity"
                      value={totalOpeningQuantity}
                      onChange={(e) =>
                        setTotalOpeningQuantity(
                          Math.max(0, Number(e.target.value))
                        )
                      }
                      min="0"
                      step="0.01"
                      className="w-full h-10 px-3 py-2 border border-teal-300 rounded-md focus:border-teal-500 focus:outline-none"
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
                          <th className="p-2 border border-teal-200 text-left">
                            Godown
                          </th>
                          <th className="p-2 border border-teal-200 text-left">
                            Batch
                          </th>
                          <th className="p-2 border border-teal-200 text-left">
                            Quantity
                          </th>
                          <th className="p-2 border border-teal-200 text-left">
                            Rate
                          </th>
                          <th className="p-2 border border-teal-200 text-left">
                            Amount
                          </th>
                          <th className="p-2 border border-teal-200 text-left">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {openingQuantities.map((item) => (
                          <tr key={item.id}>
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
                                className="w-full p-2 border border-gray-300 rounded"
                              >
                                <option value="">Select Godown</option>
                                {godowns.map((godown) => (
                                  <option key={godown._id} value={godown._id}>
                                    {godown.name} ({godown.code})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2 border border-teal-200">
                              <input
                                type="text"
                                value={item.batch}
                                onChange={(e) =>
                                  handleOpeningQuantityChange(
                                    item.id,
                                    "batch",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded"
                                placeholder="Enter batch number"
                                disabled={!formData.batch}
                              />
                            </td>
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
                                className="w-full p-2 border border-gray-300 rounded"
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
                                className="w-full p-2 border border-gray-300 rounded"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="p-2 border border-teal-200">
                              <input
                                type="number"
                                value={item.amount.toFixed(2)}
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                              />
                            </td>
                            <td className="p-2 border border-teal-200">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  removeOpeningQuantityRow(item.id)
                                }
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

                  <div className="mt-4 flex justify-between">
                    <Button
                      onClick={addOpeningQuantityRow}
                      variant="outline"
                      className="flex items-center"
                      disabled={remainingQuantity <= 0}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Row
                    </Button>

                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("tax")}
                      >
                        Previous: Tax
                      </Button>
                      <Button
                        onClick={() => setActiveTab("settings")}
                        className="bg-teal-600 hover:bg-teal-700"
                        disabled={remainingQuantity < 0}
                      >
                        Next: Settings
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            {/* Settings Tab */}
{activeTab === "settings" && (
  <div className="bg-white p-4">
    <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
      <Settings2 className="w-5 h-5 mr-2" />
      Product Settings
    </h3>

    {/* Product Images Section */}
    <div className="mb-6">
      <h4 className="font-medium text-teal-800 mb-3">Product Images</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Front', 'Back', 'Left', 'Right', 'Top', 'Bottom'].map(imageType => (
          <div key={imageType} className="p-4 bg-white rounded-lg border border-teal-200">
            <p className="text-sm font-medium text-teal-700 mb-2">{imageType} View</p>
            <div className="flex items-center justify-between">
              <input
                type="file"
                id={`${imageType.toLowerCase()}-image`}
                className="hidden"
                onChange={(e) => handleProductImageUpload(imageType, e)}
                accept="image/*"
              />
              <label
                htmlFor={`${imageType.toLowerCase()}-image`}
                className="px-4 py-2 bg-teal-50 text-teal-700 rounded-md cursor-pointer hover:bg-teal-100 transition-colors flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </label>
              {formData.images.find(img => img.angle === imageType) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProductImage(formData.images.find(img => img.angle === imageType)!.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {formData.images.find(img => img.angle === imageType) && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 truncate">
                  {formData.images.find(img => img.angle === imageType)?.file?.name}
                </p>
                {formData.images.find(img => img.angle === imageType)?.previewUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.images.find(img => img.angle === imageType)?.previewUrl}
                      alt={`${imageType} view`}
                      className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-75"
                      onClick={() => setViewingImage(formData.images.find(img => img.angle === imageType)!)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Remarks Section */}
    <div>
      <p className="text-sm font-medium text-teal-700 mb-2">Product Remarks</p>
      <textarea
        placeholder="Add any additional remarks about the product..."
        name="remarks"
        value={formData.remarks}
        onChange={handleRemarksChange}
        rows={4}
        className="w-full px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none resize-none"
      />
    </div>

    <div className="mt-6 flex justify-between">
      <Button
        variant="outline"
        onClick={() => setActiveTab("opening")}
      >
        Previous: Opening
      </Button>
      <Button
        onClick={handleSubmit}
        className="bg-teal-600 hover:bg-teal-700"
      >
        {editingProduct ? 'Update Product' : 'Save Product'}
      </Button>
    </div>
  </div>
)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
{
// Image viewing modal (add this after your main Dialog)
viewingImage && (
  <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{viewingImage.angle} View</DialogTitle>
      </DialogHeader>
      <div className="flex justify-center">
        <img
          src={viewingImage.previewUrl}
          alt={`${viewingImage.angle} view`}
          className="max-w-full max-h-96 object-contain rounded-lg"
        />
      </div>
    </DialogContent>
  </Dialog>
)}
    </div>
  );
};

export default ProductPage;