import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Import, Play } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/fields', icon: FolderOpen, label: 'Fields' },
  { to: '/import', icon: Import, label: 'Import' },
];

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-60 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Play className="w-6 h-6 text-indigo-400" />
            <span className="text-lg font-bold tracking-tight">EssLearn</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
