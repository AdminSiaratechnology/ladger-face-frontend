import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Plus, ShoppingCart } from "lucide-react";

export const CustomerQuickOrder = ({
  companyId,
  customerId,
}: {
  companyId: string;
  customerId: string;
}) => {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleQuickOrder = () => {
    console.log("Quick order:", { companyId, customerId, item, quantity });
    setItem("");
    setQuantity("");
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Quick Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Name
          </label>
          <Input
            placeholder="e.g., Paracetamol 500mg"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <Input
            type="number"
            placeholder="e.g., 10"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          onClick={handleQuickOrder}
          disabled={!item || !quantity}
          className="w-full bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Place Quick Order
        </Button>
      </CardContent>
    </Card>
  );
};
