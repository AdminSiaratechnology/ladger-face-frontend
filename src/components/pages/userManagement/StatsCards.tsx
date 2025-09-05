import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Users, Zap, Shield, Target, TrendingUp, ChevronRight } from 'lucide-react';
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

const StatsCards = () => {
  const [isVisible, setIsVisible] = useState(false);

  const [users, setUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { 
      label: 'Total Users', 
      value: users.length, 
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700',
      icon: <Users className="w-5 h-5" />,
      trend: '+12%',
      delay: 0
    },
    { 
      label: 'Active Users', 
      value: users.filter(u => u.status === 'active').length, 
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-emerald-500 to-green-600',
      icon: <Zap className="w-5 h-5" />,
      trend: '+5%',
      delay: 100
    },
    { 
      label: 'Admins', 
      value: users.filter(u => u.role === 'admin').length, 
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-rose-500 to-pink-600',
      icon: <Shield className="w-5 h-5" />,
      trend: '+2%',
      delay: 200
    },
    { 
      label: 'Customers', 
      value: users.filter(u => u.role === 'customer').length, 
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      icon: <Target className="w-5 h-5" />,
      trend: '+15%',
      delay: 300
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className={`border-0 shadow-lg overflow-hidden transition-all duration-700 ease-out transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ transitionDelay: `${stat.delay}ms` }}
        >
          <div className={`p-6 ${stat.bgColor} text-white relative overflow-hidden group`}>
            {/* Animated background element */}
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500"></div>
            
            <CardContent className="p-0 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white/90">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                  
                  <div className="flex items-center mt-3">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium text-white/90">{stat.trend}</span>
                  </div>
                </div>
                
                <div className="p-3 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors duration-300">
                  {stat.icon}
                </div>
              </div>
              
              {/* Interactive element */}
              <button className="flex items-center mt-6 text-xs font-medium text-white/80 hover:text-white transition-colors">
                View details
                <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;