import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards routes by authentication and role.
 * - Unauthenticated users → redirected to home (/)
 * - Authenticated users with wrong role → redirected to their own dashboard
 */
export default function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, role, getRoleRedirect } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect to the user's own dashboard instead of home
        return <Navigate to={getRoleRedirect(role)} replace />;
    }

    return children;
}
