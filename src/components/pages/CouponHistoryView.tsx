// components/CouponHistoryView.jsx
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  Clock, 
  User, 
  Edit, 
  PlusCircle, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Eye,
  Download,
  Filter,
  Calendar
} from "lucide-react";
import { formatFieldName } from '../../utils/couponHistory';

const CouponHistoryView = ({ 
  isOpen, 
  onClose, 
  history = [], 
  couponDetails = {},
  currentUser 
}) => {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    const icons = {
      'created': <PlusCircle className="w-5 h-5 text-green-600" />,
      'updated': <Edit className="w-5 h-5 text-blue-600" />,
      'deleted': <Trash2 className="w-5 h-5 text-red-600" />,
      'deactivated': <XCircle className="w-5 h-5 text-orange-600" />,
      'activated': <CheckCircle className="w-5 h-5 text-green-600" />,
      'viewed': <Eye className="w-5 h-5 text-gray-600" />,
      'status_changed': <RefreshCw className="w-5 h-5 text-purple-600" />
    };
    return icons[action] || <Edit className="w-5 h-5" />;
  };

  const getActionColor = (action) => {
    const colors = {
      'created': 'bg-green-50 border-green-200',
      'updated': 'bg-blue-50 border-blue-200',
      'deleted': 'bg-red-50 border-red-200',
      'deactivated': 'bg-orange-50 border-orange-200',
      'activated': 'bg-green-50 border-green-200',
      'status_changed': 'bg-purple-50 border-purple-200'
    };
    return colors[action] || 'bg-gray-50 border-gray-200';
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return 'Empty';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      return value.join(', ');
    }
    return String(value);
  };

  const filteredHistory = history.filter(record => {
    // Filter by type
    if (filterType !== 'all' && record.action !== filterType) return false;
    
    // Search in changes
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const hasInChanges = record.changes?.some(change => 
        change.field.toLowerCase().includes(term) ||
        formatFieldName(change.field).toLowerCase().includes(term) ||
        formatValue(change.oldValue).toLowerCase().includes(term) ||
        formatValue(change.newValue).toLowerCase().includes(term)
      );
      
      const hasInUser = record.changedBy?.name?.toLowerCase().includes(term) ||
                       record.changedBy?.email?.toLowerCase().includes(term);
      
      if (!hasInChanges && !hasInUser) return false;
    }
    
    return true;
  });

  const exportHistory = () => {
    const exportData = {
      coupon: couponDetails,
      history: filteredHistory,
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.name || 'Unknown'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `coupon-history-${couponDetails.code || couponDetails.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deactivated', label: 'Deactivated' },
    { value: 'activated', label: 'Activated' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Coupon History - {couponDetails.name || couponDetails.code}
          </DialogTitle>
          <DialogDescription>
            Track all changes made to this coupon. Total {history.length} records.
          </DialogDescription>
        </DialogHeader>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card className="bg-blue-50">
            <CardContent className="p-3">
              <div className="text-sm text-blue-600">Total Changes</div>
              <div className="text-2xl font-bold">{history.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="p-3">
              <div className="text-sm text-green-600">Last Modified</div>
              <div className="text-sm font-medium">
                {history.length > 0 ? formatDateTime(history[0].timestamp) : 'Never'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50">
            <CardContent className="p-3">
              <div className="text-sm text-purple-600">Created By</div>
              <div className="text-sm font-medium">
                {couponDetails.createdBy?.name || 'Unknown'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50">
            <CardContent className="p-3">
              <div className="text-sm text-orange-600">Current Status</div>
              <Badge className={
                couponDetails.status === 'active' ? 'bg-green-100 text-green-800' :
                couponDetails.status === 'inactive' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }>
                {couponDetails.status || 'Unknown'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Search Changes</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by field, value, or user..."
                    className="w-full p-2 border rounded-lg pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <label className="text-sm font-medium mb-1 block">Filter by Action</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  {actionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={exportHistory}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-2">
          {filteredHistory.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No History Found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterType !== 'all' 
                    ? 'No matching records found. Try different filters.'
                    : 'No history available for this coupon.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredHistory.map((record, index) => (
              <Card key={record.id || index} className={getActionColor(record.action)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getActionIcon(record.action)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">
                            {record.action.replace('_', ' ')}
                          </span>
                          {record.version && (
                            <Badge variant="secondary" className="text-xs">
                              v{record.version}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <User className="w-3 h-3" />
                          <span>{record.changedBy?.name}</span>
                          <span className="text-gray-400">•</span>
                          <span>{record.changedBy?.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateTime(record.timestamp)}
                    </div>
                  </div>
                  
                  {record.changes && record.changes.length > 0 && (
                    <div className="mt-4 border-t pt-3">
                      <h4 className="text-sm font-medium mb-2">Changes Made:</h4>
                      <div className="space-y-2">
                        {record.changes.map((change, idx) => (
                          <div key={idx} className="text-sm bg-white p-3 rounded-lg border">
                            <div className="grid grid-cols-12 gap-2">
                              <div className="col-span-3 font-medium text-gray-700">
                                {formatFieldName(change.field)}:
                              </div>
                              <div className="col-span-4 text-red-500 line-through">
                                <span className="font-medium">From:</span> {formatValue(change.oldValue)}
                              </div>
                              <div className="col-span-1 text-center text-gray-400">→</div>
                              <div className="col-span-4 text-green-500">
                                <span className="font-medium">To:</span> {formatValue(change.newValue)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {record.note && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-100 rounded">
                      <p className="text-sm">
                        <span className="font-medium">Note:</span> {record.note}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CouponHistoryView;