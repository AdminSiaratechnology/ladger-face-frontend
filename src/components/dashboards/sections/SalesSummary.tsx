import React from "react";
import { Card, CardContent } from "../../ui/card";
import { ShoppingBag, Package, TrendingUp } from "lucide-react";

export const SalesSummary = ({
  todaySales,
  lastMonthSales,
  totalSales,
  role,
}: any) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Today's Purchases</p>
              <p className="text-xl md:text-2xl font-bold">
                ₹{(todaySales || 0).toLocaleString()}
              </p>
            </div>
            <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Last Month</p>
              <p className="text-xl md:text-2xl font-bold">
                ₹{(lastMonthSales || 0).toLocaleString()}
              </p>
            </div>
            <Package className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Spent</p>
              <p className="text-xl md:text-2xl font-bold">
                ₹{(totalSales || 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
