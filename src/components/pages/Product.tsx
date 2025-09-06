import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Package, Tag, Archive, Settings2, Star, Plus, X, Layers, Minus, Maximize, Warehouse, Truck } from "lucide-react";

// Interfaces
interface Unit {
  id: number;
  name: string;
  type: 'simple' | 'compound';
  symbol?: string;
  decimalPlaces?: number;
  firstUnit?: string;
  conversion?: number;
  secondUnit?: string;
  createdAt: string;
}

interface StockCategory {
  id: number;
  code: string;
  name: string;
  parent: string;
  status: string;
  createdAt: string;
}

interface StockGroup {
  id: number;
  code: string;
  name: string;
  parent: string;
  status: string;
  createdAt: string;
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
  maximumRate?: number;
  defaultGodown?: string;
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
  defaultGodown?: string;
}

interface OpeningQuantity {
  id: number;
  godown: string;
  batch: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Godown {
  id: number;
  name: string;
  code: string;
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
  const [openingQuantities, setOpeningQuantities] = useState<OpeningQuantity[]>([
    { id: 1, godown: "", batch: "", quantity: 0, rate: 0, amount: 0 }
  ]);
  const [totalOpeningQuantity, setTotalOpeningQuantity] = useState<number>(0);
  const [usedQuantity, setUsedQuantity] = useState<number>(0);
  const [remainingQuantity, setRemainingQuantity] = useState<number>(0);

  // Units data
  const [units] = useState<Unit[]>([
    // Simple units
    {
      id: 1,
      name: "Meter",
      type: 'simple',
      symbol: "m",
      decimalPlaces: 2,
      createdAt: "10/15/2023"
    },
    {
      id: 2,
      name: "Kilogram",
      type: 'simple',
      symbol: "kg",
      decimalPlaces: 3,
      createdAt: "10/16/2023"
    },
    {
      id: 3,
      name: "Second",
      type: 'simple',
      symbol: "s",
      decimalPlaces: 1,
      createdAt: "10/17/2023"
    },
    {
      id: 4,
      name: "Celsius",
      type: 'simple',
      symbol: "°C",
      decimalPlaces: 1,
      createdAt: "10/18/2023"
    },
    // Compound units
    {
      id: 5,
      name: "Kilometers per hour",
      type: 'compound',
      firstUnit: "Kilometer",
      conversion: 1,
      secondUnit: "Hour",
      createdAt: "10/19/2023"
    },
    {
      id: 6,
      name: "Newton",
      type: 'compound',
      firstUnit: "Kilogram",
      conversion: 1,
      secondUnit: "Meter per second squared",
      createdAt: "10/20/2023"
    }
  ]);

  // Stock Categories
  const [stockCategories] = useState<StockCategory[]>([
    {
      id: 1,
      code: 'CAT001',
      name: 'Electronics',
      parent: 'primary',
      status: 'active',
      createdAt: '10/15/2023',
    },
    {
      id: 2,
      code: 'CAT002',
      name: 'Stationery',
      parent: 'pen',
      status: 'active',
      createdAt: '10/16/2023',
    },
    {
      id: 3,
      code: 'CAT003',
      name: 'Food Items',
      parent: 'apple',
      status: 'active',
      createdAt: '10/17/2023',
    }
  ]);

  // Stock Groups
  const [stockGroups] = useState<StockGroup[]>([
    {
      id: 1,
      code: 'GRP001',
      name: 'Raw Materials',
      parent: 'primary',
      status: 'active',
      createdAt: '10/15/2023',
    },
    {
      id: 2,
      code: 'GRP002',
      name: 'Finished Goods',
      parent: 'secondary',
      status: 'active',
      createdAt: '10/16/2023',
    },
    {
      id: 3,
      code: 'GRP003',
      name: 'Work in Progress',
      parent: 'tertiary',
      status: 'active',
      createdAt: '10/17/2023',
    }
  ]);

  // Godowns data
  const [godowns] = useState<Godown[]>([
    { id: 1, name: "Main Warehouse", code: "G001" },
    { id: 2, name: "Secondary Storage", code: "G002" },
    { id: 3, name: "Retail Store", code: "G003" },
    { id: 4, name: "Production Floor", code: "G004" }
  ]);

  // Suppliers data
  const [suppliers] = useState<Supplier[]>([
    { id: 1, name: "Tech Suppliers Inc", code: "SUP001" },
    { id: 2, name: "Global Parts Ltd", code: "SUP002" },
    { id: 3, name: "Quality Materials Co", code: "SUP003" },
    { id: 4, name: "Prime Components Corp", code: "SUP004" }
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
    defaultGodown: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleSelectChange = (name: keyof ProductForm, value: string): void => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addOpeningQuantityRow = () => {
    setOpeningQuantities(prev => [
      ...prev,
      { id: prev.length + 1, godown: "", batch: "", quantity: 0, rate: 0, amount: 0 }
    ]);
  };
  
  const handleOpeningQuantityChange = (id: number, field: keyof OpeningQuantity, value: string | number) => {
    // If changing quantity, check if it exceeds remaining quantity
    if (field === 'quantity') {
      const currentRow = openingQuantities.find(item => item.id === id);
      const currentQuantity = currentRow ? currentRow.quantity : 0;
      const newQuantity = Number(value);
      const quantityChange = newQuantity - currentQuantity;
      
      if (quantityChange > remainingQuantity) {
        // Don't allow the change if it exceeds remaining quantity
        return;
      }
    }
    
    setOpeningQuantities(prev => 
      prev.map(item => {
        if (item.id === id) {
          const updatedItem = { 
            ...item, 
            [field]: value 
          };
          
          // Calculate amount if quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate);
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  const removeOpeningQuantityRow = (id: number) => {
    if (openingQuantities.length > 1) {
      setOpeningQuantities(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (): void => {
    if (!form.code.trim() || !form.name.trim()) {
      alert("Please fill in Product Code and Name");
      return;
    }

    const newProduct: Product = {
      ...form,
      id: Date.now(),
      createdAt: new Date().toLocaleDateString(),
      openingQuantities: openingQuantities.filter(q => q.godown && (q.quantity > 0 || q.rate > 0))
    };

    setProducts(prev => [...prev, newProduct]);

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
      defaultGodown: ""
    });
    
    // Reset opening quantities
    setOpeningQuantities([{ id: 1, godown: "", batch: "", quantity: 0, rate: 0, amount: 0 }]);
    setTotalOpeningQuantity(0);

    setOpen(false);
    setActiveTab("basic");
  };

  // Statistics
  const stats = useMemo(() => ({
    totalProducts: products.length,
    activeProducts: products.length,
    categorizedProducts: products.filter(p => p.stockCategory !== "").length,
    groupedProducts: products.filter(p => p.stockGroup !== "").length,
    batchProducts: products.filter(p => p.batch).length
  }), [products]);

  // Form tabs
  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "tax", label: "Tax" },
    { id: "opening", label: "Opening" },
    { id: "settings", label: "Settings" }
  ];

  // Get unique parent options from stock categories and groups
  const categoryParents = [...new Set(stockCategories.map(cat => cat.parent))];
  const groupParents = [...new Set(stockGroups.map(group => group.parent))];

  // Calculate used and remaining quantities whenever openingQuantities or totalOpeningQuantity changes
  useEffect(() => {
    const used = openingQuantities.reduce((sum, item) => sum + item.quantity, 0);
    setUsedQuantity(used);
    setRemainingQuantity(totalOpeningQuantity - used);
  }, [openingQuantities, totalOpeningQuantity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Product Management</h1>
          <p className="text-gray-600">Manage your product inventory and details</p>
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
                <p className="text-teal-100 text-sm font-medium">Total Products</p>
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
                <p className="text-3xl font-bold">{stats.categorizedProducts}</p>
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
                <p className="text-purple-100 text-sm font-medium">Batch Managed</p>
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
            <p className="text-gray-500 text-lg font-medium mb-2">No products created yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first product to get started</p>
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
            <Card key={product.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
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
                      <p className="text-teal-600 font-medium">{product.code}</p>
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
                      <span className="text-sm font-medium text-gray-500">Part No</span>
                      <span className="text-sm text-gray-700">{product.partNo}</span>
                    </div>
                  )}
                  
                  {product.stockGroup && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Stock Group</span>
                      <span className="text-sm text-gray-700">{product.stockGroup}</span>
                    </div>
                  )}
                  
                  {product.stockCategory && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Category</span>
                      <span className="text-sm text-gray-700">{product.stockCategory}</span>
                    </div>
                  )}
                  
                  {product.unit && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Unit</span>
                      <span className="text-sm text-gray-700">{product.unit}</span>
                    </div>
                  )}
                  
                  {product.minimumQuantity !== undefined && product.minimumQuantity > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Min Qty</span>
                      <span className="text-sm text-gray-700">{product.minimumQuantity}</span>
                    </div>
                  )}
                  
                  {product.defaultSupplier && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Default Supplier</span>
                      <span className="text-sm text-gray-700">{product.defaultSupplier}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Batch Managed</span>
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      {product.batch ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {product.openingQuantities && product.openingQuantities.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">Opening Stock:</p>
                    <div className="space-y-1">
                      {product.openingQuantities.map((qty, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span>{qty.godown}:</span>
                          <span>{qty.quantity} @ {qty.rate} = {qty.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Created: {product.createdAt}</p>
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
              {tabs.map(tab => (
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
                    <Input
                      placeholder="Product Code *"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      className="border-teal-200 focus:border-teal-500"
                    />
                    <Input
                      placeholder="Product Name *"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="border-teal-200 focus:border-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Input
                      placeholder="Part Number"
                      name="partNo"
                      value={form.partNo}
                      onChange={handleChange}
                      className="border-teal-200 focus:border-teal-500"
                    />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <select
                      value={form.stockGroup}
                      onChange={(e) => handleSelectChange("stockGroup", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Stock Group</option>
                      {groupParents.map(parent => (
                        <option key={parent} value={parent}>{parent}</option>
                      ))}
                    </select>
                    
                    <select
                      value={form.stockCategory}
                      onChange={(e) => handleSelectChange("stockCategory", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Stock Category</option>
                      {categoryParents.map(parent => (
                        <option key={parent} value={parent}>{parent}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <select
                      value={form.unit}
                      onChange={(e) => handleSelectChange("unit", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Unit</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.name}>
                          {unit.name} {unit.symbol && `(${unit.symbol})`}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={form.alternateUnit}
                      onChange={(e) => handleSelectChange("alternateUnit", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Alternate Unit</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.name}>
                          {unit.name} {unit.symbol && `(${unit.symbol})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="relative">
                      <Minus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="number"
                        placeholder="Minimum Quantity"
                        name="minimumQuantity"
                        value={form.minimumQuantity}
                        onChange={handleChange}
                        className="border-teal-200 focus:border-teal-500 pl-10"
                        min="0"
                      />
                    </div>
                    
                    <div className="relative">
                      <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={form.defaultSupplier}
                        onChange={(e) => handleSelectChange("defaultSupplier", e.target.value)}
                        className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white w-full pl-10"
                      >
                        <option value="">Select Default Supplier</option>
                        {suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.name}>
                            {supplier.name} ({supplier.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="relative">
                      <Minus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="number"
                        placeholder="Minimum Rate"
                        name="minimumRate"
                        value={form.minimumRate}
                        onChange={handleChange}
                        className="border-teal-200 focus:border-teal-500 pl-10"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="relative">
                      <Maximize className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="number"
                        placeholder="Maximum Rate"
                        name="maximumRate"
                        value={form.maximumRate}
                        onChange={handleChange}
                        className="border-teal-200 focus:border-teal-500 pl-10"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="relative">
                      <Warehouse className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={form.defaultGodown}
                        onChange={(e) => handleSelectChange("defaultGodown", e.target.value)}
                        className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white w-full pl-10"
                      >
                        <option value="">Select Default Godown</option>
                        {godowns.map(godown => (
                          <option key={godown.id} value={godown.name}>
                            {godown.name} ({godown.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => setActiveTab("tax")} className="bg-teal-600 hover:bg-teal-700">
                      Next: Tax
                    </Button>
                  </div>
                </div>
              )}

              {/* Tax Tab */}
              {activeTab === "tax" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <Archive className="w-5 h-5 mr-2" />
                    Tax Configuration
                  </h3>
                  
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">Tax Configuration</p>
                      <p className="text-gray-400 text-sm">Tax settings will be available here</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("basic")}>
                      Previous: Basic Info
                    </Button>
                    <Button onClick={() => setActiveTab("opening")} className="bg-teal-600 hover:bg-teal-700">
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
                      <label htmlFor="totalOpeningQuantity" className="block text-sm font-medium text-teal-700">
                        Total Opening Quantity
                      </label>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-teal-600">
                          Used: <span className="font-semibold">{usedQuantity}</span>
                        </span>
                        <span className="text-sm text-teal-600">
                          Remaining: <span className={`font-semibold ${remainingQuantity < 0 ? 'text-red-600' : ''}`}>
                            {remainingQuantity}
                          </span>
                        </span>
                      </div>
                    </div>
                    <Input
                      type="number"
                      id="totalOpeningQuantity"
                      value={totalOpeningQuantity}
                      onChange={(e) => setTotalOpeningQuantity(Math.max(0, Number(e.target.value)))}
                      min="0"
                      step="0.01"
                      className="border-teal-300 focus:border-teal-500"
                      placeholder="Enter total opening quantity"
                    />
                    {remainingQuantity < 0 && (
                      <p className="text-red-500 text-sm mt-2">
                        The total quantity in the table exceeds the available opening quantity.
                      </p>
                    )}
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-teal-50">
                          <th className="p-2 border border-teal-200 text-left">Godown</th>
                          <th className="p-2 border border-teal-200 text-left">Batch</th>
                          <th className="p-2 border border-teal-200 text-left">Quantity</th>
                          <th className="p-2 border border-teal-200 text-left">Rate</th>
                          <th className="p-2 border border-teal-200 text-left">Amount</th>
                          <th className="p-2 border border-teal-200 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {openingQuantities.map((item) => (
                          <tr key={item.id}>
                            <td className="p-2 border border-teal-200">
                              <select
                                value={item.godown}
                                onChange={(e) => handleOpeningQuantityChange(item.id, 'godown', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded"
                              >
                                <option value="">Select Godown</option>
                                {godowns.map(godown => (
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
                                onChange={(e) => handleOpeningQuantityChange(item.id, 'batch', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded"
                                placeholder="Enter batch number"
                                disabled={!form.batch}
                              />
                            </td>
                            <td className="p-2 border border-teal-200">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleOpeningQuantityChange(item.id, 'quantity', Number(e.target.value))}
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
                                onChange={(e) => handleOpeningQuantityChange(item.id, 'rate', Number(e.target.value))}
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
                                onClick={() => removeOpeningQuantityRow(item.id)}
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
                      <Button variant="outline" onClick={() => setActiveTab("tax")}>
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
                  
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <Settings2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">Product Settings</p>
                      <p className="text-gray-400 text-sm">Additional product settings will be available here</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("opening")}>
                      Previous: Opening
                    </Button>
                    <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
                      Save Product
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductPage;