import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Switch } from './ui/switch';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  UserPlus,
  BarChart3,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import StatsCards from './userManagement/StatsCards';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'agent' | 'customer' | 'salesman';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
  area?: string;
  pincode?: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Admin',
    email: 'admin@company.com',
    phone: '+91 9876543210',
    role: 'admin',
    status: 'active',
    lastLogin: '2 hours ago',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'Jane Agent',
    email: 'agent@company.com',
    phone: '+91 9876543211',
    role: 'agent',
    status: 'active',
    lastLogin: '5 min ago',
    createdAt: '2024-02-20'
  },
  {
    id: 3,
    name: 'Bob Customer',
    email: 'customer@company.com',
    phone: '+91 9876543212',
    role: 'customer',
    status: 'active',
    lastLogin: '1 day ago',
    createdAt: '2024-03-10',
    area: 'Mumbai',
    pincode: '400001'
  },
  {
    id: 4,
    name: 'Alice Salesman',
    email: 'salesman@company.com',
    phone: '+91 9876543213',
    role: 'salesman',
    status: 'active',
    lastLogin: '30 min ago',
    createdAt: '2024-02-28',
    area: 'Delhi',
    pincode: '110001'
  },
  {
    id: 5,
    name: 'Charlie Inactive',
    email: 'inactive@company.com',
    phone: '+91 9876543214',
    role: 'customer',
    status: 'inactive',
    lastLogin: '30 days ago',
    createdAt: '2024-01-05',
    area: 'Bangalore',
    pincode: '560001'
  },
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer' as User['role'],
    area: '',
    pincode: ''
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = () => {
    const user: User = {
      id: users.length + 1,
      ...newUser,
      status: 'active',
      lastLogin: 'Never',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', phone: '', role: 'customer', area: '', pincode: '' });
    setIsCreateDialogOpen(false);
    toast.success('User created successfully');
  };

  const handleToggleStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
    toast.success('User status updated');
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success('User deleted successfully');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'agent': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'salesman': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'customer': return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-700 text-white';
    }
  };

  const getRoleIconColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-500';
      case 'agent': return 'text-blue-500';
      case 'salesman': return 'text-green-500';
      case 'customer': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const stats = [
    { 
      label: 'Total Users', 
      value: users.length, 
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-100 to-blue-50',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      trend: '+12%'
    },
    { 
      label: 'Active Users', 
      value: users.filter(u => u.status === 'active').length, 
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-100 to-green-50',
      icon: <Zap className="w-6 h-6 text-green-600" />,
      trend: '+5%'
    },
    { 
      label: 'Admins', 
      value: users.filter(u => u.role === 'admin').length, 
      color: 'text-red-600',
      bgColor: 'bg-gradient-to-br from-red-100 to-red-50',
      icon: <Shield className="w-6 h-6 text-red-600" />,
      trend: '+2%'
    },
    { 
      label: 'Customers', 
      value: users.filter(u => u.role === 'customer').length, 
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-100 to-purple-50',
      icon: <Target className="w-6 h-6 text-purple-600" />,
      trend: '+15%'
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
            Manage users, roles, and permissions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* <Button variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm" className="border-purple-300 text-purple-600 hover:bg-purple-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button> */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-500 hover:to-blue-600">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-xl border-0 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-800">Create New User</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Add a new user to the system with appropriate role and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-700">Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Enter full name"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Enter email address"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-gray-700">Phone</Label>
                    <Input
                      id="phone"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-gray-700">Role</Label>
                    <Select value={newUser.role} onValueChange={(value: User['role']) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin" className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                          Admin
                        </SelectItem>
                        <SelectItem value="agent" className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                          Agent
                        </SelectItem>
                        <SelectItem value="salesman" className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          Salesman
                        </SelectItem>
                        <SelectItem value="customer" className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                          Customer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(newUser.role === 'customer' || newUser.role === 'salesman') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="area" className="text-gray-700">Area</Label>
                      <Input
                        id="area"
                        value={newUser.area}
                        onChange={(e) => setNewUser({ ...newUser, area: e.target.value })}
                        placeholder="Enter area/city"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode" className="text-gray-700">Pincode</Label>
                      <Input
                        id="pincode"
                        value={newUser.pincode}
                        onChange={(e) => setNewUser({ ...newUser, pincode: e.target.value })}
                        placeholder="Enter pincode"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateUser}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Create User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm overflow-hidden">
            <div className={`p-1 ${stat.bgColor}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs font-medium text-green-600 mt-1">{stat.trend}</p>
                  </div>
                  <div className="p-3 rounded-full bg-white shadow-sm">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
      <StatsCards />

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm bg-white rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              User Directory
            </CardTitle>
            <CardDescription className="text-gray-600">
              Manage user accounts, roles, and permissions
            </CardDescription>
          </CardHeader>
        </div>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-40 border-gray-300 focus:border-blue-500">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="salesman">Salesman</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 border-gray-300 focus:border-blue-500">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <TableRow>
                  <TableHead className="text-gray-700 font-semibold">User</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Role</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Area/Pincode</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Last Login</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-blue-600 text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {user.phone}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${getRoleIconColor(user.role)}`}></span>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.status === 'active'}
                          onCheckedChange={() => handleToggleStatus(user.id)}
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                        />
                        <Badge 
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                          className={user.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.area && user.pincode ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.area}</p>
                          <p className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md inline-block">{user.pincode}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {user.lastLogin}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 float-right">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-md rounded-lg">
                          <DropdownMenuLabel className="text-gray-700">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-gray-700 hover:bg-blue-50 cursor-pointer">
                            <Edit className="w-4 h-4 mr-2 text-blue-500" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-700 hover:bg-blue-50 cursor-pointer">
                            <Shield className="w-4 h-4 mr-2 text-purple-500" />
                            Manage Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-700 hover:bg-blue-50 cursor-pointer">
                            <Mail className="w-4 h-4 mr-2 text-green-500" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 hover:bg-red-50 cursor-pointer"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}