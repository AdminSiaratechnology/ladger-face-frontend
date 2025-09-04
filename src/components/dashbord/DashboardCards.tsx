import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  RefreshCw, 
  Users, 
  Package, 
  MapPin,
  Activity,
  Zap,
  ChevronRight
} from "lucide-react";

// TypeScript interfaces
interface IntegrationStat {
  id: string;
  name: string;
  lastSync: string;
  status: 'Connected' | 'Disconnected' | 'Error' | 'Pending';
  success: number;
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  time: string;
  type: 'order' | 'sync' | 'payment' | 'alert' | 'system';
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  variant: 'default' | 'secondary' | 'outline';
}

// Sample data with TypeScript typing
const integrationStats: IntegrationStat[] = [
  { id: '1', name: 'Tally ERP', lastSync: '2 minutes ago', status: 'Connected', success: 98 },
  { id: '2', name: 'Payment Gateway', lastSync: '5 minutes ago', status: 'Connected', success: 100 },
  { id: '3', name: 'Shipping API', lastSync: '10 minutes ago', status: 'Connected', success: 95 },
  { id: '4', name: 'CRM System', lastSync: '1 hour ago', status: 'Error', success: 87 },
];

const recentActivities: RecentActivity[] = [
  { id: '1', action: 'New order #1234 placed', user: 'Customer: John Doe', time: '2 mins ago', type: 'order' },
  { id: '2', action: 'Inventory sync completed', user: 'System', time: '5 mins ago', type: 'sync' },
  { id: '3', action: 'Payment received for #1234', user: 'Payment Processor', time: '8 mins ago', type: 'payment' },
  { id: '4', action: 'Low stock alert for SKU-5678', user: 'Inventory Manager', time: '15 mins ago', type: 'alert' },
  { id: '5', action: 'System backup completed', user: 'Admin', time: '30 mins ago', type: 'system' },
];

const quickActions: QuickAction[] = [
  { 
    id: '1', 
    title: 'Create New User', 
    icon: <Users className="w-5 h-5" />,
    description: 'Add a new team member',
    variant: 'secondary'
  },
  { 
    id: '2', 
    title: 'Add Inventory Item', 
    icon: <Package className="w-5 h-5" />,
    description: 'Add new product to catalog',
    variant: 'secondary'
  },
  { 
    id: '3', 
    title: 'Sync with Tally', 
    icon: <RefreshCw className="w-5 h-5" />,
    description: 'Manual sync with Tally ERP',
    variant: 'outline'
  },
  { 
    id: '4', 
    title: 'View Location Tracking', 
    icon: <MapPin className="w-5 h-5" />,
    description: 'Monitor delivery routes',
    variant: 'secondary'
  },
];

const getStatusVariant = (status: IntegrationStat['status']) => {
  switch (status) {
    case 'Connected':
      return 'default';
    case 'Disconnected':
      return 'secondary';
    case 'Error':
      return 'destructive';
    case 'Pending':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getActivityColor = (type: RecentActivity['type']) => {
  switch (type) {
    case 'order':
      return 'bg-green-500';
    case 'sync':
      return 'bg-blue-500';
    case 'payment':
      return 'bg-purple-500';
    case 'alert':
      return 'bg-amber-500';
    case 'system':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

export const DashboardCards = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Integration Status */}
      <Card className="border-border/40 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-lg font-semibold">
              <RefreshCw className="w-5 h-5 mr-2 text-blue-600" />
              Integration Status
            </CardTitle>
            <Badge variant="outline" className="px-2 py-1 text-xs font-normal">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
          <CardDescription>External software connections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrationStats.map((integration) => (
            <div 
              key={integration.id} 
              className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-background to-muted/30 transition-all hover:from-muted/30 hover:to-muted/30"
            >
              <div className="space-y-1">
                <h4 className="font-medium text-sm">{integration.name}</h4>
                <p className="text-xs text-muted-foreground">Last sync: {integration.lastSync}</p>
              </div>
              <div className="text-right space-y-1">
                <Badge 
                  variant={getStatusVariant(integration.status)}
                  className="mb-1 font-medium"
                >
                  {integration.status}
                </Badge>
                <div className="flex items-center justify-end">
                  <div className="w-16 bg-secondary rounded-full h-1.5 mr-2">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full" 
                      style={{ width: `${integration.success}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{integration.success}%</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-border/40 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-8">
              View all
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <CardDescription>Latest system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 group">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getActivityColor(activity.type)}`} />
                <div className="flex-1 space-y-1 group-hover:bg-muted/30 p-2 rounded-lg transition-colors">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border/40 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-semibold">
            <Zap className="w-5 h-5 mr-2 text-amber-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              className="w-full justify-start p-4 h-auto rounded-xl transition-all hover:shadow-sm"
            >
              <div className="flex items-center w-full">
                <div className="mr-3 text-primary">
                  {action.icon}
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground font-normal">{action.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};