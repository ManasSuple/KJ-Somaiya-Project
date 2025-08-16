import React from 'react';
import { 
  Calendar, 
  History, 
  Image, 
  Users, 
  Download, 
  UserPlus, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  Building2
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: 'faculty' | 'super';
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  onToggle, 
  activeSection, 
  onSectionChange,
  userRole 
}) => {
  const menuItems = [
    { id: 'upcoming', label: 'Upcoming Visits', icon: Calendar },
    { id: 'past', label: 'Past Visits', icon: History },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'registrations', label: 'View Registrations', icon: Users },
    { id: 'download', label: 'Download Excel', icon: Download },
  ];

  const superAdminItems = [
    { id: 'admins', label: 'Manage Admins', icon: UserPlus },
    { id: 'roles', label: 'Assign Roles', icon: Shield },
  ];

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">Admin Panel</h1>
                <p className="text-xs text-gray-400 capitalize">{userRole} Admin</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {userRole === 'super' && (
          <>
            {!isCollapsed && (
              <div className="mt-6 mb-2">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Super Admin
                </h3>
              </div>
            )}
            <div className="space-y-1">
              {superAdminItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-red-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;