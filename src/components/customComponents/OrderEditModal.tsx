import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import CustomInputBox from "./CustomInputBox";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

interface OrderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onSave: (updated: any) => void; // returns updated order payload
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
}) => {
  if (!data) return null;
  console.log(data);
  const [shipping, setShipping] = useState({
    street: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (data?.shippingAddress) {
      setShipping({
        street: data.shippingAddress.street || "",
        line2: data.shippingAddress.line2 || "",
        city: data.shippingAddress.city || "",
        state: data.shippingAddress.state || "",
        postalCode: data.shippingAddress.postalCode || "",
        country: data.shippingAddress.country || "",
      });
    }

    if (data?.items) {
      setItems(data.items.map((it: any) => ({ ...it })));
    }
  }, [data]);

  const handleShippingChange = (e: any) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        // ✅ Prevent quantity from becoming 0 or negative
        if (field === "quantity") {
          if (value <= 0) {
            toast.error("Quantity cannot be 0");
            return item; // ❌ Do not update
          }
        }

        const updated = { ...item, [field]: value };

        // ✅ Auto recalculate total
        updated.total =
          (updated.price - (updated.discount || 0)) * updated.quantity;

        return updated;
      })
    );
  };

  const handleSave = () => {
    const sanitizedItems = items.map((it) => ({
      ...it,
      total: (it.price - (it.discount || 0)) * it.quantity,
    }));

    const updatedOrder = {
      ...data,
      shippingAddress: shipping,
      items: sanitizedItems,
    };

    onSave(updatedOrder);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="custom-dialog-container p-0">
        <DialogHeader className="bg-gradient-to-r from-blue-200 to-blue-500 border-b border-gray-200 rounded-t-xl shadow-sm p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Order #{data.orderCode}
              </DialogTitle>
              <p className="text-sm text-gray-600">Order Details</p>
            </div>

            {data.status && (
              <Badge
                className={
                  data.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : data.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {data.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
          {/* ✅ SHIPPING ADDRESS */}
          <div className="border p-3 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">
              Shipping Address
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <CustomInputBox
                label="Street"
                name="street"
                value={shipping.street}
                onChange={handleShippingChange}
              />
              <CustomInputBox
                label="Line 2"
                name="line2"
                value={shipping.line2}
                onChange={handleShippingChange}
              />
              <CustomInputBox
                label="City"
                name="city"
                value={shipping.city}
                onChange={handleShippingChange}
              />
              <CustomInputBox
                label="State"
                name="state"
                readOnly
              />
              <CustomInputBox
                label="Postal Code"
                name="postalCode"
                readOnly
              />
              <CustomInputBox
                label="Country"
                name="country"
                readOnly
              />
            </div>
          </div>

          {/* ✅ ITEMS SECTION */}
          <div className="border p-3 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Items</h3>

            {items.map((item, index) => (
              <div
                key={index}
                className="relative border rounded-lg p-3 mb-3 bg-gray-50"
              >
                {items.length > 1 && (
                  <button
                    onClick={() =>
                      setItems((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {/* <CustomInputBox
                    label="Product Name"
                    value={item.productName}
                    readOnly
                  /> */}
                  <CustomInputBox
                    label="Product ID"
                    value={item.productId}
                    readOnly
                  />

                  <CustomInputBox
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", Number(e.target.value))
                    }
                  />

                  <CustomInputBox
                    label="Price"
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(index, "price", Number(e.target.value))
                    }
                  />

                  <CustomInputBox
                    label="Discount"
                    type="number"
                    value={item.discount}
                    onChange={(e) =>
                      updateItem(index, "discount", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ✅ ACTION BUTTONS */}
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditModal;
