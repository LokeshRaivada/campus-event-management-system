import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./AdminSidebar";
import SharedNavbar from "../../components/SharedNavbar";
import NotificationDropdown from "../../components/NotificationDropdown";
import { useAuth } from "../../context/AuthContext";
import "../styles/AdminTheme.css";

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, toggleTheme } = useAuth();

    return (
        <div className="sa-page">
            <SharedNavbar
                role="Admin"
                toggleSidebar={() => setSidebarOpen((prev) => !prev)}
                sidebarOpen={sidebarOpen}
                theme={theme}
                toggleTheme={toggleTheme}
                notificationSlot={<NotificationDropdown />}
            />

            <div className="sa-dashboard-layout">
                <Sidebar
                    isOpen={sidebarOpen}
                    closeSidebar={() => setSidebarOpen(false)}
                />

                <div className={`sa-backdrop ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebarOpen(false)}></div>

                <main className="sa-dashboard-main">
                    <Outlet context={{ theme }} />
                </main>
            </div>
        </div>
    );
};

export default Layout;
