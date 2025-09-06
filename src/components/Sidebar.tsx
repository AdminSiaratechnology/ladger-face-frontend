import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  MapPin, 
  Settings,
  Shield,
  LogOut,
  Building2,
  UserPlus,
  Truck,
  HatGlasses,
  Warehouse,
  FolderOpen,
  Layers,
  Ruler
} from 'lucide-react';
import { Button } from './ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  path?: string;
  id?: string;
  icon: React.ElementType;
  label: string;
  roles: string[];
  type: 'link' | 'accordion';
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  path: string;
  icon: React.ElementType;
  label: string;
  roles: string[];
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
//   Godown 

// Stock category 

// Stock Group 

// UOM

// Product

  const menuItems: MenuItem[] = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'agent', 'salesman'], type: 'link' },
    { path: '/company', icon: LayoutDashboard, label: 'Company', roles: ['admin', 'agent', 'salesman'], type: 'link' },
       {
      id: 'business-partners',
      icon: Building2,
      label: 'Business Partners',
      roles: ['admin', 'agent', 'salesman'],
      type: 'accordion',
      subItems: [
        { path: '/customer-registration', icon: UserPlus, label: 'Customer Registration', roles: ['admin', 'agent'] },
        { path: '/vendor-registration', icon: Truck, label: 'Vendor Registration', roles: ['admin', 'agent'] },
        { path: '/agent', icon: HatGlasses, label: 'Agent', roles: ['admin', 'agent'] },
        { path: '/ladger-registration', icon: HatGlasses, label: 'Ladger', roles: ['admin', 'agent'] },
      ]
    },
    { path: '/users', icon: Users, label: 'User Management', roles: ['admin'], type: 'link' },
    { path: '/inventory', icon: Package, label: 'Inventory', roles: ['admin', 'agent'], type: 'link' },
       {
      id: 'inventory',
      icon: Package,
      label: 'Inventory',
      roles: ['admin', 'agent', 'salesman'],
      type: 'accordion',
      subItems: [
        { path: '/godown', icon: UserPlus, label: 'Godown', roles: ['admin', 'agent'] },
        { path: '/godown', icon: Warehouse, label: 'Godown', roles: ['admin', 'agent'] },
{ path: '/stock-category', icon: FolderOpen, label: 'Stock Category', roles: ['admin', 'agent'] },
{ path: '/stock-group', icon: Layers, label: 'Stock Group', roles: ['admin', 'agent'] },
{ path: '/uom', icon: Ruler, label: 'UOM', roles: ['admin', 'agent'] },
{ path: '/product', icon: Package, label: 'Product', roles: ['admin', 'agent'] },
{ path: '/pricing', icon: DollarSign, label: 'Price Lists', roles: ['admin'] },
      ]
    },

    { path: '/orders', icon: ShoppingCart, label: 'Orders', roles: ['admin', 'agent', 'salesman'], type: 'link' },
    
    { path: '/tracking', icon: MapPin, label: 'Location Tracking', roles: ['admin'], type: 'link' },
    { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin'], type: 'link' },
 
  ];

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  ).map(item => {
    if (item.type === 'accordion' && item.subItems) {
      return {
        ...item,
        subItems: item.subItems.filter(subItem => 
          user && subItem.roles.includes(user.role)
        )
      };
    }
    return item;
  }).filter(item => {
    // Only show accordion items if they have visible subitems
    if (item.type === 'accordion') {
      return item.subItems && item.subItems.length > 0;
    }
    return true;
  });

  // Check if any sub-item is active
  const isAccordionItemActive = (subItems: SubMenuItem[]) => {
    return subItems.some(subItem => location.pathname === subItem.path);
  };

  const SimpleLinkComponent = ({ to, icon: Icon, label }: { to: string, icon: React.ElementType, label: string }) => {
    return (
      <Link
        to={to}
        className={`flex items-center space-x-3 px-6 py-3 transition-colors ${
          location.pathname === to
            ? 'bg-teal-600 text-white border-r-2 border-teal-200'
            : 'text-gray-300 hover:bg-teal-700'
        }`}
      >
        <Icon className="w-5 h-5 text-white" />
        <span className='text-white text-lg'>{label}</span>
      </Link>
    );
  };

  const SimpleAccordionComponent = ({ accordionItem }: { accordionItem: MenuItem }) => {
    if (!accordionItem.subItems || accordionItem.type !== 'accordion') {
      return null;
    }

    const Icon = accordionItem.icon;
    const isActive = isAccordionItemActive(accordionItem.subItems);

    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={accordionItem.id!} className="border-none">
          <AccordionTrigger 
            className={`flex items-center space-x-3 rounded-none px-6 pr-2 py-3 transition-colors hover:no-underline [&>svg]:w-4 [&>svg]:h-4 ${
              isActive
                ? 'bg-teal-600 text-white border-r-2 border-teal-200'
                : 'text-gray-300 hover:bg-teal-700'
            }`}
          >
            <div className="flex items-center space-x-3 flex-1 text-md ">
              <Icon className="w-5 h-5 text-white" />
              <span className='text-white !text-lg font-normal'>{accordionItem.label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            {accordionItem.subItems.map((subItem) => {
              const SubIcon = subItem.icon;
              return (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  className={`flex items-center space-x-3 px-12 pr-2 py-2 transition-colors ${
                    location.pathname === subItem.path
                      ? 'bg-teal-700 text-white border-r-2 border-teal-200'
                      : 'text-gray-300 hover:bg-teal-900'
                  }`}
                >
                  <SubIcon className="w-4 h-4 text-white" />
                  <span className='text-white text-sm'>{subItem.label}</span>
                </Link>
              );
            })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  if (!isOpen) {
    return (
      <div className="w-16 max-h-[40px]] bg-gradient-to-b from-teal-800 to-teal-900  text-white flex flex-col overflow-hidden overflow-y-scroll">
        <div className="p-4 border-b border-gray-700">
          <Shield className="w-8 h-8 text-blue-400" />
        </div>
        <nav className="flex-1 py-4">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.type === 'link' 
              ? location.pathname === item.path
              : item.subItems ? isAccordionItemActive(item.subItems) : false;
            
            return (
              <div
                key={item.path || item.id}
                className={`flex items-center justify-center p-3 mx-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-teal-400 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                title={item.label}
              >
                {item.type === 'link' ? (
                  <Link to={item.path!}>
                    <Icon className="w-6 h-6" />
                  </Link>
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full p-2 text-gray-300 hover:bg-gray-700"
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gradient-to-b from-teal-800 to-teal-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="font-bold">BMS</h1>
            <p className="text-xs text-gray-400">Business Management</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-b from-teal-600 to-teal-400 rounded-full flex items-center justify-center">
            <span className="font-medium text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {filteredMenuItems.map((item) => {
          return (
            <div key={item.path || item.id}>
              {item.type === 'link' ? (
                <SimpleLinkComponent to={item.path!} icon={item.icon} label={item.label} />
              ) : (
                <SimpleAccordionComponent accordionItem={item} />
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-6 border-t border-gray-700">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start text-gray-300 hover:bg-gray-700"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}