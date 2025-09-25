import { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Package, Plus, Building2, FileText, Star, Edit, Trash2, MoreHorizontal, Eye, Table, Grid3X3, Layers, Search, ChevronLeft, ChevronRight } from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";
import {useStockCategory} from "../../../store/stockCategoryStore"
import {useCompanyStore} from "../../../store/companyStore"
import {useStockGroup} from "../../../store/stockGroupStore"
import { formatSimpleDate } from "../../lib/formatDates";
import { Input } from "../ui/input";
import FilterBar from "../customComponents/FilterBar";


// StockCategory interface
interface StockCategory {
  id: number;
  _id?: string;
  name: string;
  description: string;
  parent: string;
  status: string;
  createdAt: string;
  companyId: string;
  stockGroupId: string;
}

const StockCategoryRegistration: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [editingStockCategory, setEditingStockCategory] = useState<StockCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc'>('nameAsc');
  const [filteredStockCategories, setFilteredStockCategories] = useState<StockCategory[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // Fixed limit per page
  
  const { fetchStockCategory, addStockCategory, updateStockCategory, deleteStockCategory, stockCategories, pagination, loading, error, filterStockCategories } = useStockCategory();
  const { companies } = useCompanyStore();
  const { stockGroups } = useStockGroup();

  // Initial fetch
  useEffect(() => {
    fetchStockCategory(currentPage, limit);
  }, [fetchStockCategory, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      filterStockCategories(searchTerm, statusFilter, sortBy, currentPage, limit)
        .then((result) => {
          console.log(result,"resutttttt")
          setFilteredStockCategories(result);
        })
        .catch((err) => {
          console.error("Error filtering stock categories:", err);
        });
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, statusFilter, sortBy, currentPage, filterStockCategories]);

  const [formData, setFormData] = useState<StockCategory>({
    id: 0,
    name: '',
    description: '',
    parent: 'primary',
    status: 'active',
    createdAt: '',
    companyId: companies.length > 0 ? companies[0]._id : '',
    stockGroupId: stockGroups.length > 0 ? stockGroups[0]._id : ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: keyof StockCategory, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      name: '',
      description: '',
      parent: 'primary',
      status: 'active',
      createdAt: '',
      companyId: companies.length > 0 ? companies[0]._id : '',
      stockGroupId: stockGroups.length > 0 ? stockGroups[0]._id : ''
    });
    setEditingStockCategory(null);
  };

  const handleEditStockCategory = (stockCategory: StockCategory): void => {
    setEditingStockCategory(stockCategory);
    setFormData({
      ...stockCategory,
      id: stockCategory.id || 0 // Ensure id is set
    });
    setOpen(true);
  };

  const handleDeleteStockCategory = (stockCategoryId: string): void => {
    deleteStockCategory(stockCategoryId);
  };

  const handleSubmit = (): void => {
    if (!formData.name.trim()) {
      alert("Please fill in Stock Category Name");
      return;
    }

    if (editingStockCategory) {
      let updateCategory = {
        name: formData.name,
        description: formData.description,
        parent: formData.parent,
        status: formData.status,
        companyId: formData.companyId,
        stockGroupId: formData.stockGroupId
      };
      updateStockCategory({stockCategoryId: editingStockCategory._id || '', data: updateCategory});
    } else {
      addStockCategory(formData);
    }
    
    resetForm();
    setOpen(false);
  };

  // Statistics calculations
  const stats = useMemo(() => ({
    totalCategories: pagination?.total,
    primaryCategories: filteredStockCategories?.filter(c => c?.parent === 'primary').length,
    activeCategories: statusFilter === 'active' ? pagination?.total : filteredStockCategories?.filter(c => c.status === 'active').length,
    inactiveCategories: statusFilter === 'inactive' ? pagination?.total : filteredStockCategories?.filter(c => c.status === 'inactive').length
  }), [filteredStockCategories, pagination, statusFilter]);
  console.log(stockCategories,"stockcatotgory")

  // Get company name by ID
  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c._id === companyId);
    return company ? company.namePrint : 'Unknown Company';
  };

  // Get stock group name by ID
  const getStockGroupName = (stockGroupId: string) => {
    const stockGroup = stockGroups.find(g => g._id === stockGroupId);
    return stockGroup ? stockGroup.name : 'Unknown Group';
  };

  // Get category name by ID for parent display
  const getCategoryName = (categoryId: string) => {
    const category = stockCategories?.find(c => c._id === categoryId);
    return category ? category.name : categoryId;
  };

  // Actions dropdown component
  const ActionsDropdown = ({ stockCategory }: { stockCategory: StockCategory }) => {
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
                  handleEditStockCategory(stockCategory);
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
                  handleDeleteStockCategory(stockCategory._id || stockCategory.id.toString());
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
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Group
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent
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
            {filteredStockCategories?.map((stockCategory) => (
              <tr key={stockCategory?.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{stockCategory.name}</div>
                    <div className="text-sm text-gray-500">{formatSimpleDate(stockCategory.createdAt)}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {stockCategory.description || 'No description'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getCompanyName(stockCategory.companyId)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getStockGroupName(stockCategory.stockGroupId)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {stockCategory.parent === 'primary' ? (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        Primary
                      </Badge>
                    ) : (
                      <span className="text-gray-600">{getCategoryName(stockCategory.parent)}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`${
                    stockCategory.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  } hover:bg-green-100`}>
                    {stockCategory.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActionsDropdown stockCategory={stockCategory} />
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
      {filteredStockCategories?.map((category: StockCategory) => (
        <Card key={category.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                  {category.name}
                </CardTitle>
                {category.parent === 'primary' && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mt-2">
                    Primary
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${category.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-green-100`}>
                  {category.status}
                </Badge>
                <ActionsDropdown stockCategory={category} />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {category.description && (
                <div className="flex items-start text-sm">
                  <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">{category.description}</span>
                </div>
              )}

              <div className="flex items-center text-sm">
                <Building2 className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Company: {getCompanyName(category.companyId)}</span>
              </div>

              <div className="flex items-center text-sm">
                <Layers className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Group: {getStockGroupName(category.stockGroupId)}</span>
              </div>

              {category.parent !== 'primary' && (
                <div className="flex items-center text-sm">
                  <Package className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Parent: {getCategoryName(category.parent)}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Created: {formatSimpleDate(category.createdAt)}</span>
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
        Showing {(currentPage - 1) * pagination.limit + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} stock categories
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
          Page {currentPage} of {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
          disabled={currentPage === pagination.totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Stock Category Management</h1>
          <p className="text-gray-600">Manage your stock category information and classifications</p>
        </div>
       
        <Button 
          onClick={() => {
            resetForm();
            setOpen(true);
          }} 
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Package className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Categories</p>
                <p className="text-3xl font-bold">{stats.totalCategories}</p>
              </div>
              <Package className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Primary Categories</p>
                <p className="text-3xl font-bold">{stats.primaryCategories}</p>
              </div>
              <Star className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Categories</p>
                <p className="text-3xl font-bold">{stats.activeCategories}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Inactive Categories</p>
                <p className="text-3xl font-bold">{stats.inactiveCategories}</p>
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

      {pagination.total ? (
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

      {pagination.total === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No stock categories registered yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first stock category to get started</p>
            <Button 
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              Add Your First Category
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
              {editingStockCategory ? 'Edit Stock Category' : 'Add New Stock Category'}
            </DialogTitle>
            <p className="text-gray-600 text-sm">
              {editingStockCategory ? 'Update the stock category details' : 'Fill in the stock category details and information'}
            </p>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Category Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                <CustomInputBox
                  placeholder="Category Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  label="Category Name"
                />

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Company</label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => handleSelectChange("companyId", e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                  >
                    {companies.map((companie)=>(
                      <option key={companie?._id} value={companie?._id}>{companie?.namePrint} </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Stock Group</label>
                  <select
                    value={formData.stockGroupId}
                    onChange={(e) => handleSelectChange("stockGroupId", e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                  >
                    {stockGroups.map((group)=>(
                      <option key={group?._id} value={group?._id}>{group?.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <textarea
                  placeholder="Enter category description..."
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Parent Category</label>
                <select
                  value={formData.parent}
                  onChange={(e) => handleSelectChange("parent", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="primary">Primary (No Parent)</option>
                  {stockCategories?.filter(category => category?._id !== editingStockCategory?._id)?.map(category => (
                    <option key={category?._id} value={category?._id}>{category?.name}</option>
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
                  {editingStockCategory ? 'Update Category' : 'Save Category'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockCategoryRegistration;