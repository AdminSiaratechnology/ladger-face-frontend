import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cart = [],
    selectedCustomer,
    selectedRoute,
    company,
    totalAmount = 0,
  } = location.state || {};
  const [formData, setFormData] = useState({});

  const handlePayment = () => {
    alert("Order placed successfully!");
    navigate("/orders");
  };

  return (
    <div className="max-w-full mx-auto p-2">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-teal-600">New Order</h1>
          <p className="text-gray-600 text-sm">
            {company?.namePrint} • {selectedRoute}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Order Items */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold text-lg text-gray-700 ">
            Order Items
          </h2>
          <div className="divide-y">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center py-2"
              >
                <div>
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    ₹{item.minimumRate?.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-gray-700">
                  ₹{(item.minimumRate * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Details */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="font-semibold text-lg text-gray-700 mb-2">
            Delivery Details
          </h2>
          {selectedCustomer ? (
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-medium text-gray-800">
                {selectedCustomer.customerName}
              </p>
              <p>
                {[
                  selectedCustomer.addressLine1,
                  selectedCustomer.city,
                  selectedCustomer.state,
                  selectedCustomer.zipCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>📞 {selectedCustomer.phone || "N/A"}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No customer selected
            </p>
          )}
        </div>

        {/* Order Summary */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold text-lg text-gray-700 mb-2">
            Order Summary
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>
                Subtotal{" "}
                <span className="text-gray-500">
                  ({cart.length} {cart.length === 1 ? "item" : "items"})
                </span>
              </span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹50.00</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2 text-gray-800">
              <span>Total</span>
              <span>₹{(totalAmount + 50).toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-1">Payment Method</h3>
            <select className="w-full border rounded-md px-3 py-2 text-sm">
              <option>Cash on Delivery</option>
              <option>Credit / Debit Card</option>
              <option>UPI / Wallet</option>
            </select>
          </div>

          <Button
            className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-lg"
            onClick={handlePayment}
          >
            Place Order →
          </Button>
        </div>
      </div>
    </div>
  );
}
