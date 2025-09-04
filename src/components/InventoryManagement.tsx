import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  QrCode,
  ExternalLink,
  Zap,
  TrendingUp,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import MainGradientCards from './customComponents/mainGradientCards';

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  category: string;
  sku: string;
  unitPrice: number;
  stockLevel: number;
  minStockLevel: number;
  taxRate: number;
  supplier: string;
  syncSource?: 'tally' | 'quickbooks' | 'manual';
  lastUpdated: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

const mockItems: InventoryItem[] = [
  {
    id: 1,
    name: 'Premium Laptop',
    description: 'High-performance laptop for business use',
    category: 'Electronics',
    sku: 'LT-001',
    unitPrice: 85000,
    stockLevel: 25,
    minStockLevel: 10,
    taxRate: 18,
    supplier: 'TechCorp Ltd.',
    syncSource: 'tally',
    lastUpdated: '2024-08-30',
    status: 'in-stock'
  },
  {
    id: 2,
    name: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support',
    category: 'Furniture',
    sku: 'CH-001',
    unitPrice: 12000,
    stockLevel: 5,
    minStockLevel: 8,
    taxRate: 12,
    supplier: 'FurniWorld',
    syncSource: 'quickbooks',
    lastUpdated: '2024-08-29',
    status: 'low-stock'
  },
  {
    id: 3,
    name: 'Wireless Mouse',
    description: 'Bluetooth wireless mouse with precision tracking',
    category: 'Accessories',
    sku: 'MS-001',
    unitPrice: 2500,
    stockLevel: 0,
    minStockLevel: 20,
    taxRate: 18,
    supplier: 'TechCorp Ltd.',
    syncSource: 'tally',
    lastUpdated: '2024-08-28',
    status: 'out-of-stock'
  },
  {
    id: 4,
    name: 'Standing Desk',
    description: 'Height-adjustable standing desk',
    category: 'Furniture',
    sku: 'DK-001',
    unitPrice: 25000,
    stockLevel: 15,
    minStockLevel: 5,
    taxRate: 12,
    supplier: 'ErgoFurniture Co.',
    lastUpdated: '2024-08-30',
    status: 'in-stock'
  }
];

export function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>(mockItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    category: '',
    sku: '',
    unitPrice: '',
    stockLevel: '',
    minStockLevel: '',
    taxRate: '',
    supplier: ''
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(items.map(item => item.category))];

  const handleCreateItem = () => {
    const item: InventoryItem = {
      id: items.length + 1,
      name: newItem.name,
      description: newItem.description,
      category: newItem.category,
      sku: newItem.sku,
      unitPrice: parseFloat(newItem.unitPrice),
      stockLevel: parseInt(newItem.stockLevel),
      minStockLevel: parseInt(newItem.minStockLevel),
      taxRate: parseFloat(newItem.taxRate),
      supplier: newItem.supplier,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: parseInt(newItem.stockLevel) === 0 ? 'out-of-stock' : 
              parseInt(newItem.stockLevel) <= parseInt(newItem.minStockLevel) ? 'low-stock' : 'in-stock'
    };
    
    setItems([...items, item]);
    setNewItem({
      name: '',
      description: '',
      category: '',
      sku: '',
      unitPrice: '',
      stockLevel: '',
      minStockLevel: '',
      taxRate: '',
      supplier: ''
    });
    setIsCreateDialogOpen(false);
    toast.success('Item added successfully');
  };

  const handleDeleteItem = (itemId: number) => {
    setItems(items.filter(item => item.id !== itemId));
    toast.success('Item deleted successfully');
  };

  const handleSyncWithTally = () => {
    toast.info('Syncing with Tally ERP... This may take a few minutes');
    // Simulate sync process
    setTimeout(() => {
      toast.success('Successfully synced 15 items from Tally ERP');
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">In Stock</Badge>;
      case 'low-stock':
        return <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">Low Stock</Badge>;
      case 'out-of-stock':
        return <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSyncBadge = (source?: string) => {
    if (!source) return <Badge variant="outline" className="bg-gray-100">Manual</Badge>;
    
    switch (source) {
      case 'tally':
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">Tally ERP</Badge>;
      case 'quickbooks':
        return <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">QuickBooks</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100">Manual</Badge>;
    }
  };

  const stats = [
    { 
      label: 'Total Items', 
      value: items.length, 
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-100 to-blue-50',
      icon: <Package className="w-6 h-6 text-blue-600" />,
      trend: '+8%'
    },
    { 
      label: 'In Stock', 
      value: items.filter(i => i.status === 'in-stock').length, 
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-100 to-green-50',
      icon: <Zap className="w-6 h-6 text-green-600" />,
      trend: '+12%'
    },
    { 
      label: 'Low Stock', 
      value: items.filter(i => i.status === 'low-stock').length, 
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-100 to-amber-50',
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      trend: '-3%'
    },
    { 
      label: 'Out of Stock', 
      value: items.filter(i => i.status === 'out-of-stock').length, 
      color: 'text-red-600',
      bgColor: 'bg-gradient-to-br from-red-100 to-red-50',
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      trend: '+2%'
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
            Manage your products, stock levels, and ERP integrations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSyncWithTally}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync with Tally
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Scan Barcode
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-green-300 text-green-600 hover:bg-green-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-xl border-0 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-800">Add New Inventory Item</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Create a new product or service item with pricing and stock information.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700">Item Name</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Enter item name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="sku" className="text-gray-700">SKU</Label>
                  <Input
                    id="sku"
                    value={newItem.sku}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    placeholder="Product SKU"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description" className="text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Item description"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-gray-700">Category</Label>
                  <Input
                    id="category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    placeholder="Product category"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="supplier" className="text-gray-700">Supplier</Label>
                  <Input
                    id="supplier"
                    value={newItem.supplier}
                    onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                    placeholder="Supplier name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="unitPrice" className="text-gray-700">Unit Price (₹)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                    placeholder="0.00"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate" className="text-gray-700">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={newItem.taxRate}
                    onChange={(e) => setNewItem({ ...newItem, taxRate: e.target.value })}
                    placeholder="18"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="stockLevel" className="text-gray-700">Current Stock</Label>
                  <Input
                    id="stockLevel"
                    type="number"
                    value={newItem.stockLevel}
                    onChange={(e) => setNewItem({ ...newItem, stockLevel: e.target.value })}
                    placeholder="0"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="minStockLevel" className="text-gray-700">Min Stock Level</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    value={newItem.minStockLevel}
                    onChange={(e) => setNewItem({ ...newItem, minStockLevel: e.target.value })}
                    placeholder="10"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateItem}
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                >
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg overflow-hidden">
            <div className={`p-1 ${stat.bgColor}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                      <span className="text-xs font-medium text-green-600">{stat.trend}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-white shadow-sm">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
      <MainGradientCards stats={stats} />

      {/* ERP Integration Status */}
      <Card className="border-0 shadow-sm bg-white rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-800 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 text-blue-600" />
              ERP Integration Status
            </CardTitle>
          </CardHeader>
        </div>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
              <div>
                <h4 className="font-medium">Tally ERP</h4>
                <p className="text-sm text-gray-600">Last sync: 5 min ago</p>
                <p className="text-xs text-green-600">156 items synced</p>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
              <div>
                <h4 className="font-medium">QuickBooks</h4>
                <p className="text-sm text-gray-600">Last sync: 2 hours ago</p>
                <p className="text-xs text-blue-600">89 items synced</p>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
              <div>
                <h4 className="font-medium">Zoho Inventory</h4>
                <p className="text-sm text-gray-600">Not connected</p>
                <Button variant="outline" size="sm" className="mt-2 border-blue-300 text-blue-600 hover:bg-blue-50">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Connect
                </Button>
              </div>
              <Badge variant="secondary" className="bg-gray-200 text-gray-700">Disconnected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="border-0 shadow-sm bg-white rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-800 flex items-center">
              <Package className="w-5 h-5 mr-2 text-teal-600" />
              Inventory Items
            </CardTitle>
            <CardDescription className="text-gray-600">
              Manage your product catalog and stock levels
            </CardDescription>
          </CardHeader>
        </div>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search items by name, SKU, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 border-gray-300 focus:border-blue-500">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 border-gray-300 focus:border-blue-500">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <TableRow>
                  <TableHead className="text-gray-700 font-semibold">Item</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Category</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Stock</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Price</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Source</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.sku}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-100 text-gray-700">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className={item.stockLevel <= item.minStockLevel ? 'text-red-600 font-medium' : 'text-gray-900'}>
                          {item.stockLevel}
                        </span>
                        {item.stockLevel <= item.minStockLevel && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">Min: {item.minStockLevel}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">₹{item.unitPrice.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">{item.taxRate}% tax</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>{getSyncBadge(item.syncSource)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 float-right">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-md rounded-lg">
                          <DropdownMenuLabel className="text-gray-700">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-gray-700 hover:bg-blue-50 cursor-pointer">
                            <Edit className="w-4 h-4 mr-2 text-blue-500" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-700 hover:bg-blue-50 cursor-pointer">
                            <BarChart3 className="w-4 h-4 mr-2 text-purple-500" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-700 hover:bg-blue-50 cursor-pointer">
                            <QrCode className="w-4 h-4 mr-2 text-green-500" />
                            Generate Barcode
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 hover:bg-red-50 cursor-pointer"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}