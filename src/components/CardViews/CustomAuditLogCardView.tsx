import React, { useMemo } from "react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Shield,
  UserCheck,
  UserX,
  Edit,
  FileText,
  Calendar,
  Package,
  Building2,
  Users,
  Layers,
  ArrowRight,
  Globe,
  RotateCw,
  Eye,
  ShoppingBag,
  Truck,
  CreditCard,
  User
} from "lucide-react";

// --- Types ---
export interface AuditEvent {
  _id: string;
  module: string;
  action: string;
  performedBy?: {
    _id: string;
    name?: string;
    email?: string;
    role?: string;
  };
  details?: string;
  ipAddress?: string;
  timestamp: string;
  changes?: any;
  referenceId?: any;
}

interface AuditLogCardViewProps {
  auditEvents: AuditEvent[];
  onAction: (event: AuditEvent) => void;
  actionType?: "view" | "restore";
}

// --- Constants & Formatters (Defined once) ---

const DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

// Style Lookup Map (Avoids recalculating strings on every render)
const VARIANT_STYLES = {
  delete: {
    border: "hover:border-red-300",
    iconBg: "bg-red-100 text-red-600",
    badge: "bg-red-50 text-red-700",
  },
  create: {
    border: "hover:border-green-300",
    iconBg: "bg-green-100 text-green-600",
    badge: "bg-green-50 text-green-700",
  },
  update: {
    border: "hover:border-blue-300",
    iconBg: "bg-blue-100 text-blue-600",
    badge: "bg-blue-50 text-blue-700",
  },
  default: {
    border: "hover:border-gray-300",
    iconBg: "bg-gray-100 text-gray-600",
    badge: "bg-gray-50 text-gray-700",
  },
};

// --- Helper Functions ---

const getModuleIcon = (moduleName: string) => {
  switch (moduleName?.toLowerCase()) {
    case "product": return <Package className="w-4 h-4" />;
    case "company": return <Building2 className="w-4 h-4" />;
    case "user": return <User className="w-4 h-4" />;
    case "ledger": return <FileText className="w-4 h-4" />;
    case "stockgroup": return <Layers className="w-4 h-4" />;
    case "stockcategory": return <ShoppingBag className="w-4 h-4" />;
    case "unit": return <Layers className="w-4 h-4" />;
    case "agent": return <Users className="w-4 h-4" />;
    case "vendor": return <Truck className="w-4 h-4" />;
    default: return <Layers className="w-4 h-4" />;
  }
};

const getActionIcon = (action: string) => {
  switch (action?.toLowerCase()) {
    case "create": return UserCheck;
    case "delete": return UserX;
    case "update": return Edit;
    default: return Edit;
  }
};

const formatValue = (val: any): string => {
  if (val === null || val === undefined || val === "") return "Empty";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "object") return "{...}";
  return String(val);
};

// --- Sub-Components ---

const ChangePreview = React.memo(({ changes }: { changes: any }) => {
  if (!changes || Object.keys(changes).length === 0) return null;
  
  // Memoize keys calculation
  const { keys, remaining } = useMemo(() => {
    const allKeys = Object.keys(changes);
    return { keys: allKeys.slice(0, 2), remaining: allKeys.length - 2 };
  }, [changes]);

  return (
    <div className="mt-3 bg-gray-50 rounded-md border border-gray-100 p-2 text-xs">
      <p className="font-semibold text-gray-500 mb-1.5 flex items-center text-[10px] uppercase tracking-wider">
        <Edit className="w-3 h-3 mr-1" /> Modified Fields
      </p>
      <div className="space-y-1.5">
        {keys.map((key) => {
          const change = changes[key];
          const isNested = change && typeof change === "object" && "to" in change;
          
          return (
            <div key={key} className="grid grid-cols-[auto_1fr] gap-2 items-start">
              <span className="text-gray-700 font-medium truncate max-w-[80px]" title={key}>{key}:</span>
              <div className="text-gray-600 font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-100 truncate">
                {isNested ? (
                   <span className="flex items-center gap-1">
                     <span className="text-red-400 line-through decoration-red-200 opacity-70">
                       {formatValue(change.from)}
                     </span> 
                     <span className="text-gray-400">→</span>
                     <span className="text-teal-600 font-semibold">
                       {formatValue(change.to)}
                     </span>
                   </span>
                ) : <span className="text-teal-600">{formatValue(change)}</span>}
              </div>
            </div>
          );
        })}
        {remaining > 0 && <p className="text-[10px] text-gray-400 pl-1 italic mt-1">+ {remaining} more...</p>}
      </div>
    </div>
  );
});

ChangePreview.displayName = "ChangePreview";

// --- Individual Card Component (Memoized) ---
const AuditLogCard = React.memo(({ event, onAction, actionType }: { event: AuditEvent, onAction: (e: AuditEvent) => void, actionType: "view" | "restore" }) => {
  const ActionIcon = getActionIcon(event.action);
  const styles = VARIANT_STYLES[event.action?.toLowerCase() as keyof typeof VARIANT_STYLES] || VARIANT_STYLES.default;
  const isUpdate = event.action?.toLowerCase() === "update";
  const dateObj = new Date(event.timestamp);

  // Button Styles
  const buttonClass = actionType === "restore"
    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
    : "hover:bg-teal-50 hover:text-teal-700";

  return (
    <Card className={`group bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden flex flex-col h-full ${styles.border} hover:-translate-y-1`}>
      {/* Header */}
      <CardHeader className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${styles.iconBg}`}>
              {getModuleIcon(event.module)}
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-800">{event.module}</CardTitle>
              <p className="text-[10px] text-gray-500 font-mono">
                {TIME_FORMATTER.format(dateObj)}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`capitalize text-[10px] px-2 py-0.5 border-0 font-semibold ${styles.badge}`}>
            <ActionIcon className="w-3 h-3 mr-1" />
            {event.action}
          </Badge>
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="px-4 py-3 flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200">
            {event.performedBy?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {event.performedBy?.name || "Unknown User"}
            </p>
            <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {event.performedBy?.role || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start gap-2">
            <FileText className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed" title={event.details}>
              {event.details}
            </p>
          </div>
          {isUpdate && actionType === 'view' && <ChangePreview changes={event.changes} />}
        </div>
      </CardContent>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50/30 border-t border-gray-100 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center text-[10px] text-gray-500">
              <Calendar className="w-3 h-3 mr-1.5" />
              {DATE_FORMATTER.format(dateObj)}
            </div>
            <div className="flex items-center text-[10px] text-gray-400">
              <Globe className="w-3 h-3 mr-1.5" />
              {event.ipAddress || "N/A"}
            </div>
          </div>

          <Button
            variant={actionType === "restore" ? "default" : "ghost"}
            size="sm"
            onClick={() => onAction(event)}
            className={`h-7 px-3 text-xs shadow-sm ${buttonClass}`}
          >
            {actionType === "restore" ? (
              <>Restore <RotateCw className="w-3 h-3 ml-1.5" /></>
            ) : (
              <>View <ArrowRight className="w-3 h-3 ml-1.5" /></>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
});

AuditLogCard.displayName = "AuditLogCard";

// --- Main Grid Layout ---
const AuditLogCardView = React.memo(({ auditEvents, onAction, actionType = "view" }: AuditLogCardViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
      {auditEvents.map((event) => (
        <AuditLogCard 
          key={event._id} 
          event={event} 
          onAction={onAction} 
          actionType={actionType} 
        />
      ))}
    </div>
  );
});

AuditLogCardView.displayName = "AuditLogCardView";
export default AuditLogCardView;