import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { Target } from "lucide-react";

export const SalesmanTargetChart = ({
  target,
  achieved,
  period,
}: {
  target: number;
  achieved: number;
  period: string;
}) => {
  const percentage = target > 0 ? Math.min((achieved / target) * 100, 100) : 0;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-teal-600" />
          Target Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-teal-700">
            {percentage.toFixed(0)}%
          </p>
          <p className="text-sm text-gray-600">of {period} target</p>
        </div>
        <Progress
          value={percentage}
          className="h-3 bg-gray-200"
          indicatorClassName="bg-gradient-to-r from-teal-500 to-teal-600"
        />
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-600">Achieved</p>
            <p className="font-semibold">₹{(achieved / 100000).toFixed(1)}L</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Target</p>
            <p className="font-semibold">₹{(target / 100000).toFixed(1)}L</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
