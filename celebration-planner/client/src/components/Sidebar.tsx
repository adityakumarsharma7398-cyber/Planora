import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  DollarSign, 
  CheckSquare, 
  Store, 
  Bot, 
  Settings,
  Sparkles,
  Crown
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  activeEventId?: string;
  activeEventName?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeEventId, 
  isMobileOpen = false,
  onCloseMobile 
}) => {
  const params = useParams();
  const currentEventId = activeEventId || params.id || '11111111-1111-1111-1111-111111111111';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: `/events/${currentEventId}`, label: 'My Events', icon: Calendar },
    { to: `/events/${currentEventId}/budget`, label: 'Budget', icon: DollarSign },
    { to: `/events/${currentEventId}/tasks`, label: 'Timeline & Tasks', icon: CheckSquare },
    { to: `/events/${currentEventId}/vendors`, label: 'Vendors', icon: Store },
    { to: `/events/${currentEventId}/assistant`, label: 'AI Assistant', icon: Bot },
    { to: '#settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-[#E8DFF5] 
        flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full justify-between p-5">
          <div>
            {/* Brand Logo matching reference */}
            <div className="pt-2 pb-6 px-2 border-b border-[#F3EBFB]">
              <BrandLogo size="md" />
            </div>

            {/* Navigation Menu */}
            <nav className="mt-6 space-y-1.5" aria-label="Main Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isAnchor = item.to.startsWith('#');

                if (isAnchor) {
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        alert('Settings & Preferences: API integrations, currency preference (INR/USD), and profile settings.');
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className="w-full flex items-center space-x-3.5 px-4 py-2.5 rounded-asym text-sm font-semibold text-[#71677F] hover:text-[#7C4DCE] hover:bg-[#F9F5FD] transition-all cursor-pointer text-left"
                    >
                      <Icon className="h-4 w-4 text-[#71677F]" />
                      <span>{item.label}</span>
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard' || item.to === `/events/${currentEventId}`}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center space-x-3.5 px-4 py-2.5 rounded-asym text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-[#F3EBFB] text-[#7C4DCE] font-bold shadow-soft'
                          : 'text-[#71677F] hover:text-[#7C4DCE] hover:bg-[#F9F5FD]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`h-4 w-4 ${isActive ? 'text-[#7C4DCE]' : 'text-[#71677F]'}`} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Upgrade to Pro Card matching reference */}
          <div className="pt-4">
            <div className="p-4 rounded-asym bg-gradient-to-r from-[#F9F5FD] to-[#F5D9EF] border border-[#E8DFF5] shadow-soft relative overflow-hidden group">
              <div className="flex items-center space-x-2.5 mb-1.5">
                <div className="h-7 w-7 rounded-asym-sm bg-[#7C4DCE] text-white flex items-center justify-center shadow-xs">
                  <Crown className="h-4 w-4" />
                </div>
                <div className="text-xs font-extrabold text-[#29213F]">Upgrade to Pro</div>
              </div>
              <p className="text-[11px] text-[#71677F] leading-tight">
                Get advanced AI insights & unlimited events
              </p>
              <button
                onClick={() => alert('Planora Pro Plan: Unlimited AI replanning, vendor quotation negotiation assistance, and multi-user collaboration.')}
                className="mt-3 w-full py-1.5 px-3 rounded-asym-sm bg-[#7C4DCE] hover:bg-[#6035C4] text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                <span>Explore Pro</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
