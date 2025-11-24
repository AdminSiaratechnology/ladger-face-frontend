import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import { Users } from "lucide-react";

interface BottomRowProps {
  topCustomersData: Array<{ name: string; sales: number; fullName: string }>;
  recentActivities: Array<{
    id: number;
    action: string;
    user: string;
    time: string;
    amount: string;
  }>;
  integrationStats?: any[];
}

export const BottomRow = ({
  topCustomersData,
  recentActivities,
}: BottomRowProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>
            Highest revenue generating customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCustomersData?.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                No customers
              </div>
            ) : (
              topCustomersData?.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <h4
                        className="font-medium text-sm truncate"
                        title={c.fullName}
                      >
                        {c.name}
                      </h4>
                      <p className="text-xs text-gray-600">Regular Customer</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-sm whitespace-nowrap">
                      ₹{c.sales.toFixed(1)}L
                    </p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                No activities
              </div>
            ) : (
              recentActivities.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start space-x-3 p-2 hover:bg-gray-50/50 rounded-lg transition-colors"
                >
                  <div className="w-2 h-2 rounded-full mt-2 bg-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.action}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 truncate">
                        {a.user} • {a.time}
                      </p>
                      <p className="text-xs font-medium text-green-600 whitespace-nowrap ml-2">
                        {a.amount}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
