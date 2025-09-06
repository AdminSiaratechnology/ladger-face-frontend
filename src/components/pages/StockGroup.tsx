import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Layers, Plus, Building2, FileText, Star } from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";

// StockGroup interface
interface StockGroup {
  id: number;
  code: string;
  name: string;
  parent: string;
  status: string;
  createdAt: string;
}



const StockGroupRegistration: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [stockGroups, setStockGroups] = useState<StockGroup[]>([]);
  
  const [formData, setFormData] = useState<StockGroup>({
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

  const handleSelectChange = (name: keyof StockGroup, value: string): void => {
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
      parent: stockGroups.length > 0 ? stockGroups[0].code : 'primary',
      status: 'active',
      createdAt: '',
    });
  };

  const handleSubmit = (): void => {
    if (!formData.code.trim() || !formData.name.trim()) {
      alert("Please fill in Stock Group Code and Name");
      return;
    }

    const newStockGroup: StockGroup = { 
      ...formData, 
      id: Date.now(),
      createdAt: new Date().toLocaleDateString()
    };
    
    setStockGroups([...stockGroups, newStockGroup]);
    resetForm();
    setOpen(false);
  };

  // Statistics calculations
  const stats = useMemo(() => ({
    totalGroups: stockGroups.length,
    primaryGroups: stockGroups.filter(g => g.parent === 'primary').length,
    activeGroups: stockGroups.filter(g => g.status === 'active').length,
    inactiveGroups: stockGroups.filter(g => g.status === 'inactive').length
  }), [stockGroups]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Stock Group Management</h1>
          <p className="text-gray-600">Manage your stock group information and registrations</p>
        </div>
       
        <Button 
          onClick={() => setOpen(true)} 
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Layers className="w-4 h-4 mr-2" />
          Add Group
        </Button>
      </div>

      {/* Stats Cards */}
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

      {/* Stock Group List */}
      {stockGroups.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Layers className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No stock groups registered yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first stock group to get started</p>
            <Button 
              onClick={() => setOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              Add Your First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {stockGroups.map((group: StockGroup) => (
            <Card key={group.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                      {group.name}
                    </CardTitle>
                    <p className="text-teal-600 font-medium">{group.code}</p>
                    {group.parent === 'primary' && (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mt-2">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <Badge className={`${group.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-green-100`}>
                    {group.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  {group.parent !== 'primary' && (
                    <div className="flex items-center text-sm">
                      <Layers className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Parent: {group.parent}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">Created: {group.createdAt}</span>
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
              Add New Stock Group
            </DialogTitle>
            <p className="text-gray-600 text-sm">
              Fill in the stock group details and registration information
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
                  placeholder="Group Code *"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                />
                <CustomInputBox
                  placeholder="Group Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Parent Group</label>
                <select
                  value={formData.parent}
                  onChange={(e) => handleSelectChange("parent", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="primary">Primary (No Parent)</option>
                  {stockGroups.map(group => (
                    <option key={group.id} value={group.code}>{group.name} ({group.code})</option>
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
                  Save Group
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