import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleMobileSidebar,
  onSearch 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) onSearch(val);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-[#E8DFF5] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30">
      {/* Mobile Menu Button & Search Bar */}
      <div className="flex items-center space-x-4 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-asym-sm text-[#71677F] hover:text-[#7C4DCE] hover:bg-[#F3EBFB] transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search bar matching reference */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="h-4 w-4 text-[#71677F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search events, tasks, vendors..."
            className="w-full pl-10 pr-4 py-2 bg-[#FAF7FC] border border-[#E8DFF5] rounded-asym text-xs md:text-sm text-[#29213F] placeholder-[#71677F]/70 focus:outline-none focus:border-[#A477E8] focus:bg-white transition-all"
          />
        </form>
      </div>

      {/* Right Actions: Notifications, Avatar, New Event CTA */}
      <div className="flex items-center space-x-4 md:space-x-5 ml-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-asym-sm text-[#71677F] hover:text-[#7C4DCE] hover:bg-[#F3EBFB] transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#E8A0D4] ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E8DFF5] rounded-asym shadow-soft-lg p-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#F3EBFB]">
                <span className="text-xs font-bold text-[#29213F]">Recent Notifications</span>
                <span className="text-[10px] text-[#7C4DCE] font-semibold cursor-pointer">Mark read</span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-asym-sm bg-[#F9F5FD] border border-[#E8DFF5]/60">
                  <div className="font-bold text-[#29213F]">Royal Caterers Quote Received</div>
                  <div className="text-[11px] text-[#71677F] mt-0.5">Updated per-person price for Aarav's Birthday.</div>
                </div>
                <div className="p-2 rounded-asym-sm bg-[#FAF7FC]">
                  <div className="font-bold text-[#29213F]">Task Due Today</div>
                  <div className="text-[11px] text-[#71677F] mt-0.5">Confirm venue booking with The Grand Terrace.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar matching reference (Alex Rivera) */}
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-[#E8A0D4] shadow-xs flex-shrink-0">
            <img 
              src="/images/user-alex.jpg" 
              alt="Alex Rivera"
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback to stylized initials if image fails
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Prominent New Event Action matching reference */}
        <Link
          to="/events/new"
          className="inline-flex items-center space-x-1.5 px-4 md:px-5 py-2.5 rounded-asym bg-gradient-to-r from-[#7C4DCE] to-[#6035C4] hover:from-[#6035C4] hover:to-[#7C4DCE] text-white text-xs md:text-sm font-bold shadow-soft hover:shadow-soft-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Event</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
