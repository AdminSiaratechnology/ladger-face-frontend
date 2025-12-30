import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Edit2 } from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";
import api from "../../api/api";
import { toast } from "sonner";

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
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    name: selectedCustomer?.customerName || "",
    addressLine1: selectedCustomer?.addressLine1 || "",
    city: selectedCustomer?.city || "",
    state: selectedCustomer?.state || "",
    zipCode: selectedCustomer?.zipCode || "",
    phone: selectedCustomer?.phone || "",
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("Cash on Delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeliveryAddress({ ...deliveryAddress, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log(cart);
    const orderData = {
      companyId: company?._id,
      customerId: selectedCustomer?._id,
      orderSource: "website",

      shippingAddress: {
        street: deliveryAddress.addressLine1 || "",
        line2: "",
        city: deliveryAddress.city || "",
        state: deliveryAddress.state || "",
        postalCode: deliveryAddress.zipCode || "",
        country: "India",
      },

      items: cart.map((item: any) => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.minimumRate,
        total: item.minimumRate * item.quantity,
        discount: 0,
        batch: item.batch
          ? {
              stockItemId: item.batch.stockItemId,
              batchName: item.batch.batchName,
              godownName: item.batch.godownName,
            }
          : undefined,
      })),
    };

    try {
      const result = await api.createOrder(orderData);
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      console.error("Order failed", err);
      toast.error("Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-full mx-auto p-2">
      <div className="flex items-center gap-3 border-b pb-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-teal-600">New Order</h1>
          <h1 className="text-teal-900 font-bold">
            {selectedCustomer?.customerName}
            {selectedRoute && ` • ${selectedRoute}`}
          </h1>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold text-lg text-gray-700">Order Items</h2>
          <div className="divide-y">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-start py-3"
              >
                <div>
                  <h3 className="font-medium text-gray-800">{item.name}</h3>

                  {item.batch?.batchName && item.batch?.godownName && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Batch:{" "}
                      <span className="font-medium">
                        {item.batch.batchName}
                      </span>{" "}
                      • {item.batch.godownName}
                    </p>
                  )}

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
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg text-gray-700">
              Delivery Details
            </h2>
            {!isEditingAddress && (
              <button
                onClick={() => setIsEditingAddress(true)}
                className="text-sm text-teal-600 hover:underline"
              >
                <Edit2 className="w-4 h-4 cursor-pointer" />
              </button>
            )}
          </div>

          {!isEditingAddress ? (
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-800">
                {deliveryAddress.name}
              </p>
              <p>
                {[
                  deliveryAddress.addressLine1,
                  deliveryAddress.city,
                  deliveryAddress.state,
                  deliveryAddress.zipCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {/* <p>📞 {deliveryAddress.phone || "N/A"}</p> */}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                <CustomInputBox
                  label="Name"
                  name="name"
                  placeholder="Name"
                  value={deliveryAddress.name}
                  onChange={handleChange}
                />
                <CustomInputBox
                  label="Address Line 1"
                  name="addressLine1"
                  placeholder="Address Line 1"
                  value={deliveryAddress.addressLine1}
                  onChange={handleChange}
                />
                <CustomInputBox
                  label="City"
                  name="city"
                  placeholder="City"
                  value={deliveryAddress.city}
                  onChange={handleChange}
                />
                <CustomInputBox
                  label="State"
                  name="state"
                  placeholder="State"
                  value={deliveryAddress.state}
                  onChange={handleChange}
                />
                <CustomInputBox
                  label="ZIP Code"
                  name="zipCode"
                  placeholder="ZIP Code"
                  value={deliveryAddress.zipCode}
                  onChange={handleChange}
                />
                {/* <CustomInputBox
                  label="Phone"
                  name="phone"
                  placeholder="Phone"
                  value={deliveryAddress.phone}
                  onChange={handleChange}
                /> */}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setIsEditingAddress(false)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsEditingAddress(false)}
                  className="px-3 py-1 text-sm bg-teal-500 text-white rounded hover:bg-teal-600"
                >
                  Save
                </button>
              </div>
            </>
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
            {/* <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹50.00</span>
            </div> */}
            <div className="flex justify-between font-semibold border-t pt-2 text-gray-800">
              <span>Total</span>
              {/* <span>₹{(totalAmount + 50).toFixed(2)}</span> */}
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          {/* <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-1">Payment Method</h3>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option>Cash on Delivery</option>
              <option>Credit / Debit Card</option>
              <option>UPI / Wallet</option>
            </select>
          </div> */}

          <Button
            disabled={isSubmitting}
            className={`${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            } bg-blue-500 hover:bg-blue-600 text-white w-full mt-4  font-semibold py-2 rounded-l hover:shadow-xl transition-all text-sm md:text-base`}
            onClick={handlePayment}
            //  className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-lg"
          >
            {isSubmitting ? "Saving..." : "Place Order"}{" "}
          </Button>
        </div>
      </div>
    </div>
  );
}
