// src/components/dashboards/salesman/sections/CustomerMyOrders.tsx_
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  Package,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface OrderItem {
  productId: string;
  quantity: number;
  total: number;
}

interface Order {
  _id: string;
  orderCode: string;
  grandTotal: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  payment: { mode: string; status: string };
}

interface CustomerMyOrdersProps {
  orders: Order[];
}

export const CustomerMyOrders = ({ orders }: CustomerMyOrdersProps) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "completed":
        return {
          color: "bg-emerald-100 text-emerald-700",
          icon: <CheckCircle className="w-3 h-3" />,
        };
      case "pending":
        return {
          color: "bg-amber-100 text-amber-700",
          icon: <Clock className="w-3 h-3" />,
        };
      case "cancelled":
      case "rejected":
        return {
          color: "bg-rose-100 text-rose-700",
          icon: <AlertCircle className="w-3 h-3" />,
        };
      default:
        return {
          color: "bg-slate-100 text-slate-700",
          icon: <Package className="w-3 h-3" />,
        };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  if (!orders || orders.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600" />
            My Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6 text-gray-500 text-sm">
            No orders yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <Package className="w-5 h-5 text-teal-600" />
          My Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.slice(0, 5).map((order) => {
          const status = getStatusConfig(order.status);
          return (
            <div
              key={order._id}
              className="group flex items-center justify-between p-3 rounded-lg border border-gray-200/70 hover:bg-gray-50/70 transition-all duration-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-4.5 h-4.5 text-teal-700" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    #{order.orderCode}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-sm text-teal-700">
                  ₹{order.grandTotal.toLocaleString("en-IN")}
                </p>
                <Badge
                  className={`text-[10px] px-2 py-0.5 mt-1 flex items-center gap-0.5 ${status.color}`}
                >
                  {status.icon}
                  {order.status}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
