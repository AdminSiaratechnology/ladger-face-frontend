import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
// import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { TrendingUp, Target, Users, Search } from 'lucide-react';
import { Badge } from '../ui/badge';

interface SalesmanData {
  name: string;
  sales: number;
  target: number;
  orders: number;
}

// Generate sample data for thousands of users
const generateSalesmanData = (count: number): SalesmanData[] => {
  const firstNames = ['Raj', 'Priya', 'Amit', 'Neha', 'Rohit', 'Anjali', 'Vikram', 'Sunita', 'Arjun', 'Kavya', 'Sanjay', 'Meera', 'Arun', 'Deepika', 'Karan', 'Pooja', 'Rahul', 'Nisha', 'Suresh', 'Ritu'];
  const lastNames = ['Kumar', 'Sharma', 'Singh', 'Patel', 'Mehta', 'Gupta', 'Verma', 'Agarwal', 'Joshi', 'Shah', 'Yadav', 'Malhotra', 'Kapoor', 'Tiwari', 'Saxena', 'Bansal', 'Arora', 'Chopra', 'Bajaj', 'Mittal'];
  
  return Array.from({ length: count }, (_, i) => ({
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]} ${i > 399 ? i + 1 : ''}`,
    sales: Math.floor(Math.random() * 200000) + 50000,
    target: Math.floor(Math.random() * 100000) + 120000,
    orders: Math.floor(Math.random() * 40) + 10
  }));
};

const salesmanPerformance: SalesmanData[] = generateSalesmanData(1000);

// Custom Progress component with dynamic colors
const PerformanceProgress: React.FC<{ value: number }> = ({ value }) => {
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div 
        className={`h-full transition-all duration-700 ease-out rounded-full ${getProgressColor(value)}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
};

const getPerformanceVariant = (percentage: number): "default" | "secondary" | "destructive" => {
  if (percentage >= 100) return 'default';
  if (percentage >= 80) return 'secondary';
  return 'destructive';
};

const getPerformanceColor = (percentage: number): string => {
  if (percentage >= 100) return 'from-green-500 to-emerald-600';
  if (percentage >= 80) return 'from-yellow-500 to-orange-500';
  if (percentage >= 60) return 'from-orange-500 to-red-500';
  return 'from-red-500 to-rose-600';
};

const getInitials = (name: string): string => 
  name.split(' ').map(n => n[0]).join('');

const SalesmanCard: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  
  const filteredSalesmen = useMemo(() => {
    return salesmanPerformance.filter(salesman =>
      salesman.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalSalesmen = salesmanPerformance.length;
  const avgPerformance = useMemo(() => {
    const totalPerformance = salesmanPerformance.reduce((sum, salesman) => 
      sum + (salesman.sales / salesman.target) * 100, 0
    );
    return totalPerformance / totalSalesmen;
  }, [totalSalesmen]);

  return (
    
      <Card className="w-full  bg-white/70 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-lg"></div>
        
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Sales Performance
              </CardTitle>
              <CardDescription className="text-xs">
                {totalSalesmen.toLocaleString()} salespeople • {avgPerformance.toFixed(1)}% avg performance
              </CardDescription>
            </div>
          </div>
          
          <div className="relative mt-3">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search salespeople..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 bg-white/50 border-white/30"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <ScrollArea className="h-64 pr-4">
            <div className="space-y-3">
              {filteredSalesmen.slice(0, 100).map((salesman: SalesmanData, index: number) => {
                const percentage: number = (salesman.sales / salesman.target) * 100;
                const performanceColor: string = getPerformanceColor(percentage);
                
                return (
                  <div key={index} className="group">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors duration-200">
                      <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${performanceColor} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200`}>
                        <span className="text-xs font-semibold text-white">
                          {getInitials(salesman.name)}
                        </span>
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {salesman.name}
                          </h4>
                          <Badge 
                            variant={getPerformanceVariant(percentage)}
                            className="text-xs px-2 py-0.5"
                          >
                            {percentage.toFixed(0)}%
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <PerformanceProgress value={percentage} />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              <span>₹{(salesman.sales / 1000).toFixed(0)}K / ₹{(salesman.target / 1000).toFixed(0)}K</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{salesman.orders}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredSalesmen.length > 100 && (
                <div className="text-center py-2 text-xs text-muted-foreground border-t">
                  Showing 100 of {filteredSalesmen.length} results
                </div>
              )}
              
              {filteredSalesmen.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No salespeople found matching "{searchTerm}"
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">≥100%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-muted-foreground">80-99%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  <span className="text-muted-foreground">60-79%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  <span className="text-muted-foreground">&lt;60%</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
     
   
  );
};

export default SalesmanCard;