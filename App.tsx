import React, { useMemo, lazy, Suspense } from 'react';
import { Role } from './types';
import { useAuth } from './contexts/AuthContext';
import LoginScreen from './pages/auth/LoginScreen';

// Lazy load dashboard components
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const LeadDashboard = lazy(() => import('./pages/lead/LeadDashboard'));
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const CisoDashboard = lazy(() => import('./pages/ciso/CisoDashboard'));

const App: React.FC = () => {
  const { 
    session, 
    currentUser, 
    loading, 
    organization, 
    theme, 
    toggleTheme, 
    logout 
  } = useAuth();

  const Dashboard = useMemo(() => {
    if (!currentUser) return null;

    const props: any = { 
      currentUser, 
      organization, 
      onLogout: logout, 
      theme, 
      toggleTheme 
    };

    switch (currentUser.role) {
      case Role.ADMIN:
        return <AdminDashboard {...props} />;
      case Role.CISO:
        return <CisoDashboard {...props} />;
      case Role.LEAD:
        return <LeadDashboard {...props} />;
      case Role.USER:
        return <UserDashboard {...props} />;
      default:
        return <div>Invalid user role.</div>;
    }
  }, [currentUser, organization, theme, toggleTheme, logout]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <span className="loading loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content antialiased">
        {currentUser && session ? (
             <Suspense fallback={
               <div className="flex items-center justify-center min-h-screen bg-base-100">
                 <span className="loading loading-lg"></span>
               </div>
             }>
                {Dashboard}
             </Suspense>
        ) : (
            <LoginScreen />
        )}
    </div>
  );
};

export default App;