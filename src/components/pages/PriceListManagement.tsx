import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Switch } from '../ui/switch';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Users,
  MapPin,
  Calendar,
  Percent,
  Tag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';

interface PriceListItem {
  id: number;
  itemName: string;
  sku: string;
  basePrice: number;
  discountPercent: number;
  finalPrice: number;
  minQuantity?: number;
}

interface PriceList {
  id: number;
  name: string;
  description: string;
  type: 'wholesale' | 'retail' | 'vip' | 'regional';
  status: 'active' | 'inactive' | 'draft';
  validFrom: string;
  validUntil?: string;
  applicableAreas?: string[];
  applicablePincodes?: string[];
  assignedCustomers: number;
  items: PriceListItem[];
  createdAt: string;
  lastModified: string;
}

const mockPriceLists: PriceList[] = [
  {
    id: 1,
    name: 'Wholesale Price List',
    description: 'Special pricing for wholesale customers with bulk discounts',
    type: 'wholesale',
    status: 'active',
    validFrom: '2024-08-01',
    validUntil: '2024-12-31',
    assignedCustomers: 45,
    createdAt: '2024-08-01',
    lastModified: '2024-08-15',
    items: [
      { id: 1, itemName: 'Premium Laptop', sku: 'LT-001', basePrice: 85000, discountPercent: 15, finalPrice: 72250 },
      { id: 2, itemName: 'Office Chair', sku: 'CH-001', basePrice: 12000, discountPercent: 20, finalPrice: 9600, minQuantity: 5 },
      { id: 3, itemName: 'Standing Desk', sku: 'DK-001', basePrice: 25000, discountPercent: 10, finalPrice: 22500 }
    ]
  },
  {
    id: 2,
    name: 'Mumbai Regional Pricing',
    description: 'Special pricing for Mumbai customers including delivery charges',
    type: 'regional',
    status: 'active',
    validFrom: '2024-07-01',
    applicableAreas: ['Mumbai', 'Navi Mumbai', 'Thane'],
    applicablePincodes: ['400001', '400002', '400003'],
    assignedCustomers: 23,
    createdAt: '2024-07-01',
    lastModified: '2024-08-20',
    items: [
      { id: 1, itemName: 'Premium Laptop', sku: 'LT-001', basePrice: 85000, discountPercent: 5, finalPrice: 80750 },
      { id: 4, itemName: 'Wireless Mouse', sku: 'MS-001', basePrice: 2500, discountPercent: 0, finalPrice: 2500 }
    ]
  },
  {
    id: 3,
    name: 'VIP Customer Pricing',
    description: 'Exclusive pricing for VIP customers with premium support',
    type: 'vip',
    status: 'active',
    validFrom: '2024-08-01',
    assignedCustomers: 12,
    createdAt: '2024-08-01',
    lastModified: '2024-08-25',
    items: [
      { id: 1, itemName: 'Premium Laptop', sku: 'LT-001', basePrice: 85000, discountPercent: 25, finalPrice: 63750 },
      { id: 2, itemName: 'Office Chair', sku: 'CH-001', basePrice: 12000, discountPercent: 30, finalPrice: 8400 }
    ]
  },
  {
    id: 4,
    name: 'Seasonal Promotion Q4',
    description: 'Holiday season promotional pricing',
    type: 'retail',
    status: 'draft',
    validFrom: '2024-10-01',
    validUntil: '2024-12-31',
    assignedCustomers: 0,
    createdAt: '2024-08-30',
    lastModified: '2024-08-31',
    items: []
  }
];

export default function PriceListManagement() {
  const [priceLists, setPriceLists] = useState<PriceList[]>(mockPriceLists);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [newPriceList, setNewPriceList] = useState({
    name: '',
    description: '',
    type: 'retail' as PriceList['type'],
    validFrom: '',
    validUntil: '',
    applicableAreas: '',
    applicablePincodes: ''
  });

  const filteredPriceLists = priceLists.filter(priceList => {
    const matchesSearch = priceList.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         priceList.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || priceList.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || priceList.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreatePriceList = () => {
    const priceList: PriceList = {
      id: priceLists.length + 1,
      name: newPriceList.name,
      description: newPriceList.description,
      type: newPriceList.type,
      status: 'draft',
      validFrom: newPriceList.validFrom,
      validUntil: newPriceList.validUntil || undefined,
      applicableAreas: newPriceList.applicableAreas ? newPriceList.applicableAreas.split(',').map(a => a.trim()) : undefined,
      applicablePincodes: newPriceList.applicablePincodes ? newPriceList.applicablePincodes.split(',').map(p => p.trim()) : undefined,
      assignedCustomers: 0,
      items: [],
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    };
    
    setPriceLists([...priceLists, priceList]);
    setNewPriceList({
      name: '',
      description: '',
      type: 'retail',
      validFrom: '',
      validUntil: '',
      applicableAreas: '',
      applicablePincodes: ''
    });
    setIsCreateDialogOpen(false);
    toast.success('Price list created successfully');
  };

  const handleToggleStatus = (priceListId: number) => {
    setPriceLists(priceLists.map(priceList => 
      priceList.id === priceListId 
        ? { 
            ...priceList, 
            status: priceList.status === 'active' ? 'inactive' : 'active',
            lastModified: new Date().toISOString().split('T')[0]
          }
        : priceList
    ));
    toast.success('Price list status updated');
  };

  const handleDeletePriceList = (priceListId: number) => {
    setPriceLists(priceLists.filter(priceList => priceList.id !== priceListId));
    toast.success('Price list deleted successfully');
  };

  const handleDuplicatePriceList = (priceList: PriceList) => {
    const newPriceList: PriceList = {
      ...priceList,
      id: priceLists.length + 1,
      name: `${priceList.name} (Copy)`,
      status: 'draft',
      assignedCustomers: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    };
    
    setPriceLists([...priceLists, newPriceList]);
    toast.success('Price list duplicated successfully');
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'wholesale':
        return <Badge className="bg-blue-100 text-blue-800">Wholesale</Badge>;
      case 'retail':
        return <Badge className="bg-green-100 text-green-800">Retail</Badge>;
      case 'vip':
        return <Badge className="bg-purple-100 text-purple-800">VIP</Badge>;
      case 'regional':
        return <Badge className="bg-orange-100 text-orange-800">Regional</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = [
    { label: 'Total Price Lists', value: priceLists.length, color: 'text-blue-600' },
    { label: 'Active', value: priceLists.filter(p => p.status === 'active').length, color: 'text-green-600' },
    { label: 'Customers Assigned', value: priceLists.reduce((sum, p) => sum + p.assignedCustomers, 0), color: 'text-purple-600' },
    { label: 'Regional Lists', value: priceLists.filter(p => p.type === 'regional').length, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Price List Management</h1>
          <p className="text-gray-600 mt-1">Create and manage custom pricing for different customer segments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Pricing
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Price List
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Price List</DialogTitle>
                <DialogDescription>
                  Set up a new pricing structure for specific customer segments or regions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Price List Name</Label>
                    <Input
                      id="name"
                      value={newPriceList.name}
                      onChange={(e) => setNewPriceList({ ...newPriceList, name: e.target.value })}
                      placeholder="e.g. Wholesale Q4 2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newPriceList.type} onValueChange={(value: PriceList['type']) => setNewPriceList({ ...newPriceList, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="regional">Regional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newPriceList.description}
                    onChange={(e) => setNewPriceList({ ...newPriceList, description: e.target.value })}
                    placeholder="Describe the pricing strategy and target customers"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={newPriceList.validFrom}
                      onChange={(e) => setNewPriceList({ ...newPriceList, validFrom: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={newPriceList.validUntil}
                      onChange={(e) => setNewPriceList({ ...newPriceList, validUntil: e.target.value })}
                    />
                  </div>
                </div>
                {(newPriceList.type === 'regional') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="areas">Applicable Areas</Label>
                      <Input
                        id="areas"
                        value={newPriceList.applicableAreas}
                        onChange={(e) => setNewPriceList({ ...newPriceList, applicableAreas: e.target.value })}
                        placeholder="Mumbai, Delhi, Bangalore"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincodes">Applicable Pincodes</Label>
                      <Input
                        id="pincodes"
                        value={newPriceList.applicablePincodes}
                        onChange={(e) => setNewPriceList({ ...newPriceList, applicablePincodes: e.target.value })}
                        placeholder="400001, 400002, 400003"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePriceList}>
                  Create Price List
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <DollarSign className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Price Lists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Price Lists</CardTitle>
          <CardDescription>
            Manage pricing strategies for different customer segments and regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search price lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Price List</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPriceLists.map((priceList) => (
                  <TableRow key={priceList.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{priceList.name}</p>
                        <p className="text-sm text-gray-600">{priceList.description}</p>
                        <p className="text-xs text-gray-500">Modified: {priceList.lastModified}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(priceList.type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={priceList.status === 'active'}
                          onCheckedChange={() => handleToggleStatus(priceList.id)}
                          disabled={priceList.status === 'draft'}
                        />
                        {getStatusBadge(priceList.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">From: {priceList.validFrom}</p>
                        {priceList.validUntil && (
                          <p className="text-sm">Until: {priceList.validUntil}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-gray-400" />
                        <span>{priceList.assignedCustomers}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{priceList.items.length}</span>
                      <span className="text-sm text-gray-600 ml-1">items</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedPriceList(priceList);
                            setIsDetailDialogOpen(true);
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Price List
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicatePriceList(priceList)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="w-4 h-4 mr-2" />
                            Assign Customers
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeletePriceList(priceList.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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

      {/* Price List Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Price List Details - {selectedPriceList?.name}</DialogTitle>
            <DialogDescription>
              Manage items and pricing rules for this price list
            </DialogDescription>
          </DialogHeader>
          {selectedPriceList && (
            <Tabs defaultValue="items" className="w-full">
              <TabsList>
                <TabsTrigger value="items">Items & Pricing</TabsTrigger>
                <TabsTrigger value="rules">Pricing Rules</TabsTrigger>
                <TabsTrigger value="customers">Assigned Customers</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="items" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Price List Items</h4>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Final Price</TableHead>
                      <TableHead>Min Quantity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPriceList.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.itemName}</p>
                            <p className="text-sm text-gray-600">{item.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell>₹{item.basePrice.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <Percent className="w-3 h-3 mr-1" />
                            {item.discountPercent}%
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">₹{item.finalPrice.toLocaleString()}</TableCell>
                        <TableCell>
                          {item.minQuantity ? `${item.minQuantity} units` : '-'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="rules" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Pricing Rules & Conditions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Quantity-based Discounts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm">Automatically apply discounts based on order quantity</p>
                          <Button variant="outline" size="sm">Configure Rules</Button>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Time-based Pricing</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm">Set seasonal or promotional pricing</p>
                          <Button variant="outline" size="sm">Setup Schedule</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="customers" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Assigned Customers</h4>
                    <Button size="sm">Assign More Customers</Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedPriceList.assignedCustomers} customers are currently assigned to this price list
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Price List Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Valid From</Label>
                      <Input type="date" value={selectedPriceList.validFrom} />
                    </div>
                    <div>
                      <Label>Valid Until</Label>
                      <Input type="date" value={selectedPriceList.validUntil || ''} />
                    </div>
                  </div>
                  {selectedPriceList.applicableAreas && (
                    <div>
                      <Label>Applicable Areas</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedPriceList.applicableAreas.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}