import { Navigate } from 'react-router-dom';

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
