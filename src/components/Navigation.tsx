import { Link, useLocation } from 'react-router-dom';
import { Briefcase, FileText, Users, CheckCircle2 } from 'lucide-react';
import { useStore } from '../state/store';
import { useEffect } from 'react';

export function Navigation() {
  const location = useLocation();
  const currentScreen = useStore((state) => state.currentScreen);
  const setCurrentScreen = useStore((state) => state.setCurrentScreen);
  
  // Update current screen based on URL
  useEffect(() => {
    const pathToScreen: Record<string, 'confirm-roles' | 'role-intake' | 'ta-review' | 'manager-approvals'> = {
      '/': 'confirm-roles',
      '/intake': 'role-intake',
      '/review': 'ta-review',
      '/approvals': 'manager-approvals',
    };
    const screen = pathToScreen[location.pathname];
    if (screen) {
      setCurrentScreen(screen);
    }
  }, [location.pathname, setCurrentScreen]);
  
  const navItems = [
    { id: 'confirm-roles' as const, label: 'Confirm Roles', icon: CheckCircle2, path: '/' },
    { id: 'role-intake' as const, label: 'Role Intake', icon: FileText, path: '/intake' },
    { id: 'ta-review' as const, label: 'TA Review', icon: Users, path: '/review' },
    { id: 'manager-approvals' as const, label: 'Approvals', icon: Briefcase, path: '/approvals' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Allocation</h1>
              <p className="text-xs text-gray-500">Lean Hiring Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => useStore.getState().setCurrentScreen(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-lg active:bg-white active:text-primary active:border active:border-primary'
                      : 'text-gray-700 hover:bg-gray-100 font-medium'
                  }`}
                  style={isActive ? { fontWeight: 700 } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span style={{ fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

