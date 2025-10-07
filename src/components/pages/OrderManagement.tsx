import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
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
} from '../ui/dialog';
import { 
  ShoppingCart, 
  Search, 
  Download, 
  Plus,
  MoreHorizontal,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Table as TableIcon,
  Grid3X3,
  X,
  Package,
  Building2,
  Phone,
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import HeaderGradient from '../customComponents/HeaderGradint';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
  orderDate: string;
  deliveryDate?: string;
  address: string;
  area: string;
  pincode: string;
  assignedSalesman?: string;
  trackingNumber?: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    customerPhone: '+91 9876543210',
    items: [
      { id: 1, name: 'Premium Laptop', quantity: 1, unitPrice: 85000, total: 85000 },
      { id: 2, name: 'Wireless Mouse', quantity: 2, unitPrice: 2500, total: 5000 }
    ],
    subtotal: 90000,
    tax: 16200,
    total: 106200,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    orderDate: '2024-08-30',
    deliveryDate: '2024-09-05',
    address: '123 Business Park',
    area: 'Mumbai',
    pincode: '400001',
    assignedSalesman: 'Alice Johnson',
    trackingNumber: 'TRK123456789'
  },
  {
    id: 'ORD-002',
    customerName: 'Sarah Davis',
    customerEmail: 'sarah@example.com',
    customerPhone: '+91 9876543211',
    items: [
      { id: 3, name: 'Office Chair', quantity: 5, unitPrice: 12000, total: 60000 }
    ],
    subtotal: 60000,
    tax: 7200,
    total: 67200,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'bank_transfer',
    orderDate: '2024-08-31',
    address: '456 Corporate Tower',
    area: 'Delhi',
    pincode: '110001',
    assignedSalesman: 'Bob Smith'
  },
  {
    id: 'ORD-003',
    customerName: 'Mike Wilson',
    customerEmail: 'mike@example.com',
    customerPhone: '+91 9876543212',
    items: [
      { id: 4, name: 'Standing Desk', quantity: 2, unitPrice: 25000, total: 50000 }
    ],
    subtotal: 50000,
    tax: 6000,
    total: 56000,
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'upi',
    orderDate: '2024-08-29',
    deliveryDate: '2024-09-03',
    address: '789 Tech Hub',
    area: 'Bangalore',
    pincode: '560001',
    assignedSalesman: 'Carol Davis',
    trackingNumber: 'TRK987654321'
  },
  {
    id: 'ORD-004',
    customerName: 'Emma Brown',
    customerEmail: 'emma@example.com',
    customerPhone: '+91 9876543213',
    items: [
      { id: 5, name: 'Monitor 27"', quantity: 3, unitPrice: 18000, total: 54000 }
    ],
    subtotal: 54000,
    tax: 9720,
    total: 63720,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'upi',
    orderDate: '2024-08-25',
    deliveryDate: '2024-08-28',
    address: '321 Tech Park',
    area: 'Pune',
    pincode: '411001',
    assignedSalesman: 'David Lee',
    trackingNumber: 'TRK456789123'
  }
];

export default function OrderManagement() {
  const [orders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
      
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return <Badge className={styles[status as keyof typeof styles]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const styles = {
      pending: 'text-yellow-600 border-yellow-600',
      partial: 'text-blue-600 border-blue-600',
      paid: 'text-green-600 border-green-600',
      refunded: 'text-red-600 border-red-600'
    };
    return <Badge variant="outline" className={styles[status as keyof typeof styles]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getOrderProgress = (status: string) => {
    const progress = {
      pending: 20,
      confirmed: 40,
      shipped: 70,
      delivered: 100,
      cancelled: 0
    };
    return progress[status as keyof typeof progress] || 0;
  };

  const stats = useMemo(() => [
    { label: 'Total Orders', value: orders.length, color: 'text-blue-600', bgColor: 'from-blue-500 to-blue-600' },
    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'text-yellow-600', bgColor: 'from-yellow-500 to-yellow-600' },
    { label: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, color: 'text-purple-600', bgColor: 'from-purple-500 to-purple-600' },
    { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'text-green-600', bgColor: 'from-green-500 to-green-600' },
  ], [orders]);

  const ActionsDropdown = ({ order }: { order: Order }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          setSelectedOrder(order);
          setIsOrderDialogOpen(true);
        }}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CheckCircle className="w-4 h-4 mr-2" />
          Update Status
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Truck className="w-4 h-4 mr-2" />
          Track Order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-teal-50 to-blue-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.orderDate}</p>
                    {order.trackingNumber && (
                      <p className="text-xs text-teal-600">{order.trackingNumber}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.customerEmail}</p>
                    <p className="text-xs text-gray-500">{order.area}, {order.pincode}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">₹{order.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{order.items.length} items</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {getPaymentBadge(order.paymentStatus)}
                    <p className="text-xs text-gray-600 capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-24">
                    <Progress value={getOrderProgress(order.status)} className="h-3 bg-gray-200 [&>[role=progressbar]]:bg-green-500"  />
                    <p className="text-xs text-gray-600 mt-1">{getOrderProgress(order.status)}%</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActionsDropdown order={order} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {paginatedOrders.map((order) => (
        <Card key={order.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800 mb-1">{order.id}</CardTitle>
                <p className="text-blue-600 font-medium">{order.customerName}</p>
                <p className="text-sm text-gray-600 mt-1">{order.orderDate}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(order.status)}
                <ActionsDropdown order={order} />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">{order.customerEmail}</span>
              </div>

              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">{order.customerPhone}</span>
              </div>

              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">{order.area}, {order.pincode}</span>
              </div>

              <div className="flex items-center text-sm">
                <Package className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">{order.items.length} items</span>
              </div>

              <div className="flex items-center text-sm">
                <DollarSign className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600 font-semibold">₹{order.total.toLocaleString()}</span>
              </div>

              <div className="flex items-center text-sm">
                <CreditCard className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <div className="flex items-center gap-2">
                  {getPaymentBadge(order.paymentStatus)}
                  <span className="text-xs text-gray-500 capitalize">({order.paymentMethod.replace('_', ' ')})</span>
                </div>
              </div>

              {order.trackingNumber && (
                <div className="flex items-center text-sm">
                  <Truck className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">{order.trackingNumber}</span>
                </div>
              )}
            </div>

            <div className="pt-3">
              <Progress value={getOrderProgress(order.status)} className="h-3 bg-gray-200 [&>[role=progressbar]]:bg-green-500 bg-amber-400"  />
              <p className="text-xs text-gray-600 mt-1 text-right">{getOrderProgress(order.status)}% Complete</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm">
      <div className="text-sm text-gray-600">
        Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
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
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
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
       
        <HeaderGradient title='Order Management' subtitle='Process orders, track shipments, and manage payments'/>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </Button>
          <Button className="bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800">
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className={`bg-gradient-to-br ${stat.bgColor} text-white border-0 shadow-lg`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-white/70" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <Card className="mb-6 shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by order ID, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
            {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                  setCurrentPage(1);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      {filteredOrders.length > 0 && (
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
              <TableIcon className="w-4 h-4 mr-2" />
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
      )}

      {/* Content */}
      {filteredOrders.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">
              No orders found
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first order to get started'}
            </p>
            {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'table' ? <TableView /> : <CardView />}
          <PaginationControls />
        </>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Complete order information and management options
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Order Status Progress */}
              <div className="space-y-2">
                <h4 className="font-medium">Order Progress</h4>
                <Progress value={getOrderProgress(selectedOrder.status)}  className="h-3 bg-gray-200 [&>[role=progressbar]]:bg-green-500"  />
                <div className="flex justify-between text-sm text-gray-600">
                  <span className={selectedOrder.status === 'pending' ? 'font-medium text-teal-600' : ''}>Pending</span>
                  <span className={selectedOrder.status === 'confirmed' ? 'font-medium text-teal-600' : ''}>Confirmed</span>
                  <span className={selectedOrder.status === 'shipped' ? 'font-medium text-teal-600' : ''}>Shipped</span>
                  <span className={selectedOrder.status === 'delivered' ? 'font-medium text-teal-600' : ''}>Delivered</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <User className="w-5 h-5 mr-2" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedOrder.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedOrder.customerPhone}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <MapPin className="w-5 h-5 mr-2" />
                      Delivery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{selectedOrder.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Area & Pincode</p>
                      <p className="font-medium">{selectedOrder.area}, {selectedOrder.pincode}</p>
                    </div>
                    {selectedOrder.assignedSalesman && (
                      <div>
                        <p className="text-sm text-gray-600">Assigned Salesman</p>
                        <p className="font-medium">{selectedOrder.assignedSalesman}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{item.unitPrice.toLocaleString()}</TableCell>
                            <TableCell>₹{item.total.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2 text-right">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>₹{selectedOrder.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>₹{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment & Tracking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <div className="mt-1">{getPaymentBadge(selectedOrder.paymentStatus)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium capitalize">{selectedOrder.paymentMethod.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium">{selectedOrder.orderDate}</p>
                    </div>
                  </CardContent>
                </Card>

                {selectedOrder.trackingNumber && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Truck className="w-5 h-5 mr-2" />
                        Tracking Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Tracking Number</p>
                        <p className="font-medium">{selectedOrder.trackingNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order Status</p>
                        <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                      </div>
                      {selectedOrder.deliveryDate && (
                        <div>
                          <p className="text-sm text-gray-600">Expected Delivery</p>
                          <p className="font-medium">{selectedOrder.deliveryDate}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Print Invoice
                </Button>
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Notification
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}