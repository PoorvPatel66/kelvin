import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Skeleton from '../components/common/Skeleton.jsx';

function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const { admin, isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <main className="section">
        <div className="container-xl">
          <Skeleton rows={4} />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && admin && !allowedRoles.includes(admin.role)) {
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
}

export default ProtectedRoute;
