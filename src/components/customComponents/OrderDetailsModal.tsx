import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const InfoRow = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="py-1 border-b border-gray-100 last:border-b-0">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900 break-words">
        {String(value)}
      </p>
    </div>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <div className="flex items-center mb-2 bg-gradient-to-r from-blue-50 to-blue-100">
    <div className="w-1 h-4 bg-blue-500 rounded mr-3"></div>
    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
  </div>
);

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!data) return null;

  const order = data;

  // ✅ CUSTOMER INFO (nested)
  const customer = order.customerId || {};

  // ✅ PAYMENT
  const payment = order.payment || {};

  // ✅ SHIPPING
  const ship = order.shippingAddress || {};

  // ✅ Sections grouped for clean display
  const sections = [
    {
      title: "Order Information",
      fields: [
        ["Order Code", order.orderCode],
        ["Order Source", order.orderSource],
        ["Status", order.status],
        ["Created By", order.createdBy],
        [
          "Created At",
          order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : "",
        ],
      ],
    },

    {
      title: "Customer Details",
      fields: [
        ["Customer Name", customer.customerName],
        ["Email", customer.emailAddress],
        ["Phone", customer.mobileNumber],
        ["Customer ID", customer._id],
      ],
    },

    {
      title: "Payment Details",
      fields: [
        ["Mode", payment.mode],
        ["Status", payment.status],
      ],
    },

    {
      title: "Shipping Address",
      fields: [
        ["Street", ship.street],
        ["Line 2", ship.line2],
        ["City", ship.city],
        ["State", ship.state],
        ["Postal Code", ship.postalCode],
        ["Country", ship.country],
      ],
    },

    {
      title: "Tally / Sync",
      fields: [
        ["Invoice Number", order.InvoiceNumber],
        ["Bill Generated", order.BillGenerated ? "Yes" : "No"],
        ["Tally Transaction ID", order.TallyTransactionID],
        [
          "Tally Date",
          order.TallyDate ? new Date(order.TallyDate).toLocaleString() : "",
        ],
        [
          "Sync Date",
          order.syncDate ? new Date(order.syncDate).toLocaleString() : "",
        ],
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="custom-dialog-container p-0">
        <DialogHeader className="bg-gradient-to-r from-blue-200 to-blue-500 border-b border-gray-200 rounded-t-xl shadow-sm p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Order #{order.orderCode}
              </DialogTitle>
              <p className="text-sm text-gray-600">Order Details</p>
            </div>

            {order.status && (
              <Badge
                className={
                  order.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : order.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {order.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto p-3">
          {/* ✅ Render all grouped sections */}
          {sections.map(
            (section, idx) =>
              section.fields.some(([, value]) => value) && (
                <Card key={idx} className="border-0 shadow-md mb-3">
                  <CardContent>
                    <SectionTitle title={section.title} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
                      {section.fields.map(
                        ([label, value], i) =>
                          value && <InfoRow key={i} label={label} value={value} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
          )}

          {/* ✅ ITEMS SECTION */}
          {order.items?.length > 0 && (
            <Card className="border-0 shadow-md mb-3">
              <CardContent>
                <SectionTitle title="Items" />

                {order.items.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 border rounded-lg bg-gray-50 mb-2"
                  >
                    <InfoRow label="Product ID" value={item.productId} />
                    <InfoRow label="Quantity" value={item.quantity} />
                    <InfoRow label="Price" value={item.price} />
                    <InfoRow label="Total" value={item.total} />
                    <InfoRow label="Discount" value={item.discount} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ✅ Meta */}
          {/* <div className="text-xs text-gray-500 py-3">
            {order.updatedAt && (
              <div>
                Updated: {new Date(order.updatedAt).toLocaleString()}
              </div>
            )}
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
