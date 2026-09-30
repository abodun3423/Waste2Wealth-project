import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import AccessPortal from './pages/AccessPortal';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import CompanyRegister from './pages/CompanyRegister';
import CompanyLogin from './pages/CompanyLogin';
import Marketplace from './pages/Marketplace';
import Rewards from './pages/Rewards';
import RecyclingCompanies from './pages/RecyclingCompanies';
import MyPickups from './pages/MyPickups';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminLogin from './pages/AdminLogin';
import AdminCompanies from './pages/AdminCompanies';
import AdminPickups from './pages/AdminPickups';
import AdminRedemptions from './pages/AdminRedemptions';
import AdminAnalytics from './pages/AdminAnalytics';

import './App.css';

function ProtectedLayout({ children }) {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <header className="topbar">
          <h3>Waste2Wealth</h3>

          <div className="topbar-user">
            {user ? `Welcome, ${user.name}` : 'Welcome'}
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AccessPortal />} />
         <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

        <Route
          path="/company/login"
          element={<CompanyLogin />}
        />  

        <Route
          path="/company/register"
          element={<CompanyRegister />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Marketplace />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/rewards"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Rewards />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/companies"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <RecyclingCompanies />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-pickups"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <MyPickups />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUsers />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/companies"
          element={
            <AdminProtectedRoute>
              <AdminCompanies />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/pickups"
          element={
            <AdminProtectedRoute>
              <AdminPickups />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/redemptions"
          element={
            <AdminProtectedRoute>
             <AdminRedemptions />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <AdminProtectedRoute>
             <AdminAnalytics />
            </AdminProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
