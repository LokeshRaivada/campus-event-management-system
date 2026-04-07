import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminRoutes from './SuperAdmin/SuperAdminRoutes';
import StudentRoutes from './Student/StudentRoutes';
import AdminRoutes from './Admin/AdminRoutes';
import Main from './Home/main';
import Navbar from './Home/navbar';
import DomeGallery from './Home/globe/DomeGallery';
import Events from './Events/components/Events';
import EventDetails from './Events/components/EventDetails';
import Clubs from './Home/Bodies/clubs';
import ClubsPage from './clubs/src/ClubsPage';
import ClubDetails from './clubs/src/ClubDetails';
import './Home/HomePage.css';

function Home() {
  return (
    <>
      <Navbar />
      <div className="home-page">
        <Main />
        <DomeGallery />
        <Clubs />
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/clubs/:id" element={<ClubDetails />} />

          {/* Admin routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminRoutes />
            </ProtectedRoute>
          } />

          {/* Student routes (nested under StudentLayout) */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentRoutes />
            </ProtectedRoute>
          } />

          {/* SuperAdmin routes (nested under SuperAdminLayout) */}
          <Route path="/superadmin/*" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminRoutes />
            </ProtectedRoute>
          } />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
