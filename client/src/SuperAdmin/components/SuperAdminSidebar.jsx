/**
 * SuperAdminSidebar — NavLink-based sidebar for SuperAdmin module.
 * Mirrors AdminSidebar pattern with lucide-react icons.
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserCog, Users, CalendarDays, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
    { path: '/superadmin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { path: '/superadmin/manage-admins', label: 'Manage Admins', icon: UserCog },
    { path: '/superadmin/manage-students', label: 'Manage Students', icon: Users },
    { path: '/superadmin/manage-events', label: 'Manage Events', icon: CalendarDays },
    { path: '/superadmin/manage-clubs', label: 'Manage Clubs', icon: Users },
    { path: '/superadmin/analytics', label: 'Analytics', icon: BarChart3 },
];


export default function SuperAdminSidebar({ isOpen, closeSidebar }) {
    const { logout } = useAuth();

    return (
        <aside className={`sa-sidebar ${isOpen ? 'open' : ''}`}>
            <nav>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) => `sa-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => window.innerWidth < 900 && closeSidebar()}
                        >
                            <Icon size={18} />
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>

            <div style={{ marginTop: 'auto' }}>
                <button className="sa-nav-link" type="button" onClick={logout}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
