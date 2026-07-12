import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { THEMES } from '../../constants/themes';
import { ROUTES } from '../../constants/routes';
import { 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  LogOut, 
  User, 
  Settings, 
  Menu 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate(ROUTES.LOGIN);
  };

  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Admin User", "email": "admin@assetflow.com"}');

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-4 py-2 sticky top-0 z-30">
      {/* Mobile drawer toggle */}
      <div className="flex-none lg:hidden mr-2">
        <label htmlFor="sidebar-drawer" className="btn btn-ghost btn-circle drawer-button">
          <Menu size={20} />
        </label>
      </div>

      {/* Brand logo (visible on mobile only, as sidebar handles desktop branding) */}
      <div className="flex-1 lg:flex-none lg:hidden">
        <Link to={ROUTES.DASHBOARD} className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold shadow shadow-primary/20">A</div>
          <span className="text-lg font-bold tracking-tight text-base-content">
            Asset<span className="text-primary font-extrabold">Flow</span>
          </span>
        </Link>
      </div>

      {/* Search Input (UI Only) - Desktop */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full flex items-center">
          <div className="absolute left-3 text-base-content/40 flex items-center justify-center">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search assets, bookings, or departments..."
            className="input input-sm input-bordered w-full pl-9 bg-base-200/50 focus:bg-base-100 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary border-base-300 rounded-lg transition-all"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex-none gap-3 ml-auto">
        {/* Mobile Search Button (UI Only) */}
        <button className="btn btn-ghost btn-circle btn-sm md:hidden">
          <Search size={18} />
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-base-content"
          title={theme === THEMES.LIGHT ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === THEMES.LIGHT ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Static Notification Icon */}
        <div className="relative">
          <button className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-base-content">
            <Bell size={18} />
            <span className="badge badge-error badge-xs absolute top-1 right-1 text-white border-none py-0 px-1 font-bold text-[9px] scale-90">
              3
            </span>
          </button>
        </div>

        <div className="divider divider-horizontal mx-1 py-3"></div>

        {/* User Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar online">
            <div className="w-9 h-9 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="User Profile" 
              />
            </div>
          </label>
          <ul tabIndex={0} className="menu dropdown-content mt-3 z-40 p-2 shadow-xl border border-base-300 bg-base-100 rounded-xl w-56 space-y-1">
            <div className="px-3 py-2 border-b border-base-300">
              <p className="font-semibold text-sm text-base-content">{user.name}</p>
              <p className="text-xs text-base-content/50 truncate mt-0.5">{user.email}</p>
            </div>
            <li>
              <Link to={ROUTES.PROFILE} className="flex items-center gap-2 py-2 text-sm text-base-content/85 hover:text-base-content">
                <User size={15} />
                My Profile
              </Link>
            </li>
            <li>
              <Link to={ROUTES.SETTINGS} className="flex items-center gap-2 py-2 text-sm text-base-content/85 hover:text-base-content">
                <Settings size={15} />
                System Settings
              </Link>
            </li>
            <li>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 py-2 text-sm text-error hover:bg-error/10 hover:text-error"
              >
                <LogOut size={15} />
                Log Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
