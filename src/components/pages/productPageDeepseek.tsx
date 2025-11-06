import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Package,
  Tag,
  Archive,
  Settings2,
  Star,
  Plus,
  X,
  Layers,
  Receipt,
  Camera,
  Eye,
  Trash2,
} from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";
import CustomSelect from "../customComponents/CustomSelect";

import {useCompanyStore} from "../../../store/companyStore"
import {useGodownStore} from "../../../store/godownStore"
import {useStockCategory} from "../../../store/stockCategoryStore"
import {useStockGroup} from "../../../store/stockGroupStore"
import {useUOMStore} from "../../../store/uomStore"
import {useProductStore} from "../../../store/productStore"

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

interface Product {
  id: number;
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
  companyId?:any,
  maximumRate?: number;
  defaultGodown?: string;
  productType?: string;
  taxConfiguration?: TaxConfiguration;
  images?: ProductImage[];
  remarks?: string;
  isDeleted:boolean
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
  companyId?:string;
  defaultGodown?: string;
  productType?: string;
  taxConfiguration: TaxConfiguration;
  images: ProductImage[];
  remarks: string;
}

interface OpeningQuantity {
  id: number;
  godown: string;
  batch: string;
  quantity: number;
  rate: number;
  amount: number;
}



interface Supplier {
  id: number;
  name: string;
  code: string;
}


const ProductPage: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [products, setProducts] = useState<Product[]>([]);
  const [openingQuantities, setOpeningQuantities] = useState<OpeningQuantity[]>(
    [{ id: 1, godown: "", batch: "", quantity: 0, rate: 0, amount: 0 }]
  );
  const [totalOpeningQuantity, setTotalOpeningQuantity] = useState<number>(0);
  const [usedQuantity, setUsedQuantity] = useState<number>(0);
  const [remainingQuantity, setRemainingQuantity] = useState<number>(0);
  const [viewingImage, setViewingImage] = useState<ProductImage | null>(null);
  const {companies}=useCompanyStore()
  const {stockCategories}=useStockCategory()
  const {stockGroups}=useStockGroup()
  const {godowns}=useGodownStore()
  const {units}=useUOMStore()
  const {fetchProducts,addProduct,updateProduct,deleteProduct}=useProductStore()


  // Simulated country from backend - can be replaced with actual backend call
  const [country] = useState<string>("india");


  // Suppliers data
  const [suppliers] = useState<Supplier[]>([
    { id: 1, name: "Tech Suppliers Inc", code: "SUP001" },
    { id: 2, name: "Global Parts Ltd", code: "SUP002" },
    { id: 3, name: "Quality Materials Co", code: "SUP003" },
    { id: 4, name: "Prime Components Corp", code: "SUP004" },
  ]);

  const [form, setForm] = useState<ProductForm>({
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
    defaultGodown: "",
    productType: "",
    companyId:"",
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
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
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : type === "number" ? Number(value) : value;

    setForm((prev) => {
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
    setForm((prev) => ({
      ...prev,
      taxConfiguration: {
        ...prev.taxConfiguration,
        [name]: value,
      },
    }));
  };

  // Validation for CGST + SGST not exceeding tax percentage
  const isTaxValid = (): boolean => {
    const { cgst, sgst, taxPercentage } = form.taxConfiguration;
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, angle: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImage: ProductImage = {
        id: Date.now(),
        angle,
        file,
        previewUrl: URL.createObjectURL(file),
      };

      setForm((prev) => ({
        ...prev,
        images: [...prev.images.filter(img => img.angle !== angle), newImage],
      }));
    }
  };

  const removeImage = (id: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  const handleRemarksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      remarks: e.target.value,
    }));
  };

  const handleSubmit = (): void => {
    if (!form.code.trim() || !form.name.trim()) {
      alert("Please fill in Product Code and Name");
      return;
    }

    if (form.taxConfiguration.applicable && !isTaxValid()) {
      alert("CGST + SGST cannot exceed the tax percentage");
      return;
    }

    const newProduct: Product = {
      ...form,
      id: Date.now(),
      createdAt: new Date().toLocaleDateString(),
      openingQuantities: openingQuantities.filter(
        (q) => q.godown && (q.quantity > 0 || q.rate > 0)
      ),
    };

    setProducts((prev) => [...prev, newProduct]);

    // Reset form
    setForm({
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
      defaultGodown: "",
      productType: "",
      companyId:"",
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
    });

    // Reset opening quantities
    setOpeningQuantities([
      { id: 1, godown: "", batch: "", quantity: 0, rate: 0, amount: 0 },
    ]);
    setTotalOpeningQuantity(0);

    setOpen(false);
    setActiveTab("basic");
  };

  // Statistics
  const stats = useMemo(
    () => ({
      totalProducts: products.length,
      activeProducts: products.length,
      categorizedProducts: products.filter((p) => p.stockCategory !== "")
        .length,
      groupedProducts: products.filter((p) => p.stockGroup !== "").length,
      batchProducts: products.filter((p) => p.batch).length,
    }),
    [products]
  );

  // Form tabs
  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "tax", label: "Tax" },
    { id: "opening", label: "Opening" },
    { id: "settings", label: "Settings" },
  ];

  // Get unique parent options from stock categories and groups
  const categoryParents = [
    ...new Set(stockCategories.map((cat) => cat.parent)),
  ];
  const groupParents = [...new Set(stockGroups.map((group) => group.parent))];

  // Calculate used and remaining quantities whenever openingQuantities or totalOpeningQuantity changes
  useEffect(() => {
    const used = openingQuantities.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    setUsedQuantity(used);
    setRemainingQuantity(totalOpeningQuantity - used);
  }, [openingQuantities, totalOpeningQuantity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Product Management
          </h1>
          <p className="text-gray-600">
            Manage your product inventory and details
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Package className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                <p className="text-blue-100 text-sm font-medium">Categorized</p>
                <p className="text-3xl font-bold">
                  {stats.categorizedProducts}
                </p>
              </div>
              <Tag className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Grouped</p>
                <p className="text-3xl font-bold">{stats.groupedProducts}</p>
              </div>
              <Layers className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  Batch Managed
                </p>
                <p className="text-3xl font-bold">{stats.batchProducts}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold">{stats.activeProducts}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">
              No products created yet
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Create your first product to get started
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product: Product) => (
            <Card
              key={product.id}
              className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
            >
              <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center mr-3">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                        {product.name}
                      </CardTitle>
                      <p className="text-teal-600 font-medium">
                        {product.code}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Active
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  {product.partNo && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        Part No
                      </span>
                      <span className="text-sm text-gray-700">
                        {product.partNo}
                      </span>
                    </div>
                  )}

                  {product.stockGroup && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        Stock Group
                      </span>
                      <span className="text-sm text-gray-700">
                        {product.stockGroup}
                      </span>
                    </div>
                  )}

                  {product.stockCategory && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        Category
                      </span>
                      <span className="text-sm text-gray-700">
                        {product.stockCategory}
                      </span>
                    </div>
                  )}

                  {product.unit && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        Unit
                      </span>
                      <span className="text-sm text-gray-700">
                        {product.unit}
                      </span>
                    </div>
                  )}

                  {product.minimumQuantity !== undefined &&
                    product.minimumQuantity > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Min Qty
                        </span>
                        <span className="text-sm text-gray-700">
                          {product.minimumQuantity}
                        </span>
                      </div>
                    )}

                  {product.defaultSupplier && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        Default Supplier
                      </span>
                      <span className="text-sm text-gray-700">
                        {product.defaultSupplier}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      Batch Managed
                    </span>
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      {product.batch ? "Yes" : "No"}
                    </span>
                  </div>

                  {/* Tax Information */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      Tax Applicable
                    </span>
                    <span className={`text-sm px-2 py-1 rounded text-xs ${
                      product.taxConfiguration?.applicable 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {product.taxConfiguration?.applicable ? "Yes" : "No"}
                    </span>
                  </div>

                  {product.taxConfiguration?.applicable && product.taxConfiguration.hsnCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        HSN Code
                      </span>
                      <span className="text-sm text-gray-700">
                        {product.taxConfiguration.hsnCode}
                      </span>
                    </div>
                  )}

                  {product.taxConfiguration?.applicable && product.taxConfiguration.taxPercentage > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        Tax %
                      </span>
                      <span className="text-sm text-gray-700">
                        {product.taxConfiguration.taxPercentage}%
                      </span>
                    </div>
                  )}
                </div>

                {product.openingQuantities &&
                  product.openingQuantities.length > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        Opening Stock:
                      </p>
                      <div className="space-y-1">
                        {product.openingQuantities.map((qty, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-xs"
                          >
                            <span>{qty.godown}:</span>
                            <span>
                              {qty.quantity} @ {qty.rate} = {qty.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Created: {product.createdAt}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-full flex flex-col sm:w-[75vw] max-h-[80vh] min-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200 h-16">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Add New Product
            </DialogTitle>
            <p className="text-gray-600 text-sm">
              Fill in the product details and configuration
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
                      placeholder="Product Name *"
                      label="Product Name *"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                    />
                     <CustomSelect
                      label="Stock Company"
                      placeholder="Select Company"
                      options={companies}
                      value={form.companyId}
                      onChange={(e) =>
                        handleSelectChange("companyId", e.target.value)
                      }
                      required={true}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <CustomInputBox
                      placeholder="Part Number"
                      label="Part Number"
                      name="partNo"
                      value={form.partNo}
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
                        checked={form.batch}
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
                    <CustomSelect
                      label="Stock Group"
                      placeholder="Select Stock Group"
                      options={stockGroups}
                      value={form.stockGroup}
                      onChange={(e) =>
                        handleSelectChange("stockGroup", e.target.value)
                      }
                      required={true}
                    />
                    <CustomSelect
                      label="Stock Category"
                      placeholder="Select Stock Category"
                      options={stockCategories}
                      value={form.stockCategory}
                      onChange={(e) =>
                        handleSelectChange("stockCategory", e.target.value)
                      }
                      required={true}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                     <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Unit *
                      </label>
                      <select
                         value={form.unit}
                      onChange={(e) =>
                        handleSelectChange("unit", e.target.value)
                      }
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
                      >
                        <option value="">Select Unit</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.name}>
                          {unit.name} {unit.symbol && `(${unit.symbol})`}
                        </option>
                      ))}
                      </select>
                    </div>
                       <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Alternate Unit *
                      </label>
                      <select
                         value={form.alternateUnit}
                      onChange={(e) =>
                        handleSelectChange("alternateUnit", e.target.value)
                      }
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
                      >
                        <option value="">Select Alternate Unit</option>
                     {units.map((unit) => (
                        <option key={unit.id} value={unit.name}>
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
                      value={form.minimumQuantity}
                      onChange={handleChange}
                      className="border-teal-200 focus:border-teal-500 pl-10"
                      min="0"
                    />
                      <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Default Supplier *
                      </label>
                      <select
                       value={form.defaultSupplier}
                        onChange={(e) =>
                          handleSelectChange("defaultSupplier", e.target.value)
                        }
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
                      value={form.minimumRate}
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
                      value={form.maximumRate}
                      onChange={handleChange}
                      className="border-teal-200 focus:border-teal-500 pl-10"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Default Godown *
                      </label>
                      <select
                        value={form.defaultGodown}
                        onChange={(e) =>
                          handleSelectChange("defaultGodown", e.target.value)
                        }
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
                      >
                        <option value="">Select Default Godown</option>
                        {godowns.map((godown) => (
                          <option key={godown.id} value={godown.name}>
                            {godown.name} ({godown.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Default product type *
                      </label>
                      <select
                        value={form.productType}
                        onChange={(e) =>
                          handleSelectChange("productType", e.target.value)
                        }
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
                      >
                        <option value="">Select Product Type</option>

                        <option value={"select"}>"select"</option>
                        <option value={"godown"}>"Godown"</option>
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
                    <Receipt className="w-5 h-5 mr-2" />
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
                            checked={form.taxConfiguration.applicable === true}
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
                            checked={form.taxConfiguration.applicable === false}
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
                  {form.taxConfiguration.applicable && (
                    <div className="space-y-4">
                      {/* HSN Code and Tax Percentage */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomInputBox
                          placeholder="HSN Code"
                          label="HSN Code"
                          name="hsnCode"
                          value={form.taxConfiguration.hsnCode}
                          onChange={handleTaxChange}
                        />
                        <CustomInputBox
                          type="number"
                          placeholder="Tax Percentage"
                          label="Tax Percentage (%)"
                          name="taxPercentage"
                          value={form.taxConfiguration.taxPercentage}
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
                              value={form.taxConfiguration.cgst}
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
                              value={form.taxConfiguration.sgst}
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
                              value={form.taxConfiguration.cess}
                              onChange={handleTaxChange}
                              min="0"
                              step="0.01"
                            />
                            <CustomInputBox
                              type="number"
                              placeholder="Additional Cess (%)"
                              label="Additional Cess (%)"
                              name="additionalCess"
                              value={form.taxConfiguration.additionalCess}
                              onChange={handleTaxChange}
                              min="0"
                              step="0.01"
                            />
                          </div>

                          {/* Tax validation message */}
                          {(form.taxConfiguration.cgst + form.taxConfiguration.sgst > form.taxConfiguration.taxPercentage) && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-red-700 text-sm font-medium">
                                Warning: CGST + SGST ({form.taxConfiguration.cgst + form.taxConfiguration.sgst}%) 
                                exceeds Tax Percentage ({form.taxConfiguration.taxPercentage}%)
                              </p>
                            </div>
                          )}

                          {/* Tax summary */}
                          <div className="mt-4 p-3 bg-blue-50 border border-teal-200 rounded-md">
                            <p className="text-teal-700 text-sm font-medium mb-2">Tax Summary:</p>
                            <div className="text-sm text-teal-600 space-y-1">
                              <div className="flex justify-between">
                                <span>CGST:</span>
                                <span>{form.taxConfiguration.cgst}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>SGST:</span>
                                <span>{form.taxConfiguration.sgst}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cess:</span>
                                <span>{form.taxConfiguration.cess}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Additional Cess:</span>
                                <span>{form.taxConfiguration.additionalCess}%</span>
                              </div>
                              <div className="flex justify-between font-semibold border-t border-teal-300 pt-1">
                                <span>Total:</span>
                                <span>
                                  {form.taxConfiguration.cgst + 
                                   form.taxConfiguration.sgst + 
                                   form.taxConfiguration.cess + 
                                   form.taxConfiguration.additionalCess}%
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
                          value={form.taxConfiguration.applicableDate}
                          onChange={handleTaxChange}
                        />
                      </div>
                    </div>
                  )}

                  {/* Non-applicable message */}
                  {!form.taxConfiguration.applicable && (
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
                      disabled={form.taxConfiguration.applicable && !isTaxValid()}
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
                    <Input
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
                      className="border-teal-300 focus:border-teal-500"
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
                                className="w-full p-1 border border-gray-300 rounded"
                              >
                                <option value="">Select Godown</option>
                                {godowns.map((godown) => (
                                  <option key={godown.id} value={godown.name}>
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
                                className="w-full p-1 border border-gray-300 rounded"
                                placeholder="Enter batch number"
                                disabled={!form.batch}
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
                                className="w-full p-1 border border-gray-300 rounded"
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
                                className="w-full p-1 border border-gray-300 rounded"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="p-2 border border-teal-200">
                              <input
                                type="number"
                                value={item.amount.toFixed(2)}
                                readOnly
                                className="w-full p-1 border border-gray-300 rounded bg-gray-100"
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
                                <X className="h-4 w-4" />
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

                  <div className="space-y-6">
                    {/* Product Images Section */}
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                      <h4 className="text-md font-semibold text-teal-700 mb-3 flex items-center">
                        <Camera className="w-4 h-4 mr-2" />
                        Product Images
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Front', 'Back', 'Left', 'Right'].map((angle) => {
                          const existingImage = form.images.find(img => img.angle === angle);
                          return (
                            <div key={angle} className="flex flex-col items-center">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {angle} View
                              </label>
                              <div className="relative w-32 h-32 border-2 border-dashed border-teal-300 rounded-lg flex items-center justify-center overflow-hidden bg-white">
                                {existingImage ? (
                                  <>
                                    <img 
                                      src={existingImage.previewUrl} 
                                      alt={`${angle} view`}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-white hover:text-teal-200 mr-1"
                                        onClick={() => setViewingImage(existingImage)}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-white hover:text-red-300 ml-1"
                                        onClick={() => removeImage(existingImage.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Camera className="w-8 h-8 text-teal-400" />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      onChange={(e) => handleImageUpload(e, angle)}
                                    />
                                  </>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {existingImage ? existingImage.file.name : `Upload ${angle} image`}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Remarks Section */}
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                      <h4 className="text-md font-semibold text-teal-700 mb-3 flex items-center">
                        <Archive className="w-4 h-4 mr-2" />
                        Remarks
                      </h4>
                      <textarea
                        value={form.remarks}
                        onChange={handleRemarksChange}
                        placeholder="Add any additional remarks or notes about this product..."
                        className="w-full h-32 p-3 border border-teal-200 rounded-md focus:border-teal-500 focus:ring-teal-100 focus:outline-none resize-none"
                      />
                    </div>
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
                      Save Product
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image View Modal */}
      {viewingImage && (
        <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                {viewingImage.angle} View
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img 
                src={viewingImage.previewUrl} 
                alt={`${viewingImage.angle} view`}
                className="max-h-96 object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProductPage;