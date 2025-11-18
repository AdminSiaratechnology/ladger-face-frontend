import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
  DollarSign,
  Users,
  Building,
  User2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import HeaderGradient from "../customComponents/HeaderGradint";
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";
import MultiStepNav from "../customComponents/MultiStepNav";
import { useCompanyStore } from "../../../store/companyStore";
import { useCustomerStore } from "../../../store/customerStore";
import { useOrderStore } from "../../../store/orderStore";
import CustomerDropdown from "../customComponents/CustomerSelector";
import ActionsDropdown from "../customComponents/ActionsDropdown";
import OrderDetailsModal from "../customComponents/OrderDetailsModal";
import OrderEditModal from "../customComponents/OrderEditModal";
import StatusDropdown from "../customComponents/StatusDropdown";
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
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "partial" | "paid" | "refunded";
  paymentMethod: "cash" | "card" | "upi" | "bank_transfer";
  orderDate: string;
  deliveryDate?: string;
  address: string;
  area: string;
  pincode: string;
  assignedSalesman?: string;
  trackingNumber?: string;
}

export default function OrderManagement() {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("route");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  // const [orders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const { companies, defaultSelected } = useCompanyStore();
  const { customers, filterCustomers, loading } = useCustomerStore();
  const company = defaultSelected;
  const selectedCustomer = customers.find((c) => c._id === selectedCustomerId);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { fetchOrders, orders, pagination, counts } = useOrderStore();
  const [selectedItem, setSelectedItem] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);
  const updateOrder = useOrderStore((s) => s.updateOrder);

  const handleViewOrder = (order: Order) => {
    setSelectedItem(order);
    setIsModalOpen(true);
  };
  useEffect(() => {
    fetchOrders(defaultSelected?._id, 1, 10);
  }, [defaultSelected]);

  useEffect(() => {
    filterCustomers("", "all", "nameAsc", 1, 100, defaultSelected?._id);
  }, [filterCustomers]);
  // Fetch orders with filters and pagination
  const fetchFilteredOrders = useCallback(
    (page: number = 1) => {
      const filters = {
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
        paymentStatus: paymentFilter !== "all" ? paymentFilter : undefined,
      };

      fetchOrders(defaultSelected?._id, page, 10, filters);
    },
    [defaultSelected, searchTerm, statusFilter, paymentFilter, fetchOrders]
  );

  // Debounced search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFilteredOrders(1);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [fetchFilteredOrders]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchFilteredOrders(newPage);
  };

  // Use the orders directly from store (they're already paginated from backend)
  const displayedOrders = orders;
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      console.log(order, "order");
      const matchesSearch =
        order.customerId?.customerName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.customerId?.emailAddress
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchesPayment =
        paymentFilter === "all" || order.paymentStatus === paymentFilter;

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
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles = {
      pending: "text-yellow-600 border-yellow-600",
      partial: "text-blue-600 border-blue-600",
      paid: "text-green-600 border-green-600",
      refunded: "text-red-600 border-red-600",
    };
    return (
      <Badge
        variant="outline"
        className={styles[status as keyof typeof styles]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getOrderProgress = (status: string) => {
    const progress = {
      pending: 20,
      confirmed: 40,
      shipped: 70,
      delivered: 100,
      cancelled: 0,
    };
    return progress[status as keyof typeof progress] || 0;
  };

  const stats = useMemo(
    () => [
      {
        label: "Total Orders",
        value: pagination?.totalRecords,
        color: "text-blue-600",
        bgColor: "from-blue-500 to-blue-600",
      },
      {
        label: "Pending",
        value: counts?.pending,
        color: "text-yellow-600",
        bgColor: "from-yellow-500 to-yellow-600",
      },
      {
        label: "Completed",
        value: counts?.completed,
        color: "text-purple-600",
        bgColor: "from-purple-500 to-purple-600",
      },
      {
        label: "Approved",
        value: counts?.approved,
        color: "text-green-600",
        bgColor: "from-green-500 to-green-600",
      },
    ],
    [orders]
  );
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-teal-50 to-blue-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th> */}
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th> */}
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedOrders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">
                      {order?.orderCode}
                    </p>
                    <p className="text-sm text-gray-600">{order?.createdAt}</p>
                    {order.trackingNumber && (
                      <p className="text-xs text-teal-600">
                        {order.trackingNumber}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {order?.customerId?.customerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order?.customerId?.emailAddress}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.shippingAddress?.street},{" "}
                      {order.shippingAddress?.line2},
                      {order.shippingAddress?.city} -{" "}
                      {order.shippingAddress?.postalCode}
                    </p>
                  </div>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">
                      ₹{order.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items.length} items
                    </p>
                  </div>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusDropdown
                    onStatusChange={(newStatus) => {
                      updateOrderStatus(order._id, newStatus);
                    }}
                    orderId={order._id}
                    status={order.status}
                  />
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {getPaymentBadge(order?.payment?.status)}
                    <p className="text-xs text-gray-600 capitalize">
                      {order.payment?.mode.replace("_", " ")}
                    </p>
                  </div>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-24">
                    <Progress
                      value={getOrderProgress(order.status)}
                      className="h-3 bg-gray-200 [&>[role=progressbar]]:bg-green-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      {getOrderProgress(order.status)}%
                    </p>
                  </div>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActionsDropdown
                    onView={() => handleViewOrder(order)}
                    onEdit={() => {
                      setSelectedItem(order);
                      setShowEditModal(true);
                    }}
                  />
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
        <Card
          key={order._id}
          className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
        >
          {/* HEADER */}
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                  {order.orderCode}
                </CardTitle>

                <p className="text-blue-600 font-medium">
                  {order?.customerId?.customerName}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(order.status)}
                <ActionsDropdown order={order} />
              </div>
            </div>
          </CardHeader>

          {/* BODY */}
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">
                  {order?.customerId?.emailAddress}
                </span>
              </div>

              {/* Phone — if exists */}
              {order?.customerId?.mobileNumber && (
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">
                    {order.customerId.mobileNumber}
                  </span>
                </div>
              )}

              {/* Address */}
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">
                  {order.shippingAddress?.street},{" "}
                  {order.shippingAddress?.line2}, {order.shippingAddress?.city}{" "}
                  - {order.shippingAddress?.postalCode}
                </span>
              </div>

              {/* Items */}
              <div className="flex items-center text-sm">
                <Package className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">
                  {order.items.length} items
                </span>
              </div>

              {/* Payment */}
              <div className="flex items-center text-sm">
                <CreditCard className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <div className="flex items-center gap-2">
                  {getPaymentBadge(order.payment?.status)}
                  <span className="text-xs text-gray-500 capitalize">
                    ({order.payment?.mode?.replace("_", " ")})
                  </span>
                </div>
              </div>

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="flex items-center text-sm">
                  <Truck className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">{order.trackingNumber}</span>
                </div>
              )}
            </div>

            {/* PROGRESS */}
            {/* <div className="pt-3">
            <Progress
              value={getOrderProgress(order.status)}
              className="h-3 bg-gray-200 [&>[role=progressbar]]:bg-green-500"
            />
            <p className="text-xs text-gray-600 mt-1 text-right">
              {getOrderProgress(order.status)}% Complete
            </p>
          </div> */}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm">
      <div className="text-sm text-gray-600">
        Showing {(pagination.currentPage - 1) * pagination.limit + 1} -{" "}
        {Math.min(
          pagination.currentPage * pagination.limit,
          pagination.totalRecords
        )}{" "}
        of {pagination.totalRecords} orders
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
  const handleContinueToCustomer = () => {
    setActiveTab("customer");
  };

  const handleFinish = () => {
    if (!selectedCustomer) return;
    console.log("company:", company);

    navigate("/select-products", {
      state: {
        company, // from your props/state
        selectedRoute, // from route selection
        selectedCustomer, // from dropdown or card selection
        customerId: selectedCustomer._id,
        routeId: selectedRoute?._id || selectedRoute, // handle both object or string
      },
    });
  };

  return (
    <div className="custom-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <HeaderGradient
          title="Order Management"
          subtitle="Process orders, track shipments, and manage payments"
        />
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="cursor-pointer">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </Button>
          <Button
            className="bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 cursor-pointer"
            onClick={() => {
              // resetForm();
              // navigate("/orders");
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`bg-gradient-to-br ${stat.bgColor} text-white border-0 shadow-lg`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    {stat.label}
                  </p>
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
                placeholder="Search by customer name"
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
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="approved">Approved</option>
            </select>
            {/* <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select> */}
            {(searchTerm ||
              statusFilter !== "all" ||
              paymentFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPaymentFilter("all");
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
              onClick={() => setViewMode("table")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === "table"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <TableIcon className="w-4 h-4 mr-2" />
              Table View
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === "cards"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
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
              {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first order to get started"}
            </p>
            {(searchTerm ||
              statusFilter !== "all" ||
              paymentFilter !== "all") && (
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPaymentFilter("all");
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
          {viewMode === "table" ? <TableView /> : <CardView />}
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
                <Progress
                  value={getOrderProgress(selectedOrder.status)}
                  className="h-3 bg-gray-200 [&>[role=progressbar]]:bg-green-500"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span
                    className={
                      selectedOrder.status === "pending"
                        ? "font-medium text-teal-600"
                        : ""
                    }
                  >
                    Pending
                  </span>
                  <span
                    className={
                      selectedOrder.status === "confirmed"
                        ? "font-medium text-teal-600"
                        : ""
                    }
                  >
                    Confirmed
                  </span>
                  <span
                    className={
                      selectedOrder.status === "shipped"
                        ? "font-medium text-teal-600"
                        : ""
                    }
                  >
                    Shipped
                  </span>
                  <span
                    className={
                      selectedOrder.status === "delivered"
                        ? "font-medium text-teal-600"
                        : ""
                    }
                  >
                    Delivered
                  </span>
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
                      <p className="font-medium">
                        {selectedOrder.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">
                        {selectedOrder.customerEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">
                        {selectedOrder.customerPhone}
                      </p>
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
                      <p className="font-medium">
                        {selectedOrder.area}, {selectedOrder.pincode}
                      </p>
                    </div>
                    {selectedOrder.assignedSalesman && (
                      <div>
                        <p className="text-sm text-gray-600">
                          Assigned Salesman
                        </p>
                        <p className="font-medium">
                          {selectedOrder.assignedSalesman}
                        </p>
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
                            <TableCell className="font-medium">
                              {item.name}
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              ₹{item.unitPrice.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ₹{item.total.toLocaleString()}
                            </TableCell>
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
                      <div className="mt-1">
                        {getPaymentBadge(selectedOrder.paymentStatus)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium capitalize">
                        {selectedOrder.paymentMethod.replace("_", " ")}
                      </p>
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
                        <p className="font-medium">
                          {selectedOrder.trackingNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order Status</p>
                        <div className="mt-1">
                          {getStatusBadge(selectedOrder.status)}
                        </div>
                      </div>
                      {selectedOrder.deliveryDate && (
                        <div>
                          <p className="text-sm text-gray-600">
                            Expected Delivery
                          </p>
                          <p className="font-medium">
                            {selectedOrder.deliveryDate}
                          </p>
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

      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <DialogContent className="custom-dialog-container max-w-3xl">
          <CustomFormDialogHeader
            title="Start Creating Your Order"
            subtitle="Follow the steps to set up your order"
          />

          <div className="flex-1 overflow-y-auto px-2">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 space-y-6">
              {/* -------------------- Step 1: Select Route -------------------- */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Route Name
                </label>
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="">-- Select a Route --</option>
                  <option value="Route 1">Route 1</option>
                  <option value="Route 2">Route 2</option>
                  <option value="Route 3">Route 3</option>
                </select>
              </div>

              {/* -------------------- Step 2: Select Customer -------------------- */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Customer
                </label>

                <CustomerDropdown
                  selectedCustomerId={selectedCustomerId}
                  setSelectedCustomerId={setSelectedCustomerId}
                />
              </div>

              {/* -------------------- Customer Info Card -------------------- */}
              {selectedCustomer && (
                <div className="mt-4 border rounded-lg p-4 bg-gray-50 shadow-sm">
                  <h2 className="text-lg font-semibold text-teal-600 mb-2">
                    Customer Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">Contact</span>
                      <span>{selectedCustomer?.customerName || "N/A"}</span>
                      <span>{selectedCustomer?.phoneNumber || "N/A"}</span>
                    </div>

                    {/* <div>
                      <span className="font-medium">Short Name: </span>
                      {selectedCustomer.shortName}
                    </div>
                    <div>
                      <span className="font-medium">Email: </span>
                      {selectedCustomer.emailAddress || "N/A"}
                    </div> */}
                    {/* <div>
                      <span className="font-medium">Phone: </span>
                      {selectedCustomer.phoneNumber || "N/A"}
                    </div> */}
                    {/* <div>
                      <span className="font-medium">City: </span>
                      {selectedCustomer.city}
                    </div>
                    <div>
                      <span className="font-medium">State: </span>
                      {selectedCustomer.state}
                    </div>
                    <div>
                      <span className="font-medium">Country: </span>
                      {selectedCustomer.country}
                    </div>
                    <div>
                      <span className="font-medium">Territory: </span>
                      {selectedCustomer.territory}
                    </div> */}
                    {/* <div>
                      <span className="font-medium">Status: </span>
                      <span
                        className={`${
                          selectedCustomer.customerStatus === "active"
                            ? "text-green-600"
                            : "text-red-500"
                        } font-medium`}
                      >
                        {selectedCustomer.customerStatus}
                      </span>
                    </div> */}
                    <div>
                      <span className="font-medium">Credit Days: </span>
                      {selectedCustomer.creditDays}
                    </div>
                    <div>
                      <span className="font-medium">Credit Limit: </span>
                      {selectedCustomer.creditLimit}
                    </div>
                    <div>
                      <span className="font-medium">Discount: </span>
                      {selectedCustomer.discount}%
                    </div>
                    {/* <div className="col-span-2">
                      <span className="font-medium">Address: </span>
                      <p>
                    {[
                      selectedCustomer.addressLine1,
                      selectedCustomer.city,
                      selectedCustomer.state && `(${selectedCustomer.state})`,
                      selectedCustomer.zipCode &&
                        ` ${selectedCustomer.zipCode}`,
                    ]
                      .filter(Boolean) 
                      .join(", ")}
                  </p>
                    </div> */}
                  </div>
                </div>
              )}

              {/* -------------------- Continue Button -------------------- */}
              <Button
                onClick={handleFinish}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white mt-3 cursor-pointer"
                disabled={!selectedCustomer}
              >
                Continue with Products →
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedItem}
      />
      <OrderEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        data={selectedItem}
        onSave={async (updated) => {
          try {
            if (!selectedItem?._id) return;

            await updateOrder(selectedItem._id, updated);

            toast.success("Order updated successfully");

            // ✅ optional: refresh list
            // await fetchOrders(defaultSelected?._id);

            // ✅ update selected item locally so modal shows updated values next time
            setSelectedItem(updated);
          } catch (err) {
            console.error("Update failed", err);
          }
        }}
      />
    </div>
  );
}
