import React from "react";
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
  CornerDownRight,
} from "lucide-react";

// --- Types ---
interface AuditEvent {
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
}

interface AuditLogCardViewProps {
  auditEvents: AuditEvent[];
  onViewDetails: (id: string) => void;
}

// --- Helper Functions ---

const getModuleIcon = (moduleName: string) => {
  switch (moduleName?.toLowerCase()) {
    case "product":
      return <Package className="w-4 h-4" />;
    case "company":
      return <Building2 className="w-4 h-4" />;
    case "user":
      return <Users className="w-4 h-4" />;
    case "ledger":
      return <FileText className="w-4 h-4" />;
    default:
      return <Layers className="w-4 h-4" />;
  }
};

const getActionIcon = (action: string) => {
  const lowerAction = action?.toLowerCase();
  if (lowerAction === "create") return UserCheck;
  if (lowerAction === "delete") return UserX;
  if (lowerAction === "update") return Edit;
  return Edit;
};

// --- NEW: Helper to format values for display ---
const formatValue = (val: any): string => {
  if (val === null || val === undefined || val === "") return "Empty";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "object") return "{...}"; // Nested object indicator
  return String(val);
};

// --- NEW: Change Preview Component ---
const ChangePreview = ({ changes }: { changes: any }) => {
  if (!changes || Object.keys(changes).length === 0) return null;

  // Get first 2 keys to show as preview
  const keys = Object.keys(changes).slice(0, 2);
  const remaining = Object.keys(changes).length - 2;

  return (
    <div className="mt-3 bg-gray-50 rounded-md border border-gray-100 p-2 text-xs">
      <p className="font-semibold text-gray-500 mb-1.5 flex items-center text-[10px] uppercase tracking-wider">
        <Edit className="w-3 h-3 mr-1" /> Modified Fields
      </p>
      <div className="space-y-1.5">
        {keys.map((key) => {
          const change = changes[key];
          // Check if it's a direct value or a from/to object
          const isNested = change && typeof change === "object" && "to" in change;
          
          return (
            <div key={key} className="grid grid-cols-[auto_1fr] gap-2 items-start">
              <div className="flex items-center text-gray-700 font-medium min-w-[80px]">
                <CornerDownRight className="w-3 h-3 mr-1 text-gray-400" />
                <span className="truncate max-w-[100px]" title={key}>{key}:</span>
              </div>
              
              <div className="text-gray-600 font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-100 truncate">
                {isNested ? (
                   // Show From -> To if available, otherwise just To
                   <span className="flex items-center gap-1">
                     {change.from !== undefined && change.from !== "" && (
                       <>
                         <span className="text-red-400 line-through decoration-red-200 decoration-1 opacity-70">
                            {formatValue(change.from)}
                         </span> 
                         <span className="text-gray-400">→</span>
                       </>
                     )}
                     <span className="text-teal-600 font-semibold">
                        {formatValue(change.to)}
                     </span>
                   </span>
                ) : (
                  // Fallback for simple key-value updates
                  <span className="text-teal-600">{formatValue(change)}</span>
                )}
              </div>
            </div>
          );
        })}
        
        {remaining > 0 && (
          <p className="text-[10px] text-gray-400 pl-4 italic mt-1">
            + {remaining} more changes...
          </p>
        )}
      </div>
    </div>
  );
};

const AuditLogCardView = React.memo(
  ({ auditEvents, onViewDetails }: AuditLogCardViewProps) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
        {auditEvents.map((event) => {
          const ActionIcon = getActionIcon(event.action);
          const isUpdate = event.action?.toLowerCase() === "update";

          const borderColor =
            event.action?.toLowerCase() === "delete"
              ? "hover:border-red-300"
              : event.action?.toLowerCase() === "create"
              ? "hover:border-green-300"
              : "hover:border-blue-300";

          const iconBg =
            event.action === "delete"
              ? "bg-red-100 text-red-600"
              : event.action === "create"
              ? "bg-green-100 text-green-600"
              : "bg-blue-100 text-blue-600";

          const badgeClass =
            event.action === "delete"
              ? "bg-red-50 text-red-700"
              : event.action === "create"
              ? "bg-green-50 text-green-700"
              : "bg-blue-50 text-blue-700";

          return (
            <Card
              key={event._id}
              className={`group bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden flex flex-col h-full ${borderColor} hover:-translate-y-1`}
            >
              <CardHeader className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${iconBg}`}>
                      {getModuleIcon(event.module)}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-gray-800">
                        {event.module}
                      </CardTitle>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {new Date(event.timestamp).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`capitalize text-[10px] px-2 py-0.5 border-0 font-semibold ${badgeClass}`}
                  >
                    <ActionIcon className="w-3 h-3 mr-1" />
                    {event.action}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="px-4 py-3 flex-1 flex flex-col gap-3">
                {/* Actor Info */}
                <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200">
                    {event.performedBy?.name?.charAt(0) || "?"}
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
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {event.details}
                    </p>
                  </div>

                  {/* SHOW CHANGE PREVIEW HERE */}
                  {isUpdate && <ChangePreview changes={event.changes} />}
                </div>
              </CardContent>

              <div className="px-4 py-2 bg-gray-50/30 border-t border-gray-100 mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center text-[10px] text-gray-500">
                      <Calendar className="w-3 h-3 mr-1.5" />
                      {new Date(event.timestamp).toLocaleDateString("en-IN")}
                    </div>
                    <div className="flex items-center text-[10px] text-gray-400">
                      <Globe className="w-3 h-3 mr-1.5" />
                      {event.ipAddress || "IP Unknown"}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(event._id)}
                    className="h-7 px-2 text-xs hover:bg-teal-50 hover:text-teal-700"
                  >
                    View
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }
);

AuditLogCardView.displayName = "AuditLogCardView";

export default AuditLogCardView;