import { Link } from 'react-router-dom';
import { Briefcase, FileText, Users, CheckCircle2 } from 'lucide-react';
import { useStore } from '../state/store';

export function Navigation() {
  const currentScreen = useStore((state) => state.currentScreen);
  
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

