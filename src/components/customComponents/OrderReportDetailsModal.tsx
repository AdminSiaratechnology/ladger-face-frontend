import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  CreditCard,
  MapPin,
  Box,
  CalendarDays,
  Hash,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Receipt,
} from "lucide-react";
import { useCompanyStore } from "../../../store/companyStore";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!data) return null;

  const order = data;
  const customer = order.customer || {};
  const payment = order.payment || {};
  const ship = order.shippingAddress || {};
    const { defaultSelected } = useCompanyStore();
      const defaultCurrency = defaultSelected?.defaultCurrencySymbol || "₹";
  

  // ✨ Gradient Status Badges
  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        return {
          className:
            "bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-800 border-emerald-200",
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />,
        };
      case "pending":
        return {
          className:
            "bg-gradient-to-r from-amber-50 to-orange-100 text-amber-800 border-amber-200",
          icon: <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-600" />,
        };
      case "cancelled":
        return {
          className:
            "bg-gradient-to-r from-red-50 to-rose-100 text-red-800 border-red-200",
          icon: <XCircle className="w-3.5 h-3.5 mr-1.5 text-red-600" />,
        };
      default:
        return {
          className:
            "bg-gradient-to-r from-slate-50 to-gray-100 text-slate-800 border-slate-200",
          icon: <Hash className="w-3.5 h-3.5 mr-1.5 text-slate-600" />,
        };
    }
  };

  const statusStyle = getStatusStyle(order.status);

  // ✨ Reusable Section with Gradient Icon
  const Section = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center gap-3 mb-3 sm:mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm shadow-blue-200">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 sm:gap-y-5 gap-x-8 bg-slate-50/50 p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
        {children}
      </div>
    </div>
  );

  // Field Component
  const Field = ({
    label,
    value,
    fullWidth = false,
  }: {
    label: string;
    value: any;
    fullWidth?: boolean;
  }) => {
    if (!value && value !== 0) return null;
    return (
      <div className={fullWidth ? "col-span-1 md:col-span-2" : ""}>
        <p className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-900 break-words leading-relaxed">
          {value}
        </p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] custom-dialog-container p-0 gap-0 border-0 shadow-2xl overflow-hidden rounded-xl sm:rounded-2xl bg-white">
        
        {/* ✨ Gradient Header */}
        <DialogHeader className="p-4 sm:p-6 pb-4 sm:pb-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-slate-400 hidden sm:block" />
                <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-slate-400 sm:hidden" />
                  Order <span className="text-blue-600">#{order.orderCode}</span>
                </DialogTitle>
              </div>
              <DialogDescription className="text-slate-500 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium">
                <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                {new Date(order.createdAt).toLocaleString(undefined, {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </DialogDescription>
            </div>
            
            <Badge
              variant="outline"
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-full shadow-sm flex items-center self-start sm:self-center ${statusStyle.className}`}
            >
              {statusStyle.icon}
              <span className="capitalize">{order.status}</span>
            </Badge>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="h-[calc(90vh-100px)] sm:h-[calc(90vh-110px)] bg-white">
          <div className="p-4 sm:p-6 lg:p-8 space-y-2">
            
            {/* Top Grid: Customer & Payment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              <Section title="Customer Details" icon={User}>
                <Field label="Name" value={customer.customerName || customer.contactPerson} />
                <Field label="Phone" value={customer.phoneNumber || customer.mobileNumber} />
                <Field label="Email" value={customer.emailAddress} fullWidth />
              </Section>

              <Section title="Payment & Logistics" icon={CreditCard}>
                <Field label="Payment Mode" value={payment.mode} />
                <Field label="Payment Status" value={payment.status} />
                <Field label="Source" value={order.orderSource} />
                <Field label="Created By" value={order.createdBy || "System"} />
              </Section>
            </div>

            {/* Shipping Address */}
            <Section title="Shipping Address" icon={MapPin}>
              <Field label="Address" value={ship.street} fullWidth />
              {ship.line2 && <Field label="Line 2" value={ship.line2} fullWidth />}
              <Field label="City" value={ship.city} />
              <Field label="State" value={ship.state} />
              <Field label="Postal Code" value={ship.postalCode} />
              <Field label="Country" value={ship.country} />
            </Section>

            {/* Items Table - Clean & Modern & Responsive */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-sm shadow-purple-200">
                  <Box className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Order Items
                </h3>
              </div>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[600px]">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 sm:px-5 py-3.5">Product</th>
                        <th className="px-4 sm:px-5 py-3.5 text-center">HSN</th>
                        <th className="px-4 sm:px-5 py-3.5 text-center">Qty</th>
                        <th className="px-4 sm:px-5 py-3.5 text-right">Price</th>
                        <th className="px-4 sm:px-5 py-3.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {order.items?.map((item: any, idx: number) => (
                        <tr key={idx} className="group hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 sm:px-5 py-4">
                            <div className="font-medium text-slate-900">
                              {item.productId?.productId?.ItemName || item.productId || "Item"}
                            </div>
                            {item.discount > 0 && (
                              <span className="inline-flex items-center mt-1 text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                Discount Applied
                              </span>
                            )}
                          </td>
                          <td className="px-4 sm:px-5 py-4 text-center text-slate-500 font-mono text-xs">
                            {item.hsnCode || "-"}
                          </td>
                          <td className="px-4 sm:px-5 py-4 text-center font-medium text-slate-700">
                            {item.quantity}
                          </td>
                          <td className="px-4 sm:px-5 py-4 text-right text-slate-600">
                            {defaultCurrency} {item.price?.toLocaleString()}
                          </td>
                          <td className="px-4 sm:px-5 py-4 text-right font-semibold text-slate-900">
                            {defaultCurrency} {item.total?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* ✨ Totals Section */}
                    <tfoot className="bg-slate-50/50 border-t border-slate-200">
                      <tr>
                        <td colSpan={3}></td>
                        <td className="px-4 sm:px-5 py-3 text-right text-slate-500 font-medium">Subtotal</td>
                        <td className="px-4 sm:px-5 py-3 text-right text-slate-700 font-medium">
                          {defaultCurrency} {order.items?.reduce((acc:any, i:any) => acc + (i.taxableValue || 0), 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3}></td>
                        <td className="px-4 sm:px-5 py-3 text-right text-slate-500 font-medium">Tax</td>
                        <td className="px-4 sm:px-5 py-3 text-right text-slate-700 font-medium">
                          {defaultCurrency} {order.items?.reduce((acc:any, i:any) => acc + (i.taxAmount || 0), 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="bg-slate-100/50 border-t border-slate-200">
                        <td colSpan={3}></td>
                        <td className="px-4 sm:px-5 py-4 text-right text-slate-800 font-bold">Grand Total</td>
                        <td className="px-4 sm:px-5 py-4 text-right">
                          {/* ✨ Gradient Text for Total */}
                          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {defaultCurrency} {order.grandTotal?.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Technical / Sync Info */}
            <Section title="System Information" icon={Truck}>
              <Field label="Invoice No" value={order.InvoiceNumber} />
              <Field label="Bill Generated" value={order.BillGenerated ? "Yes" : "No"} />
              <Field label="Tally ID" value={order.TallyTransactionID} />
              <Field 
                label="Last Sync" 
                value={order.syncDate ? new Date(order.syncDate).toLocaleString() : null} 
              />
            </Section>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;