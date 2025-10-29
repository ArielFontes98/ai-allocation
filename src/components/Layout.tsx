import { Navigation } from './Navigation';
import { Toaster, type Toast } from './Toaster';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

let toastIdCounter = 0;
let toasts: Toast[] = [];
let toastListeners: Array<(toasts: Toast[]) => void> = [];

export function addToast(message: string, type: Toast['type'] = 'info') {
  const toast: Toast = {
    id: `toast-${toastIdCounter++}`,
    message,
    type,
  };
  toasts = [...toasts, toast];
  toastListeners.forEach(listener => listener(toasts));
  
  setTimeout(() => {
    removeToast(toast.id);
  }, 5000);
}

export function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  toastListeners.forEach(listener => listener(toasts));
}

export function Layout({ children }: LayoutProps) {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts);
    };
    toastListeners.push(listener);
    setCurrentToasts(toasts);
    
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Toaster toasts={currentToasts} onRemove={removeToast} />
    </div>
  );
}

