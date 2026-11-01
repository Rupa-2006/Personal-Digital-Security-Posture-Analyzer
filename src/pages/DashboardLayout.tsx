import { Outlet, Navigate } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useSecurityStore } from '@/lib/store';

export default function DashboardLayout() {
  const isLoggedIn = useSecurityStore((s) => s.isLoggedIn);

  if (!isLoggedIn) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen bg-background cyber-grid">
      <DashboardSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
