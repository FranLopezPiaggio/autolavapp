
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Layout from './components/Layout';
import DashboardHome from './pages/DashboardHome';
import NewBooking from './pages/NewBooking';
import Reservas from './pages/Reservas';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Layout><DashboardHome /></Layout>} />
            <Route path="/dashboard/reservas" element={<Layout><Reservas /></Layout>} />
            <Route path="/dashboard/nueva-reserva" element={<Layout><NewBooking /></Layout>} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}