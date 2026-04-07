/**
 * StudentSidebar — NavLink-based sidebar for Student module.
 * Uses lucide-react icons matching the project convention.
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarSearch, ClipboardList, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/events', label: 'Browse Events', icon: CalendarSearch },
    { path: '/student/my-events', label: 'My Events', icon: ClipboardList },

];

export default function StudentSidebar({ isOpen, closeSidebar }) {
    const { logout } = useAuth();

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <nav>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => (isActive ? 'active' : '')}
                            onClick={() => window.innerWidth < 900 && closeSidebar()}
                        >
                            <Icon size={18} />
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>

            <div style={{ marginTop: 'auto' }}>
                <button className="sidebar-logout" type="button" onClick={logout} style={{
                    background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    gap: '10px', padding: '10px 16px', color: 'var(--muted, #64748b)', fontSize: '14px', width: '100%',
                    borderRadius: '8px', transition: 'all 0.2s', fontFamily: 'inherit'
                }}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
