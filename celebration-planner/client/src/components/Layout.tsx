import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  activeEventName?: string;
  onSearch?: (query: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeEventName,
  onSearch
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7FC] text-[#29213F] flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeEventName={activeEventName} 
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onSearch={onSearch}
        />
        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
