import React, { useState } from 'react';
import { Bell, Menu, Search, Sun, Moon, X, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { useAuthStore } from '../../../store/authStore';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const notifications = [
    { id: 1, title: 'New order from customer', time: '5 min ago', unread: true },
    { id: 2, title: 'Low stock alert for Product A', time: '10 min ago', unread: true },
    { id: 3, title: 'Payment received', time: '1 hour ago', unread: false },
    { id: 4, title: 'Sync completed with Tally', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="md:hidden p-1.5"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </Button>
          
          {/* Search for desktop/tablet */}
          <div className="hidden sm:block relative w-32 md:w-56">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="sm:hidden p-1.5"
            aria-label="Search"
          >
            {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDark(!isDark)}
            className="hidden xs:inline-flex p-1.5"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="sm" className="relative p-1.5" aria-label="Notifications">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 w-3 h-3 p-0 flex items-center justify-center text-[10px] bg-red-500">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 max-w-[90vw]">
              <DropdownMenuLabel className="py-2 text-sm">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="p-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${notification.unread ? 'font-medium' : ''}`}>
                        {notification.title}
                      </p>
                      {notification.unread && (
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full ml-1.5" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">{notification.time}</p>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center py-1.5">
                <span className="text-xs text-blue-600">View all notifications</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* System status - hidden on very small screens */}
          <div className="hidden xs:flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">System Online</span>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="border-none outline-none">
              <Button variant="ghost" className="p-0" aria-label="Profile">
                <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-teal-300 rounded-full flex items-center justify-center ring-1 ring-teal-700/50">
                  <span className="font-medium text-xs text-teal-950">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="p-3 border-b border-teal-800/50">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-300 rounded-full flex items-center justify-center ring-1 ring-teal-700/50">
                    <span className="font-medium text-xs text-teal-950">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 focus:bg-red-50 py-1.5">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                <span className="text-sm">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search panel */}
      {isSearchOpen && (
        <div className="sm:hidden mt-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-8 h-8 w-full text-sm"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}