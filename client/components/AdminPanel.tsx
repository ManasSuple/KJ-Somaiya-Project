import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';

const AdminPanel: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('upcoming');
  const [userRole] = useState<'faculty' | 'super'>('super'); // This would come from authentication

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={handleToggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userRole={userRole}
      />
      <ContentArea
        activeSection={activeSection}
        userRole={userRole}
      />
    </div>
  );
};

export default AdminPanel;