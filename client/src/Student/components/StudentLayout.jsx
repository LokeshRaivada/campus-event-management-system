/**
 * StudentLayout — shell layout for all Student pages.
 * SharedNavbar + Sidebar + Outlet pattern (mirrors Admin/SuperAdmin).
 */
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import SharedNavbar from '../../components/SharedNavbar';
import NotificationDropdown from '../../components/NotificationDropdown';
import { useAuth } from '../../context/AuthContext';
import '../dashboard.css';

export default function StudentLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, toggleTheme } = useAuth();

    return (
        <div className="page">
            <div className="navbar-shell">
                <SharedNavbar
                    role="Student"
                    theme={theme}
                    toggleTheme={toggleTheme}
                    toggleSidebar={() => setSidebarOpen((s) => !s)}
                    sidebarOpen={sidebarOpen}
                    notificationSlot={<NotificationDropdown />}
                />
            </div>

            <div className="dashboard-layout">
                <StudentSidebar
                    isOpen={sidebarOpen}
                    closeSidebar={() => setSidebarOpen(false)}
                />

                <div
                    className={`backdrop ${sidebarOpen ? 'visible' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                />

                <main className="dashboard-main">
                    <Outlet context={{ theme }} />
                </main>
            </div>
        </div>
    );
}
