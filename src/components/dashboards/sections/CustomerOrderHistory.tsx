import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Package, Clock, CheckCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const CustomerOrderHistory = ({ orders }: { orders: any[] }) => {
  if (!orders || orders.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">No orders yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <Package className="w-5 h-5" />
          Recent Orders
        </CardTitle>
        <CardDescription>Your last 5 orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.slice(0, 5).map((order: any) => (
            <div
              key={order._id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200/70 hover:bg-gray-50/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    Order #{order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()} •{" "}
                    {order.items.length} items
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-teal-700">
                  ₹{order.grandTotal.toLocaleString()}
                </p>
                <Badge
                  className={`text-xs mt-1 ${
                    statusColors[order.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
