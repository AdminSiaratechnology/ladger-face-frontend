import React from "react";
import { Card, CardContent } from "../../ui/card";
import { Banknote, ShoppingCart, Target, TrendingUp } from "lucide-react";

export const SummaryStats = ({ dateRangeData }: { dateRangeData: any }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Total Revenue</p>
            <p className="text-xl md:text-2xl font-bold">
              ₹{(dateRangeData?.totalSales || 0).toLocaleString()}
            </p>
          </div>
          <Banknote className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Total Orders</p>
            <p className="text-xl md:text-2xl font-bold">
              {dateRangeData?.totalOrders || 0}
            </p>
          </div>
          <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Avg Order Value</p>
            <p className="text-xl md:text-2xl font-bold">
              ₹
              {Math.round(
                dateRangeData?.averageOrderValue || 0
              ).toLocaleString()}
            </p>
          </div>
          <Target className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
        </div>
      </CardContent>
    </Card>
    {/* <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Total Discount</p>
            <p className="text-xl md:text-2xl font-bold">
              ₹{(dateRangeData?.totalDiscount || 0).toLocaleString()}
            </p>
          </div>
          <TrendingUp className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
        </div>
      </CardContent>
    </Card> */}
  </div>
);
