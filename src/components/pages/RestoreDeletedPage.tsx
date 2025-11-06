
import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Shield,
  UserCheck,
  UserX,
  Edit,
  DollarSign,
  Download,
  Filter,
  Search,
  Calendar,
  Users,
  AlertCircle,
  FileText,
  RotateCw,
  X,
} from "lucide-react";
import HeaderGradient from "../customComponents/HeaderGradint";
import FilterBar from "../customComponents/FilterBar";
import { TableViewSkeleton } from "../../components/customComponents/TableViewSkeleton";
import api from "../../api/api";
import { toast } from "sonner";
import TableHeader from "../customComponents/CustomTableHeader";
import PaginationControls from "../customComponents/CustomPaginationControls";
import ViewModeToggle from "../customComponents/ViewModeToggle";
import EmptyStateCard from "../customComponents/EmptyStateCard";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderShadcn, TableRow } from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {useAuditLogStore} from "../../../store/auditLogStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";

// Audit Event interface based on actual API response
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
  referenceId?: {
    _id: string;
    name?: string;
    code?: string;
    status?: string;
    auditLogs?: Array<{
      action: string;
      performedBy: string;
      timestamp: string;
    }>;
    [key: string]: any;
  };
  clientId?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
  changes?: any;
}

const RestoreDeletedPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<"all" | "create" | "update" | "delete">("delete"); // Default to delete
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "all">("all");
  const [sortBy, setSortBy] = useState<"timeDesc" | "timeAsc" | "actorAsc" | "actorDesc">("timeDesc");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedEventForRestore, setSelectedEventForRestore] = useState<AuditEvent | null>(null);

  const {
    auditEvents,
    auditEventsDetail,
    singleAuditEvent,
    loading,
    error,
    errorMessage,
    pagination: storePagination,
    fetchAuditEvents,
    fetchAllAuditEvents,
    fetchAuditLogById,
    restoreRecord,
  } = useAuditLogStore();

  const limit = 10;

  const headers = ["Timestamp", "Actor", "Action", "Module", "Details", "IP Address", "Actions"];

  const stats = useMemo(() => ({
    totalEvents: storePagination.total,
    securityAlerts: auditEvents.filter((e) => e.action?.toLowerCase() === "delete").length,
    dataExports: auditEvents.filter((e) => e.action?.toLowerCase().includes("export")).length || 0,
    activeUsers: new Set(auditEvents.map((e) => e.performedBy?.name).filter(Boolean)).size,
  }), [auditEvents, storePagination.total]);

  const getActionIcon = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction === "create") return UserCheck;
    if (lowerAction === "delete") return UserX;
    if (lowerAction === "update") return Edit;
    return Edit;
  };

  const getActionColor = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction === "create") return "text-green-600";
    if (lowerAction === "delete") return "text-red-600";
    if (lowerAction === "update") return "text-blue-600";
    return "text-gray-600";
  };

  const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const getExportParams = () => {
    let fromDate: string | undefined;
    if (timeFilter !== "all") {
      const now = new Date();
      let cutoff: Date;
      switch (timeFilter) {
        case "today":
          cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          cutoff = new Date(now);
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff = new Date(now);
          cutoff.setDate(now.getDate() - 30);
          break;
        default:
          cutoff = new Date(0);
      }
      fromDate = cutoff.toISOString();
    }

    const action = actionFilter !== "all" ? actionFilter : undefined;

    let sortByParam: string;
    let sortOrder: "asc" | "desc" = "desc";
    switch (sortBy) {
      case "timeDesc":
        sortByParam = "timestamp";
        sortOrder = "desc";
        break;
      case "timeAsc":
        sortByParam = "timestamp";
        sortOrder = "asc";
        break;
      case "actorAsc":
        sortByParam = "performedBy.name";
        sortOrder = "asc";
        break;
      case "actorDesc":
        sortByParam = "performedBy.name";
        sortOrder = "desc";
        break;
      default:
        sortByParam = "timestamp";
    }

    return {
      search: searchTerm || undefined,
      action,
      sortBy: sortByParam,
      sortOrder,
      page: 1,
      limit: 10000, // Large limit for export
      fromDate,
    };
  };

  const downloadCSV = (events: AuditEvent[], isDetail: boolean = false) => {
    const csvHeaders = isDetail 
      ? ["Timestamp", "Actor", "Actor Role", "Action", "Module", "Details", "IP Address", "Reference ID", "Reference Name", "Reference Code", "Reference Status","Auditlog"]
      : ["Timestamp", "Actor", "Action", "Module", "Details", "IP Address"];
    
    const csvRows = events.map((event) => {
      const baseRow = [
        new Date(event.timestamp).toLocaleString("en-IN"),
        event.performedBy?.name || 'Unknown',
        capitalizeFirst(event.action),
        event.module,
        event.details || '',
        event.ipAddress || 'N/A'
      ];      

      if (isDetail) {
        baseRow.splice(2, 0, event.performedBy?.role || ''); // Insert role after Actor
        baseRow.push(
          event.referenceId?._id || '',
          event.referenceId?.name || '',
          event.referenceId?.code || '',
          event.referenceId?.status || '',
          JSON.stringify( event.referenceId?.auditLogs )|| ''

        );
      }

      return baseRow;
    });

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `audit-logs-${isDetail ? 'detail-' : ''}${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${isDetail ? 'Detailed ' : ''}CSV exported successfully`);
  };

  const handleExportNormal = async () => {
    downloadCSV(auditEvents, false);
  };

  const handleExportDetail = async () => {
    const params = getExportParams();
    try {
      await fetchAllAuditEvents(params);
      downloadCSV(auditEventsDetail, true);
    } catch (err) {
      toast.error("Failed to fetch detailed data for export");
    }
  };

  const handleRestoreClick = (event: AuditEvent) => {
    setSelectedEventForRestore(event);
    setIsConfirmModalOpen(true);
  };

  const confirmRestore = async () => {
    if (!selectedEventForRestore) return;
    try {
      await restoreRecord({
        module: selectedEventForRestore.module,
        referenceId: selectedEventForRestore.referenceId || '',
        id:selectedEventForRestore._id

      });
    //   toast.success("Record restored successfully");
      setIsConfirmModalOpen(false);
      setSelectedEventForRestore(null);
      // Refresh the list
      fetchAuditEvents({
        action: "delete",
        page: currentPage,
        limit,
      });
    } catch (err) {
      toast.error("Failed to restore record");
    }
  };

  const cancelRestore = () => {
    setIsConfirmModalOpen(false);
    setSelectedEventForRestore(null);
  };

  // Fetch on mount and filter changes
  useEffect(() => {
    let fromDate: string | undefined;
    if (timeFilter !== "all") {
      const now = new Date();
      let cutoff: Date;
      switch (timeFilter) {
        case "today":
          cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          cutoff = new Date(now);
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff = new Date(now);
          cutoff.setDate(now.getDate() - 30);
          break;
        default:
          cutoff = new Date(0);
      }
      fromDate = cutoff.toISOString();
    }

    const action = actionFilter !== "all" ? actionFilter : undefined;

    let sortByParam: string;
    let sortOrder: "asc" | "desc" = "desc";
    switch (sortBy) {
      case "timeDesc":
        sortByParam = "timestamp";
        sortOrder = "desc";
        break;
      case "timeAsc":
        sortByParam = "timestamp";
        sortOrder = "asc";
        break;
      case "actorAsc":
        sortByParam = "performedBy.name";
        sortOrder = "asc";
        break;
      case "actorDesc":
        sortByParam = "performedBy.name";
        sortOrder = "desc";
        break;
      default:
        sortByParam = "timestamp";
    }

    fetchAuditEvents({
      search: searchTerm || undefined,
      action,
      sortBy: sortByParam,
      sortOrder,
      page: currentPage,
      limit,
      fromDate,
    });
  }, [searchTerm, actionFilter, timeFilter, sortBy, currentPage, fetchAuditEvents]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, actionFilter, timeFilter, sortBy]);

  // Table View (primary view for logs)
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader headers={headers} />

          <tbody className="bg-white divide-y divide-gray-200">
            {auditEvents.map((event) => {
              const Icon = getActionIcon(event.action);
              const colorClass = getActionColor(event.action);
              const displayAction = capitalizeFirst(event.action);

              return (
                <tr key={event._id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <p>{new Date(event.timestamp).toLocaleDateString("en-IN")}</p>
                      <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleTimeString("en-IN")}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.performedBy?.name || 'Unknown'}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${colorClass}`} />
                      <span className="text-sm font-medium">{displayAction}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{event.module}</td>
                  <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">{event.details}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {event.ipAddress || 'N/A'}
                    </code>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestoreClick(event)}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (error) {
    return (
      <EmptyStateCard
        icon={AlertCircle}
        title="Error loading deleted records"
        description={errorMessage || 'An error occurred'}
        buttonLabel="Retry"
        onButtonClick={() => fetchAuditEvents({ action: "delete" })}
      />
    );
  }

  return (
    <div className="custom-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <HeaderGradient
          title="Restore Deleted Records"
          subtitle="Recover recently deleted items from audit logs"
        />
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger >
              <Button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer">
                Export Logs <Download className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportNormal}>Normal Export</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportDetail}>Detailed Export</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Total Deleted</p>
                <p className="text-3xl font-bold">{stats.totalEvents}</p>
              </div>
              <Shield className="w-8 h-8 text-teal-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Security Alerts</p>
                <p className="text-3xl font-bold">{stats.securityAlerts}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Data Exports</p>
                <p className="text-3xl font-bold">{stats.dataExports}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold">{stats.activeUsers}</p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h3>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setActionFilter("delete");
                setTimeFilter("all");
                setSortBy("timeDesc");
                setCurrentPage(1);
              }}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by actor, action, module or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter as any}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Created</SelectItem>
                <SelectItem value="update">Updated</SelectItem>
                <SelectItem value="delete">Deleted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter as any}>
              <SelectTrigger>
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading && <TableViewSkeleton />}

      <ViewModeToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalItems={storePagination.total}
      />

      {!loading && auditEvents.length === 0 ? (
        <EmptyStateCard
          icon={Shield}
          title="No deleted records found"
          description="Deleted records will appear here for restoration"
          buttonLabel="Refresh List"
          onButtonClick={() => fetchAuditEvents({ action: "delete" })}
        />
      ) : (
        <>
          {viewMode === "table" ? <TableView /> : null} {/* Cards not implemented for logs */}
          <PaginationControls
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pagination={storePagination}
            itemName="deleted events"
          />
        </>
      )}

      {/* Confirm Restore Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Restore</DialogTitle>
          </DialogHeader>
          {selectedEventForRestore && (
            <div className="space-y-4">
              <p>Are you sure you want to restore the following record?</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Module: {selectedEventForRestore.module}</li>
                <li>Reference ID: {selectedEventForRestore.referenceId?._id}</li>
                <li>Details: {selectedEventForRestore.details}</li>
              </ul>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={cancelRestore}>
                  Cancel
                </Button>
                <Button onClick={confirmRestore}>
                  Restore
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestoreDeletedPage;
