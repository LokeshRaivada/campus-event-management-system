/**
 * StudentRoutes — nested route definitions for the Student module.
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentLayout from './components/StudentLayout';
import StudentDashboardPage from './pages/StudentDashboardPage';
import StudentEvents from './pages/StudentEvents';
import StudentEventDetails from './pages/StudentEventDetails';
import StudentMyEvents from './pages/StudentMyEvents';
import StudentEntryPass from './pages/StudentEntryPass';


export default function StudentRoutes() {
    return (
        <Routes>
            <Route path="/" element={<StudentLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboardPage />} />
                <Route path="events" element={<StudentEvents />} />
                <Route path="events/:id" element={<StudentEventDetails />} />
                <Route path="my-events" element={<StudentMyEvents />} />
                <Route path="my-events/:eventId/pass" element={<StudentEntryPass />} />

                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
}
