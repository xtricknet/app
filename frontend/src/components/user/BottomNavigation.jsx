import React from 'react';
import { Home, FileSpreadsheet, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { icon: Home, label: 'Home', path: '/user' },
    { icon: FileSpreadsheet, label: 'Transaction', path: '/transactions' },
    { icon: User, label: 'My', path: '/profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
      <div className="flex justify-between max-w-md mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <div
              key={item.label}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => navigate(item.path)}
            >
              <Icon 
                className={`w-6 h-6 ${
                  active ? 'text-gray-900' : 'text-gray-400'
                }`}
              />
              <span 
                className={`text-sm ${
                  active ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;