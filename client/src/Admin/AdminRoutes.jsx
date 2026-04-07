import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/index.css';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ManageEvents from './pages/ManageEvents';
import CreateEvent from './pages/CreateEvent';
import Registrations from './pages/Registrations';
import AdminCheckIn from './pages/AdminCheckIn';

function AdminRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<ManageEvents />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="edit-event/:id" element={<CreateEvent />} />
          <Route path="registrations" element={<Registrations />} />
          <Route path="check-in" element={<AdminCheckIn />} />
          <Route path="users" element={<div>Users</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </div>
  )
}

export default AdminRoutes;
