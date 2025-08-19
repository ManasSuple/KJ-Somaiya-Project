import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  History, 
  Image, 
  Users, 
  UserPlus, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  Building2,
  LogOut
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const menuItems = [
    { id: 'upcoming', label: 'Upcoming Visits', icon: Calendar },
    { id: 'past', label: 'Past Visits', icon: History },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'registrations', label: 'View Registrations', icon: Users },
  ];

  const superAdminItems = [
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
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white">
                <img
                  src="/kj-somaiya-logo.svg"
                  alt="KJ Somaiya"
                  className="w-full h-full object-contain p-1"
                />
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

      {/* Footer: current user + logout */}
      <div className="p-3 border-t border-gray-800">
        {!isCollapsed && (
          <div className="mb-2">
            <p className="text-xs text-gray-400">Signed in as</p>
            <p className="text-sm truncate" title={user?.email || ''}>{user?.email || '—'}</p>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate('/admin/login', { replace: true }); }}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-3 py-2.5 rounded-lg transition-colors text-gray-300 hover:bg-gray-800 hover:text-white`}
          title={isCollapsed ? 'Log out' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Log out</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;