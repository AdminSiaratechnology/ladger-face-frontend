// src/components/dashboards/shared/CustomerOrderHistory.tsx_
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";

interface MyOrder {
  _id: string;
  grandTotal: number;
  status: string;
  createdAt: string;
  items: Array<{ product: { ItemName: string }; quantity: number }>;
}

interface CustomerOrderHistoryProps {
  orders: MyOrder[];
}

export function CustomerOrderHistory({ orders }: CustomerOrderHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Order #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Items
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.slice(0, 10).map((o) => (
                  <tr key={o._id}>
                    <td className="px-4 py-2 text-sm">{o._id.slice(-6)}</td>
                    <td className="px-4 py-2 text-sm">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      {o.items.length}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-medium">
                      ₹{o.grandTotal.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Badge
                        variant={
                          o.status === "completed" ? "default" : "secondary"
                        }
                        className={
                          o.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {o.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
