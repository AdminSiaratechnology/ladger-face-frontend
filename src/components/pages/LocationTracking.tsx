import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  User,
  Calendar,
  Filter,
  Download,
  Eye,
  Route,
  Activity,
  AlertCircle,
  CheckCircle,
  Users
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';

interface LocationPoint {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  address: string;
  accuracy: number;
}

interface Visit {
  id: number;
  customerName: string;
  customerAddress: string;
  checkInTime: string;
  checkOutTime?: string;
  duration?: number; // in minutes
  purpose: string;
  status: 'completed' | 'ongoing' | 'missed';
  ordersPlaced: number;
  notes?: string;
}

interface SalesmanLocation {
  id: number;
  name: string;
  phone: string;
  status: 'active' | 'offline' | 'break';
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
  todayStats: {
    distanceTraveled: number; // in km
    visits: number;
    ordersPlaced: number;
    workingHours: number;
  };
  visits: Visit[];
  route: LocationPoint[];
  assignedArea: string;
  targetArea: {
    name: string;
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
}

const mockSalesmen: SalesmanLocation[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    phone: '+91 9876543210',
    status: 'active',
    currentLocation: {
      latitude: 19.0760,
      longitude: 72.8777,
      address: 'Andheri West, Mumbai, Maharashtra',
      timestamp: '2024-08-31 14:30:00'
    },
    todayStats: {
      distanceTraveled: 45.2,
      visits: 6,
      ordersPlaced: 4,
      workingHours: 7.5
    },
    assignedArea: 'Mumbai West',
    targetArea: {
      name: 'Mumbai West Zone',
      bounds: {
        north: 19.2,
        south: 19.0,
        east: 72.9,
        west: 72.8
      }
    },
    visits: [
      {
        id: 1,
        customerName: 'Tech Corp Ltd',
        customerAddress: 'Andheri Business Park',
        checkInTime: '09:15',
        checkOutTime: '10:30',
        duration: 75,
        purpose: 'Product Demo',
        status: 'completed',
        ordersPlaced: 1,
        notes: 'Interested in bulk purchase'
      },
      {
        id: 2,
        customerName: 'Digital Solutions',
        customerAddress: 'Bandra Kurla Complex',
        checkInTime: '11:00',
        checkOutTime: '12:15',
        duration: 75,
        purpose: 'Follow-up',
        status: 'completed',
        ordersPlaced: 2
      },
      {
        id: 3,
        customerName: 'Innovation Hub',
        customerAddress: 'Powai IT Park',
        checkInTime: '14:30',
        purpose: 'New Client Meeting',
        status: 'ongoing',
        ordersPlaced: 0
      }
    ],
    route: [
      { id: 1, latitude: 19.0760, longitude: 72.8777, timestamp: '09:00', address: 'Starting Point', accuracy: 5 },
      { id: 2, latitude: 19.0896, longitude: 72.8656, timestamp: '09:15', address: 'Andheri Business Park', accuracy: 3 },
      { id: 3, latitude: 19.0544, longitude: 72.8406, timestamp: '11:00', address: 'Bandra Kurla Complex', accuracy: 4 }
    ]
  },
  {
    id: 2,
    name: 'Bob Smith',
    phone: '+91 9876543211',
    status: 'break',
    currentLocation: {
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'Connaught Place, New Delhi',
      timestamp: '2024-08-31 13:45:00'
    },
    todayStats: {
      distanceTraveled: 32.8,
      visits: 4,
      ordersPlaced: 2,
      workingHours: 6.0
    },
    assignedArea: 'Delhi Central',
    targetArea: {
      name: 'Central Delhi Zone',
      bounds: {
        north: 28.7,
        south: 28.5,
        east: 77.3,
        west: 77.1
      }
    },
    visits: [
      {
        id: 4,
        customerName: 'Enterprise Solutions',
        customerAddress: 'Rajouri Garden',
        checkInTime: '09:30',
        checkOutTime: '10:45',
        duration: 75,
        purpose: 'Contract Renewal',
        status: 'completed',
        ordersPlaced: 1
      }
    ],
    route: []
  },
  {
    id: 3,
    name: 'Carol Davis',
    phone: '+91 9876543212',
    status: 'offline',
    currentLocation: {
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Koramangala, Bangalore',
      timestamp: '2024-08-31 18:00:00'
    },
    todayStats: {
      distanceTraveled: 28.5,
      visits: 5,
      ordersPlaced: 3,
      workingHours: 8.0
    },
    assignedArea: 'Bangalore South',
    targetArea: {
      name: 'South Bangalore Zone',
      bounds: {
        north: 13.0,
        south: 12.9,
        east: 77.7,
        west: 77.5
      }
    },
    visits: [],
    route: []
  }
];

export default function LocationTracking() {
  const [salesmen] = useState<SalesmanLocation[]>(mockSalesmen);
  const [selectedSalesman, setSelectedSalesman] = useState<SalesmanLocation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredSalesmen = salesmen.filter(salesman => {
    const matchesStatus = statusFilter === 'all' || salesman.status === statusFilter;
    const matchesArea = areaFilter === 'all' || salesman.assignedArea === areaFilter;
    
    return matchesStatus && matchesArea;
  });

  const areas = [...new Set(salesmen.map(s => s.assignedArea))];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'break':
        return <Badge className="bg-yellow-100 text-yellow-800">On Break</Badge>;
      case 'offline':
        return <Badge className="bg-gray-100 text-gray-800">Offline</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getVisitStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'ongoing':
        return <Badge className="bg-blue-100 text-blue-800">Ongoing</Badge>;
      case 'missed':
        return <Badge className="bg-red-100 text-red-800">Missed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalStats = {
    activeSalesmen: salesmen.filter(s => s.status === 'active').length,
    totalVisits: salesmen.reduce((sum, s) => sum + s.todayStats.visits, 0),
    totalOrders: salesmen.reduce((sum, s) => sum + s.todayStats.ordersPlaced, 0),
    totalDistance: salesmen.reduce((sum, s) => sum + s.todayStats.distanceTraveled, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Location Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor salesman locations, routes, and field activities</p>
        </div>
        <div className="flex items-center space-x-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Salesmen</p>
                <p className="text-2xl font-bold text-green-600">{totalStats.activeSalesmen}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold text-blue-600">{totalStats.totalVisits}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orders Placed</p>
                <p className="text-2xl font-bold text-purple-600">{totalStats.totalOrders}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Distance Traveled</p>
                <p className="text-2xl font-bold text-orange-600">{totalStats.totalDistance.toFixed(1)} km</p>
              </div>
              <Route className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salesmen List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Field Team</CardTitle>
            <CardDescription>Real-time location and status of salesmen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="break">On Break</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {areas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filteredSalesmen.map((salesman) => (
                <div
                  key={salesman.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedSalesman?.id === salesman.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedSalesman(salesman)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-blue-600 text-sm">
                          {salesman.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{salesman.name}</p>
                        <p className="text-xs text-gray-600">{salesman.assignedArea}</p>
                      </div>
                    </div>
                    {getStatusBadge(salesman.status)}
                  </div>
                  <div className="text-xs text-gray-600">
                    <p className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {salesman.currentLocation.address}
                    </p>
                    <p className="flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {salesman.todayStats.visits} visits • {salesman.todayStats.ordersPlaced} orders
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Map and Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Location Details</span>
              {selectedSalesman && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{selectedSalesman.assignedArea}</Badge>
                  {getStatusBadge(selectedSalesman.status)}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSalesman ? (
              <Tabs defaultValue="map" className="w-full">
                <TabsList>
                  <TabsTrigger value="map">Live Location</TabsTrigger>
                  <TabsTrigger value="visits">Today's Visits</TabsTrigger>
                  <TabsTrigger value="route">Route History</TabsTrigger>
                  <TabsTrigger value="stats">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="map" className="space-y-4">
                  <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-600">Live Map View</p>
                      <p className="text-sm text-gray-500">
                        Current Location: {selectedSalesman.currentLocation.address}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Last Update: {selectedSalesman.currentLocation.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Distance Today</p>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedSalesman.todayStats.distanceTraveled} km
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Working Hours</p>
                      <p className="text-lg font-bold text-green-600">
                        {selectedSalesman.todayStats.workingHours}h
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Efficiency</p>
                      <p className="text-lg font-bold text-purple-600">
                        {((selectedSalesman.todayStats.ordersPlaced / selectedSalesman.todayStats.visits) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="visits" className="space-y-4">
                  <div className="space-y-3">
                    {selectedSalesman.visits.map((visit) => (
                      <div key={visit.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{visit.customerName}</h4>
                          {getVisitStatusBadge(visit.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{visit.customerAddress}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Check-in:</span> {visit.checkInTime}
                          </div>
                          {visit.checkOutTime && (
                            <div>
                              <span className="text-gray-500">Check-out:</span> {visit.checkOutTime}
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">Purpose:</span> {visit.purpose}
                          </div>
                          <div>
                            <span className="text-gray-500">Orders:</span> {visit.ordersPlaced}
                          </div>
                        </div>
                        {visit.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <span className="text-gray-500">Notes:</span> {visit.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="route" className="space-y-4">
                  <div className="space-y-3">
                    {selectedSalesman.route.map((point, index) => (
                      <div key={point.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{point.address}</p>
                          <p className="text-sm text-gray-600">{point.timestamp}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          ±{point.accuracy}m
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Today's Performance</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Total Visits</span>
                          <span className="font-medium">{selectedSalesman.todayStats.visits}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Orders Placed</span>
                          <span className="font-medium">{selectedSalesman.todayStats.ordersPlaced}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Conversion Rate</span>
                          <span className="font-medium">
                            {((selectedSalesman.todayStats.ordersPlaced / selectedSalesman.todayStats.visits) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Distance Traveled</span>
                          <span className="font-medium">{selectedSalesman.todayStats.distanceTraveled} km</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium">Territory Coverage</h4>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Assigned Area</p>
                        <p className="font-medium">{selectedSalesman.assignedArea}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Zone: {selectedSalesman.targetArea.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <User className="w-16 h-16 mx-auto mb-4" />
                  <p>Select a salesman to view location details</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Geofencing Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Geofencing Alerts
          </CardTitle>
          <CardDescription>Real-time notifications for territory violations and check-ins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded">
              <div>
                <p className="font-medium">Alice Johnson entered restricted zone</p>
                <p className="text-sm text-gray-600">Outside assigned territory - 2 min ago</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-green-400 bg-green-50 rounded">
              <div>
                <p className="font-medium">Bob Smith checked in at customer location</p>
                <p className="text-sm text-gray-600">Enterprise Solutions, Rajouri Garden - 15 min ago</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Check-in</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-blue-400 bg-blue-50 rounded">
              <div>
                <p className="font-medium">Carol Davis completed scheduled visit</p>
                <p className="text-sm text-gray-600">Tech Startup Hub, Koramangala - 1 hour ago</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}