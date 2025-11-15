// src/components/dashboards/shared/CustomerQuickOrder.tsx_
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { ShoppingBag } from "lucide-react";
import api from "../../../api/api";

interface Product {
  _id: string;
  ItemName: string;
  Price: number;
}

interface CustomerQuickOrderProps {
  companyId: string;
  customerId: string;
}

export function CustomerQuickOrder({
  companyId,
  customerId,
}: CustomerQuickOrderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.getProducts(companyId);
        setProducts(res.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [companyId]);

  const handlePlaceOrder = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    try {
      const orderData = {
        companyId,
        customerId,
        items: [
          {
            productId: selectedProduct._id,
            quantity,
            price: selectedProduct.Price,
            total: selectedProduct.Price * quantity,
          },
        ],
        orderSource: "portal",
      };
      await api.createOrder(orderData);
      alert("Order placed successfully!");
      setSelectedProduct(null);
      setQuantity(1);
    } catch (error) {
      alert("Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Order</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <select
            value={selectedProduct?._id || ""}
            onChange={(e) => {
              const prod = products.find((p) => p._id === e.target.value);
              setSelectedProduct(prod || null);
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Product</option>
            {products.map((prod) => (
              <option key={prod._id} value={prod._id}>
                {prod.ItemName} - ₹{prod.Price}
              </option>
            ))}
          </select>
          {selectedProduct && (
            <>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                min={1}
                className="w-full p-2 border rounded"
                placeholder="Quantity"
              />
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedProduct}
                className="w-full bg-teal-500 text-white py-2 rounded disabled:opacity-50 flex items-center justify-center"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Place Order (₹{selectedProduct.Price * quantity})
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
