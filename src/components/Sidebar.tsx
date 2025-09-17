import React, { useState, useEffect } from 'react';
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
  Ruler,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { dummyCompanies } from '../lib/dummyData';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
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

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  console.log("Sidebar User:", user);
  const location = useLocation();
  const [hasCompany, setHasCompany] = useState(false);
  

  // Check if company exists in localStorage on component mount
  useEffect(() => {
    const checkCompanyExists = () => {
      try {
        // const companysData = localStorage.getItem('companys');
        const companysData = dummyCompanies;
        if (companysData) {
          // const companies = JSON.parse(companysData);
          const companies = companysData;
          setHasCompany(Array.isArray(companies) && companies.length > 0);
        } else {
          setHasCompany(false);
        }
      } catch (error) {
        console.error('Error reading companies from localStorage:', error);
        setHasCompany(false);
      }
    };

    checkCompanyExists();

    // Listen for localStorage changes (in case company is added/removed in another tab)
    const handleStorageChange = () => {
      checkCompanyExists();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events when localStorage is modified in the same tab
    window.addEventListener('companiesUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companiesUpdated', handleStorageChange);
    };
  }, []);

  // Full menu items (shown when company exists)
  const fullMenuItems: MenuItem[] = [
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
    {
      id: 'inventory-management',
      icon: Package,
      label: 'Inventory Management',
      roles: ['admin', 'agent', 'salesman'],
      type: 'accordion',
      subItems: [
        { path: '/godown', icon: Warehouse, label: 'Godown', roles: ['admin', 'agent'] },
        { path: '/stock-category', icon: FolderOpen, label: 'Stock Category', roles: ['admin', 'agent'] },
        { path: '/stock-group', icon: Layers, label: 'Stock Group', roles: ['admin', 'agent'] },
        { path: '/uom', icon: Ruler, label: 'UOM', roles: ['admin', 'agent'] },
        { path: '/product', icon: Package, label: 'Product', roles: ['admin', 'agent'] },
        { path: '/price-list', icon: DollarSign, label: 'Price Lists', roles: ['admin'] },
      ]
    },
    { path: '/orders', icon: ShoppingCart, label: 'Orders', roles: ['admin', 'agent', 'salesman'], type: 'link' },
    { path: '/tracking', icon: MapPin, label: 'Location Tracking', roles: ['admin'], type: 'link' },
    { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin'], type: 'link' },
  ];

  // Limited menu items (shown when no company exists)
  const limitedMenuItems: MenuItem[] = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'agent', 'salesman'], type: 'link' },
    { path: '/company', icon: LayoutDashboard, label: 'Company', roles: ['admin', 'agent', 'salesman'], type: 'link' },
    { path: '/users', icon: Users, label: 'User Management', roles: ['admin'], type: 'link' },
    { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin'], type: 'link' },
  ];

  // Choose which menu items to use based on company existence
  const menuItems = hasCompany ? fullMenuItems : limitedMenuItems;
  console.log("Menu Items:",user ,menuItems);

  const filteredMenuItems = menuItems.filter(item => {
    console.log("Filtering item:", item.roles, "User role:", user?.role);
    let userRole = user?.role.toLowerCase() || '';
    return true;
   return user && item.roles.includes(userRole);
  }

  ).map(item => {
    if (item.type === 'accordion' && item.subItems) {
      return {
        ...item,
        subItems: item.subItems.filter(subItem => 
          user && subItem.roles.includes(user.role.toLowerCase())
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

  // Get the ID of the accordion that should be expanded based on current location
  const getActiveAccordionId = () => {
    for (const item of filteredMenuItems) {
      if (item.type === 'accordion' && item.subItems) {
        if (isAccordionItemActive(item.subItems)) {
          return item.id;
        }
      }
    }
    return undefined;
  };

  // Handle link click - close sidebar on mobile
  const handleLinkClick = () => {
    if (window.innerWidth < 768 && onClose) {
      onClose();
    }
  };

  const SimpleLinkComponent = ({ to, icon: Icon, label }: { to: string, icon: React.ElementType, label: string }) => {
    return (
      <Link
        to={to}
        onClick={handleLinkClick}
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
      <Accordion 
        type="single" 
        collapsible 
        className="w-full"
        defaultValue={getActiveAccordionId()}
        value={getActiveAccordionId()}
      >
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
                  onClick={handleLinkClick}
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

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/15 bg-opacity-50 z-40 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative top-0 left-0 h-full z-50
        w-64 bg-gradient-to-b from-teal-800 to-teal-900 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header with close button */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="font-bold">BMS</h1>
                <p className="text-xs text-gray-400">Business Management</p>
              </div>
            </div>
            {/* Close button - only visible on mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden p-1 text-gray-300 hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* User info */}
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

        {/* Company Status Indicator (Optional - you can remove this if not needed) */}
        {!hasCompany && (
          <div className="px-4 py-2 bg-amber-600/20 border-b border-gray-700">
            <p className="text-xs text-amber-200">
              ⚠️ Please add company details to access all features
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
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

        {/* Logout button */}
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
    </>
  );
}