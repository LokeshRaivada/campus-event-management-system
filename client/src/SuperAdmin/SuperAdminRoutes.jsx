/**
 * SuperAdminRoutes — nested route definitions for the SuperAdmin module.
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminLayout from './components/SuperAdminLayout';
import SuperAdminDashboard from './pages/SADashboard';
import ManageAdmins from './pages/ManageAdmins';
import ManageStudents from './pages/ManageStudents';
import SAManageEvents from './pages/SAManageEvents';
import Analytics from './pages/Analytics';
import ManageClubs from './pages/ManageClubs';


export default function SuperAdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<SuperAdminLayout />}>
                <Route index element={<SuperAdminDashboard />} />
                <Route path="manage-admins" element={<ManageAdmins />} />
                <Route path="manage admins" element={<Navigate to="/superadmin/manage-admins" replace />} />

                <Route path="manage-students" element={<ManageStudents />} />
                <Route path="manage students" element={<Navigate to="/superadmin/manage-students" replace />} />

                <Route path="manage-events" element={<SAManageEvents />} />
                <Route path="manage events" element={<Navigate to="/superadmin/manage-events" replace />} />

                <Route path="manage-clubs" element={<ManageClubs />} />
                <Route path="analytics" element={<Analytics />} />

                <Route path="*" element={<Navigate to="/superadmin" replace />} />
            </Route>
        </Routes>
    );
}
