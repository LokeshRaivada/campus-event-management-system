/**
 * SuperAdminLayout — shell layout for all SuperAdmin pages.
 * Mirrors Admin's Layout.jsx: SharedNavbar + Sidebar + Outlet
 */
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from './SuperAdminSidebar';
import SharedNavbar from '../../components/SharedNavbar';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../../context/AuthContext';
import '../SuperAdmindashboard.css';

export default function SuperAdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, toggleTheme } = useAuth();

    return (
        <div className="sa-page">
            <SharedNavbar
                role="Super Admin"
                theme={theme}
                toggleTheme={toggleTheme}
                toggleSidebar={() => setSidebarOpen((s) => !s)}
                sidebarOpen={sidebarOpen}
                notificationSlot={<NotificationDropdown />}
            />

            <div className="sa-dashboard-layout">
                <SuperAdminSidebar
                    isOpen={sidebarOpen}
                    closeSidebar={() => setSidebarOpen(false)}
                />

                <div
                    className={`sa-backdrop ${sidebarOpen ? 'visible' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                />

                <main className="sa-dashboard-main">
                    <Outlet context={{ theme }} />
                </main>
            </div>
        </div>
    );
}
