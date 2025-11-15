import React from "react";
import { Card, CardContent } from "../../ui/card";

export const SalesmanPersonalStats = ({
  personalData,
  periodLabel,
}: {
  personalData: any;
  periodLabel: string;
}) => {
  return (
    <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm opacity-90">My Revenue ({periodLabel})</p>
            <p className="text-2xl font-bold">
              ₹{(personalData.totalSales || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90">My Orders</p>
            <p className="text-2xl font-bold">
              {personalData.totalOrders || 0}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-sm opacity-90">Avg Order Value</p>
            <p className="text-xl font-bold">
              ₹
              {Math.round(personalData.averageOrderValue || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
