import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Activity,
  Target,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import SalesmanCard from "../dashbord/ModernSalesmanCard";
import { DashboardCards } from "../dashbord/DashboardCards";
import HeaderGradient from "../customComponents/HeaderGradint";
import { useAgentStore } from "../../../store/agentStore";
import { useStockCategory } from "../../../store/stockCategoryStore";
import { useStockGroup } from "../../../store/stockGroupStore";
import { useUOMStore } from "../../../store/uomStore";
import { useGodownStore } from "../../../store/godownStore";
import { useUserManagementStore } from "../../../store/userManagementStore";
import { useVendorStore } from "../../../store/vendorStore";
import { useCompanyStore } from "../../../store/companyStore";

const salesData = [
  { name: "Jan", sales: 4000, orders: 240 },
  { name: "Feb", sales: 3000, orders: 139 },
  { name: "Mar", sales: 2000, orders: 980 },
  { name: "Apr", sales: 2780, orders: 390 },
  { name: "May", sales: 1890, orders: 480 },
  { name: "Jun", sales: 2390, orders: 380 },
];

const regionData = [
  { name: "North", value: 400, color: "#0088FE" },
  { name: "South", value: 300, color: "#00C49F" },
  { name: "East", value: 300, color: "#FFBB28" },
  { name: "West", value: 200, color: "#FF8042" },
];

const salesmanPerformance = [
  { name: "Alice Johnson", sales: 85000, target: 100000, orders: 45 },
  { name: "Bob Smith", sales: 72000, target: 80000, orders: 38 },
  { name: "Carol Davis", sales: 94000, target: 90000, orders: 52 },
  { name: "David Wilson", sales: 61000, target: 75000, orders: 29 },
];


export default function AdminDashboard() {
    const { fetchStockCategory } = useStockCategory();
    const { fetchStockGroup } = useStockGroup();
    const { fetchUnits } = useUOMStore();
    const { fetchUsers } = useUserManagementStore();
    const { fetchGodowns } = useGodownStore();
    const { fetchVendors } = useVendorStore();
  const gradient = [
    "bg-gradient-to-r from-teal-500 to-teal-600",
    "bg-gradient-to-r from-green-500 to-green-600",
    "bg-gradient-to-r from-blue-500 to-blue-600",
    "bg-gradient-to-r from-purple-500 to-purple-600",
  ];
  const stats = [
    {
      title: "Total Users",
      value: "12,430",
      change: "+12%",
      color: "bg-blue-500",
      icon: TrendingUp,
      className: "bg-gradient-to-r from-green-500 to-green-600",
    },
    {
      title: "Active Sessions",
      value: "1,210",
      change: "-5%",
      color: "bg-green-500",
      icon: TrendingUp,
      className: "bg-gradient-to-r from-green-500 to-green-600",
    },
    {
      title: "Revenue",
      value: "$54,300",
      change: "+8%",
      color: "bg-yellow-500",
      icon: TrendingUp,
      className: "bg-gradient-to-r from-green-500 to-green-600",
    },
    {
      title: "Bounce Rate",
      value: "28%",
      change: "-2%",
      color: "bg-red-500",
      icon: TrendingUp,
    },
  ];
  const recentActivities = [
    {
      id: 1,
      action: "New order placed",
      user: "John Doe",
      time: "2 min ago",
      type: "order",
    },
    {
      id: 2,
      action: "Inventory synced from Tally",
      user: "System",
      time: "5 min ago",
      type: "sync",
    },
    {
      id: 3,
      action: "Payment received",
      user: "Jane Smith",
      time: "10 min ago",
      type: "payment",
    },
    {
      id: 4,
      action: "Low stock alert",
      user: "System",
      time: "15 min ago",
      type: "alert",
    },
    {
      id: 5,
      action: "User created",
      user: "Admin",
      time: "20 min ago",
      type: "user",
    },
  ];

  const integrationStats = [
    {
      name: "Tally ERP",
      status: "Connected",
      lastSync: "5 min ago",
      orders: 1234,
      success: 98.5,
    },
    {
      name: "QuickBooks",
      status: "Connected",
      lastSync: "1 hour ago",
      orders: 456,
      success: 95.29,
    },
    {
      name: "Zoho",
      status: "Disconnected",
      lastSync: "Never",
      orders: 0,
      success: 0,
    },
  ];
  function StatsGrid() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith("+");

          return (
            <Card
              key={index}
              className={`${gradient[index]} shadow-xl hover:shadow-2xl text-white  relative overflow-hidden rounded-2xl  transition-all duration-300 transform hover:scale-105`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{stat.title}</p>
                  <div className={`p-2 rounded-full bg-white opacity-30`}>
                    <Icon
                      className={`w-5 h-5 ${stat.color.replace(
                        "bg-",
                        "text-"
                      )}`}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <Badge
                    variant={isPositive ? "default" : "destructive"}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-white opacity-10"
                  >
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
  const fetchOtherAsync = async () => {
    const { defaultSelected } = useCompanyStore.getState(); // Use getState() to get the latest store value immediately
    const companyId = defaultSelected?._id;
  
    if (!companyId) return;

    try {
      // Run all API calls in parallel
      await Promise.all([
        fetchStockCategory(1, 10, companyId),
        fetchStockGroup(1, 10, companyId),
        fetchUnits(1, 10, companyId),
        fetchGodowns(1,10,companyId),
        fetchUsers(1,10,companyId),
        fetchVendors(1,10,companyId),
      ]);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } 
  };

  useEffect(() => {
  
        fetchOtherAsync(); // Call fetchOtherAsync here to load other data and navigate
     
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <HeaderGradient
          title={"Dashboard"}
          subtitle={"Welcome back! Here's what's happening with your business."}
        />
        {/* <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="w-3 h-3 mr-1" />
            All Systems Online
          </Badge>
        </div> */}
      </div>

      {/* Key Metrics */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <Badge 
                    variant={stat.change.startsWith('+') ? 'default' : 'destructive'} 
                    className="text-xs"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4  ">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-3 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between ">
            <div className=" bg-white/20 rounded-xl">
              <i className="fas fa-hospital text-2xl"></i>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-75">Growth</div>
              <div className="text-xs font-semibold">+8.3%</div>
            </div>
          </div>
          <div>
            <p className="text-sm opacity-90">Healthcare Tenants</p>
            <p className="text-2xl font-bold">5</p>
            <p className="text-xs opacity-75">4 Active • 1 Inactive</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb4">
            <div className="p-3 bg-white/20 rounded-xl">
              <i className="fas fa-users text-2xl"></i>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-75">Online</div>
              <div className="text-xs font-semibold">80%</div>
            </div>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Platform Users</p>
            <p className="text-2xl font-bold">5</p>
            <p className="text-xs opacity-75">4 Active • 1 Inactive</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white/20 rounded-xl">
              <i className="fas fa-dollar-sign text-2xl"></i>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-75">Growth</div>
              <div className="text-xs font-semibold">+15.2%</div>
            </div>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Monthly Revenue</p>
            <p className="text-2xl font-bold">$20,000</p>
            <p className="text-xs opacity-75">3 Paid • 2 Pending</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between ">
            <div className="p-3 bg-white/20 rounded-xl">
              <i className="fas fa-shield-alt text-2xl"></i>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-75">Security</div>
              <div className="text-xs font-semibold">HIPAA</div>
            </div>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">MFA Adoption</p>
            <p className="text-2xl font-bold">60%</p>
            <p className="text-xs opacity-75">3 Users • Compliance: 95%</p>
          </div>
        </div>
      </div>

      <StatsGrid />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Trend */}
        <Card className="bg-white/80  backdrop-blur-lg border border-white/20 shadow-xl ">
          <CardHeader>
            <CardTitle >Sales Trend</CardTitle>
            <CardDescription className="text-sm">Monthly sales and order volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Sales Distribution */}
        <Card className="bg-white/80  backdrop-blur-lg border border-white/20 shadow-xl ">
          <CardHeader>
            <CardTitle>Regional Sales Distribution</CardTitle>
            <CardDescription className="text-sm">
              Sales breakdown by geographic regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Salesman Performance */}
      <Card className="bg-white/80  backdrop-blur-lg border border-white/20 shadow-xl ">
        <CardHeader>
          <CardTitle>Salesman Performance</CardTitle>
          <CardDescription className="text-sm">Target vs actual sales performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesmanPerformance.map((salesman, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-medium text-blue-600">
                    {salesman.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{salesman.name}</h4>
                    <div className="text-sm text-gray-600">
                      ₹{salesman.sales.toLocaleString()} / ₹
                      {salesman.target.toLocaleString()}
                    </div>
                  </div>
                  <Progress
                    value={(salesman.sales / salesman.target) * 100}
                    className="h-1.5"
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {salesman.orders} orders
                  </p>
                  <p className="text-xs text-gray-600">
                    {((salesman.sales / salesman.target) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <SalesmanCard />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-1">
        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {/* <RefreshCw className="w-5 h-5 mr-2" /> */}
              Integration Status
            </CardTitle>
            <CardDescription className="text-sm">External software connections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {integrationStats.map((integration, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{integration.name}</h4>
                  <p className="text-xs text-gray-600">
                    Last sync: {integration.lastSync}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      integration.status === "Connected"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {integration.status}
                  </Badge>
                  <p className="text-xs text-gray-600">
                    {integration.success}% success
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription className="text-sm">Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "order"
                        ? "bg-green-500"
                        : activity.type === "sync"
                        ? "bg-blue-500"
                        : activity.type === "payment"
                        ? "bg-purple-500"
                        : activity.type === "alert"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-600">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription className="text-sm">Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full p-2 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm">Create New User</span>
              </div>
            </button>
            <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-sm">Add Inventory Item</span>
              </div>
            </button>
            <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 text-purple-600" />
                <span className="text-sm">Sync with Tally</span>
              </div>
            </button>
            <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                <span className="text-sm">View Location Tracking</span>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
      {/* <DashboardCards /> */}
    </div>
  );
}
