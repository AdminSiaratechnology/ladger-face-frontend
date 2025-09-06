import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Package, Plus, Building2, FileText, Star } from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";


// StockCategory interface
interface StockCategory {
  id: number;
  code: string;
  name: string;
  parent: string;
  status: string;
  createdAt: string;
}



const StockCategoryRegistration: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [stockCategories, setStockCategories] = useState<StockCategory[]>([]);
  
  const [formData, setFormData] = useState<StockCategory>({
    id: 0,
    code: '',
    name: '',
    parent: 'primary',
    status: 'active',
    createdAt: '',
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
      code: '',
      name: '',
      parent: stockCategories.length > 0 ? stockCategories[0].code : 'primary',
      status: 'active',
      createdAt: '',
    });
  };

  const handleSubmit = (): void => {
    if (!formData.code.trim() || !formData.name.trim()) {
      alert("Please fill in Stock Category Code and Name");
      return;
    }

    const newStockCategory: StockCategory = { 
      ...formData, 
      id: Date.now(),
      createdAt: new Date().toLocaleDateString()
    };
    
    setStockCategories([...stockCategories, newStockCategory]);
    resetForm();
    setOpen(false);
  };

  // Statistics calculations
  const stats = useMemo(() => ({
    totalCategories: stockCategories.length,
    primaryCategories: stockCategories.filter(c => c.parent === 'primary').length,
    activeCategories: stockCategories.filter(c => c.status === 'active').length,
    inactiveCategories: stockCategories.filter(c => c.status === 'inactive').length
  }), [stockCategories]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Stock Category Management</h1>
          <p className="text-gray-600">Manage your stock category information and registrations</p>
        </div>
       
        <Button 
          onClick={() => setOpen(true)} 
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

      {/* Stock Category List */}
      {stockCategories.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No stock categories registered yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first stock category to get started</p>
            <Button 
              onClick={() => setOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              Add Your First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {stockCategories.map((category: StockCategory) => (
            <Card key={category.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                      {category.name}
                    </CardTitle>
                    <p className="text-teal-600 font-medium">{category.code}</p>
                    {category.parent === 'primary' && (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mt-2">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <Badge className={`${category.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-green-100`}>
                    {category.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  {category.parent !== 'primary' && (
                    <div className="flex items-center text-sm">
                      <Package className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Parent: {category.parent}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">Created: {category.createdAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Add New Stock Category
            </DialogTitle>
            <p className="text-gray-600 text-sm">
              Fill in the stock category details and registration information
            </p>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Category Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <CustomInputBox
                  placeholder="Category Code *"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                />
                <CustomInputBox
                  placeholder="Category Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
                  {stockCategories.map(category => (
                    <option key={category.id} value={category.code}>{category.name} ({category.code})</option>
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
                  Save Category
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