// Updated StockGroupRegistration with pagination and filters
import { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Layers,  Building2, FileText, Star, Edit, Trash2, MoreHorizontal, Eye, Table, Grid3X3, Search, ChevronLeft, ChevronRight } from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";
import {useStockGroup} from "../../../store/stockGroupStore"
import {useCompanyStore} from "../../../store/companyStore"
import { formatSimpleDate } from "../../lib/formatDates";
import { Input } from "../ui/input";
import FilterBar from "../customComponents/FilterBar";


// StockGroup interface (adjusted to match store)
interface StockGroup {
  _id: string;
  clientId?: string;
  companyId?: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  stockGroupId?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

const StockGroupRegistration: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [editingStockGroup, setEditingStockGroup] = useState<StockGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc'>('nameAsc');
  const [filteredStockGroups, setFilteredStockGroups] = useState<StockGroup[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // Fixed limit per page
  
  const { fetchStockGroup, addStockGroup, updateStockGroup, deleteStockGroup, stockGroups, pagination, loading, error,filterStockGroups } = useStockGroup();
  const {companies} =useCompanyStore()

  // Initial fetch
  useEffect(() => {
    fetchStockGroup(currentPage, limit);
  }, [fetchStockGroup, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      filterStockGroups(searchTerm, statusFilter, sortBy, currentPage, limit)
        .then((result) => {
          setFilteredStockGroups(result);
        })
        .catch((err) => {
          console.error("Error filtering stock groups:", err);
        });
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, statusFilter, sortBy, currentPage, filterStockGroups]);

  const [formData, setFormData] = useState<StockGroup>({
    _id: '',
    name: '',
    description: '',
    status: 'active',
    stockGroupId: '',
    companyId: '',
    createdAt: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: keyof StockGroup, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      _id: '',
      name: '',
      description: '',
      status: 'active',
      stockGroupId: stockGroups.length > 0 ? stockGroups[0]._id : '',
      companyId: companies.length > 0 ? companies[0]._id : '',
      createdAt: '',
    });
    setEditingStockGroup(null);
  };

  const handleEditStockGroup = (stockGroup: StockGroup): void => {
    setEditingStockGroup(stockGroup);
    setFormData({
      ...stockGroup
    });
    setOpen(true);
  };

  const handleDeleteStockGroup = (stockGroupId: string): void => {
    deleteStockGroup(stockGroupId);
  };

  const handleSubmit = (): void => {
    if ( !formData.name.trim()) {
      alert("Please fill in Stock Group Name");
      return;
    }

    if (editingStockGroup) {
      let updateStocks={
      name: formData.name,
      description: formData.description,
      status: formData.status,
      stockGroupId:formData.stockGroupId,
      companyId:formData.companyId,
    }
    console.log("updatinggg")
      updateStockGroup( editingStockGroup?._id, updateStocks );
    } else {
      console.log("updatingggadddd")
      
      addStockGroup(formData);
    }
    
    resetForm();
    setOpen(false);
  };

  // Statistics calculations
  const stats = useMemo(() => ({
    totalGroups: pagination?.total,
    primaryGroups: filteredStockGroups?.filter(g => g.stockGroupId === '').length, // Assuming empty stockGroupId means primary
    activeGroups: statusFilter === 'active' ? pagination.total : filteredStockGroups?.filter(g => g.status === 'active').length,
    inactiveGroups: statusFilter === 'inactive' ? pagination.total : filteredStockGroups?.filter(g => g.status === 'inactive').length
  }), [filteredStockGroups, pagination, statusFilter]);

  // Actions dropdown component
  const ActionsDropdown = ({ stockGroup }: { stockGroup: StockGroup }) => {
    const [showActions, setShowActions] = useState(false);
    
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowActions(!showActions)}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        
        {showActions && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowActions(false)}
            />
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleEditStockGroup(stockGroup);
                  setShowActions(false);
                }}
                className="w-full justify-start text-left hover:bg-gray-50 rounded-none"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleDeleteStockGroup(stockGroup?._id);
                  setShowActions(false);
                }}
                className="w-full justify-start text-left rounded-none text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Table View Component
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-teal-50 to-teal-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Group
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStockGroups.map((stockGroup) => (
              <tr key={stockGroup._id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{stockGroup.name}</div>
                    {/* <div className="text-sm text-teal-600 font-mono">{stockGroup.code}</div> */} {/* Removed code as per interface */}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {stockGroup.description || 'No description'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {stockGroup.stockGroupId === '' ? ( // Assuming empty means primary
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        Primary
                      </Badge>
                    ) : (
                      <span className="text-gray-600">{stockGroup.stockGroupId}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatSimpleDate(stockGroup.createdAt || '')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`${
                    stockGroup.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  } hover:bg-green-100`}>
                    {stockGroup.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActionsDropdown stockGroup={stockGroup} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Card View Component
  const CardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredStockGroups.map((group: StockGroup) => (
        <Card key={group._id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                  {group.name}
                </CardTitle>
                {/* <p className="text-teal-600 font-medium font-mono">{group.code}</p> */} {/* Removed code */}
                {group.stockGroupId === '' && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mt-2">
                    Primary
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${group.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-green-100`}>
                  {group.status}
                </Badge>
                <ActionsDropdown stockGroup={group} />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {group.description && (
                <div className="flex items-start text-sm">
                  <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">{group.description}</span>
                </div>
              )}

              {group.stockGroupId !== '' && (
                <div className="flex items-center text-sm">
                  <Layers className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Parent: {group.stockGroupId}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm">
                <Building2 className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Created: {formatSimpleDate(group.createdAt || '')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Pagination controls
  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm">
      <div className="text-sm text-gray-600">
        Showing {(currentPage - 1) * pagination?.limit + 1} - {Math.min(currentPage * pagination?.limit, pagination?.total)} of {pagination?.total} stock groups
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {pagination?.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(pagination?.totalPages, prev + 1))}
          disabled={currentPage === pagination?.totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

 <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onClearFilters={() => {
          setSearchTerm('');
          setStatusFilter('all');
          setSortBy('nameAsc');
          setCurrentPage(1);
        }}
      />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Stock Group Management</h1>
          <p className="text-gray-600">Manage your stock group information and categories</p>
        </div>
       
        <Button 
          onClick={() => {
            resetForm();
            setOpen(true);
          }} 
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Layers className="w-4 h-4 mr-2" />
          Add Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Groups</p>
                <p className="text-3xl font-bold">{stats.totalGroups}</p>
              </div>
              <Layers className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Primary Groups</p>
                <p className="text-3xl font-bold">{stats.primaryGroups}</p>
              </div>
              <Star className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Groups</p>
                <p className="text-3xl font-bold">{stats.activeGroups}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Inactive Groups</p>
                <p className="text-3xl font-bold">{stats.inactiveGroups}</p>
              </div>
              <Building2 className="w-8 h-8 text-teal-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onClearFilters={() => {
          setSearchTerm('');
          setStatusFilter('all');
          setSortBy('nameAsc');
          setCurrentPage(1);
        }}
      />

      {pagination?.total ? (
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">View Mode:</span>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'table'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table className="w-4 h-4 mr-2" />
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'cards'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Card View
            </button>
          </div>
        </div>
      ) : null}

      {pagination?.total === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Layers className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No stock groups registered yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first stock group to get started</p>
            <Button 
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              Add Your First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'table' ? <TableView /> : <CardView />}
          <PaginationControls />
        </>
      )}

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {editingStockGroup ? 'Edit Stock Group' : 'Add New Stock Group'}
            </DialogTitle>
            <p className="text-gray-600 text-sm">
              {editingStockGroup ? 'Update the stock group details' : 'Fill in the stock group details and information'}
            </p>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                <Layers className="w-5 h-5 mr-2" />
                Group Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                
                <CustomInputBox
                  placeholder="Group Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  label="Group Name"
                  
                />
                 <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Company</label>
                    <select
                      value={formData.companyId}
                      onChange={(e) => handleSelectChange("companyId", e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >{
                      companies.map((companie)=>(
                       
                      
                        <option key={companie?.["_id"]} value={companie?.["_id"]}>{companie?.namePrint} </option>
                    
                      ))
                    }
                    
                    </select>
                  </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <textarea
                  placeholder="Enter group description..."
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Parent Group</label>
                <select
                  value={formData.stockGroupId || ''}
                  onChange={(e) => handleSelectChange("stockGroupId", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="">Primary (No Parent)</option>
                  {stockGroups?.filter(group => group?._id !== editingStockGroup?._id) // Prevent self-referencing
                    .map(group => (
                    <option key={group?._id} value={group?._id}>{group?.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleSelectChange("status", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white px-8 py-2 shadow-lg"
                >
                  {editingStockGroup ? 'Update Group' : 'Save Group'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockGroupRegistration;