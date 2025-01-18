import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Briefcase, 
  Users as CustomersIcon, 
  Calendar as CalendarIcon, 
  Receipt,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Mitarbeiter', href: '/employees', icon: Users },
    { name: 'Aufträge', href: '/projects', icon: Briefcase },
    { name: 'Kunden', href: '/customers', icon: CustomersIcon },
    { name: 'Kalender', href: '/calendar', icon: CalendarIcon },
    { name: 'Rechnungen', href: '/invoicing', icon: Receipt },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-blue-900 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:min-h-screen
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 bg-blue-800">
            <h1 className="text-xl font-bold text-white">Handwerk Manager</h1>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-2 text-sm font-medium rounded-md
                    ${isActive(item.href)
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-100 hover:bg-blue-800'}
                  `}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;