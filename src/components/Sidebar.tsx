import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
import { useAuthStore } from '../../store/authStore';

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
  module?: string;
  subModule?: string;
  type: 'link' | 'accordion';
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  path: string;
  icon: React.ElementType;
  label: string;
  roles: string[];
  module?: string;
  subModule?: string;
}

// Utility function to check permissions - same as in App.js
function checkPermission(user: any, module: string, subModule: string) {
  // If user has all permissions, allow access
  if (user.allPermissions) {
    return true;
  }

  // Check if user has access array and it's not empty
  if (!user.access || user.access.length === 0) {
    return false;
  }

  // Check permissions in the access array
  for (const accessItem of user.access) {
    const modules = accessItem.modules;
    
    if (modules && modules[module] && modules[module][subModule]) {
      return modules[module][subModule].read === true;
    }
  }

  return false;
}

// Function to check if user has access to a menu item
function hasMenuAccess(user: any, item: MenuItem | SubMenuItem) {
  // If specific module and subModule are provided, check permissions
  if (item.module && item.subModule) {
    return checkPermission(user, item.module, item.subModule);
  }

  // Fallback to role-based access if no module/subModule specified
  if (item.roles && user?.role) {
    return item.roles.includes(user.role.toLowerCase());
  }

  return false;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
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

  // Full menu items (shown when company exists) - updated with permission mappings
  const fullMenuItems: MenuItem[] = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'agent', 'salesman'], type: 'link' },
    { path: '/company', icon: LayoutDashboard, label: 'Company', roles: ['admin', 'agent', 'salesman'], type: 'link' },
    { path: '/users', icon: Users, label: 'User Management', roles: ['admin'], type: 'link' },
    {
      id: 'business-partners',
      icon: Building2,
      label: 'Business Partners',
      roles: ['admin', 'agent', 'salesman'],
      type: 'accordion',
      subItems: [
        { 
          path: '/customer-registration', 
          icon: UserPlus, 
          label: 'Customer Registration', 
          roles: ['admin', 'agent'],
          module: 'BusinessManagement',
          subModule: 'CustomerRegistration'
        },
        { 
          path: '/vendor-registration', 
          icon: Truck, 
          label: 'Vendor Registration', 
          roles: ['admin', 'agent'],
          module: 'BusinessManagement',
          subModule: 'Vendor'
        },
        { path: '/agent', icon: HatGlasses, label: 'Agent', roles: ['admin', 'agent'] },
        { path: '/ladger-registration', icon: HatGlasses, label: 'Ladger', roles: ['admin', 'agent'] },
      ]
    },
    
    {
      id: 'inventory-management',
      icon: Package,
      label: 'Inventory Management',
      roles: ['admin', 'agent', 'salesman'],
      type: 'accordion',
      subItems: [
        { 
          path: '/godown', 
          icon: Warehouse, 
          label: 'Godown', 
          roles: ['admin', 'agent'],
          module: 'InventoryManagement',
          subModule: 'Godown'
        },
        { path: '/stock-group', icon: Layers, label: 'Stock Group', roles: ['admin', 'agent'] },
        { path: '/stock-category', icon: FolderOpen, label: 'Stock Category', roles: ['admin', 'agent'] },
        { path: '/uom', icon: Ruler, label: 'UOM', roles: ['admin', 'agent'] },
        { path: '/product', icon: Package, label: 'Product', roles: ['admin', 'agent'] },
        { 
          path: '/price-list', 
          icon: DollarSign, 
          label: 'Price Lists', 
          roles: ['admin'],
          module: 'Pricing',
          subModule: 'PriceList'
        },
      ]
    },
    { 
      path: '/orders', 
      icon: ShoppingCart, 
      label: 'Orders', 
      roles: ['admin', 'agent', 'salesman'], 
      type: 'link',
      module: 'OrderManagement',
      subModule: 'Order'
    },
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
  console.log("Menu Items:", user, menuItems);

  const filteredMenuItems = menuItems.filter(item => {
    console.log("Filtering item:", item.label, "User:", user?.name);
    
    if (!user) return false;

    // Check access for the main menu item
    return hasMenuAccess(user, item);
  }).map(item => {
    if (item.type === 'accordion' && item.subItems) {
      // Filter sub-items based on permissions
      const filteredSubItems = item.subItems.filter(subItem => {
        if (!user) return false;
        return hasMenuAccess(user, subItem);
      });

      return {
        ...item,
        subItems: filteredSubItems
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
        className={`flex items-center space-x-3 px-6 py-3 transition-colors duration-200 ${
          location.pathname === to
            ? 'bg-teal-600 text-white border-r-4 border-teal-300'
            : 'text-teal-100 hover:bg-teal-700/80 hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className='text-base font-medium'>{label}</span>
      </Link>
    );
  };

  const SimpleAccordionComponent = ({ accordionItem }: { accordionItem: MenuItem }) => {
    if (!accordionItem.subItems || accordionItem.type !== 'accordion') {
      return null;
    }

    const Icon = accordionItem.icon;
    const isActive = isAccordionItemActive(accordionItem.subItems);
    const [openValue, setOpenValue] = useState<string | undefined>(isActive ? accordionItem.id : undefined);

    useEffect(() => {
      if (isActive) {
        setOpenValue(accordionItem.id);
      }
    }, [location.pathname, accordionItem.id, isActive]);

    return (
      <Accordion 
        type="single" 
        collapsible 
        className="w-full"
        value={openValue}
        onValueChange={setOpenValue}
      >
        <AccordionItem value={accordionItem.id!} className="border-none">
          <AccordionTrigger 
            className={`flex items-center space-x-3 rounded-none px-6 pr-2 py-3 transition-colors duration-200 hover:no-underline [&>svg]:w-4 [&>svg]:h-4 [&[data-state=open]]:bg-teal-700/50 ${
              isActive
                ? 'bg-teal-600 text-white border-r-4 border-teal-300'
                : 'text-teal-100 hover:bg-teal-700/80 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3 flex-1">
              <Icon className="w-5 h-5" />
              <span className='text-base font-medium'>{accordionItem.label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            {accordionItem.subItems.map((subItem) => {
              const SubIcon = subItem.icon;
              return (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-3 px-12 pr-2 py-2 transition-colors duration-200 ${
                    location.pathname === subItem.path
                      ? 'bg-teal-700 text-white border-r-4 border-teal-300'
                      : 'text-teal-100 hover:bg-teal-800/80 hover:text-white'
                  }`}
                >
                  <SubIcon className="w-4 h-4" />
                  <span className='text-sm font-medium'>{subItem.label}</span>
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
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative top-0 left-0 h-full z-50
        w-64 bg-gradient-to-b from-teal-900 to-teal-950 text-white flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header with close button */}
        <div className="p-6 border-b border-teal-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-teal-400" />
              <div>
                <h1 className="font-bold text-xl">BMS</h1>
                <p className="text-xs text-teal-300">Business Management System</p>
              </div>
            </div>
            {/* Close button - only visible on mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden p-1 text-teal-300 hover:bg-teal-800/50 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-teal-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-300 rounded-full flex items-center justify-center ring-2 ring-teal-700/50">
              <span className="font-medium text-sm text-teal-950">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm text-teal-100">{user?.name}</p>
              <p className="text-xs text-teal-300 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Company Status Indicator (Optional - you can remove this if not needed) */}
        {!hasCompany && (
          <div className="px-4 py-3 bg-amber-900/30 border-b border-teal-800/50">
            <p className="text-xs text-amber-300 flex items-center">
              <span className="mr-2">⚠️</span>
              Please add company details to access all features
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-600 scrollbar-track-teal-900 scrollbar-thumb-rounded-full">
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((item) => {
              return (
                <div key={item.path || item.id}>
                  {item.type === 'link' ? (
                    <SimpleLinkComponent to={item.path!} icon={item.icon} label={item.label} />
                  ) : (
                    <SimpleAccordionComponent accordionItem={item} />
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-6 py-4 text-teal-300 text-sm">
              No menu items available based on your permissions.
            </div>
          )}
        </nav>

        {/* Logout button */}
        {/* <div className="p-6 border-t border-teal-800/50">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-teal-100 hover:bg-teal-800/50 hover:text-white transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div> */}
      </div>
    </>
  );
}