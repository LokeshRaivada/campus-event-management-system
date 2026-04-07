import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Moon, Sun, GraduationCap, User, Search, ChevronDown, LogOut, Settings, UserCircle } from 'lucide-react';
import Logo from '../assets/Lokesh.png';
import { useAuth } from '../context/AuthContext';
import './SharedNavbar.css';

const SharedNavbar = ({ role, theme, toggleTheme, toggleSidebar, sidebarOpen, userName: propUserName, notificationSlot }) => {
    const auth = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    const currentUserName = propUserName || auth?.username || auth?.user?.username || "User";
    const currentRole = role || auth?.role || "Guest";

    const getRoleBadgeClass = () => {
        switch (currentRole?.toLowerCase()) {
            case 'admin': return 'role-admin';
            case 'super_admin':
            case 'super admin': return 'role-superadmin';
            case 'student': return 'role-student';
            default: return '';
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        if (auth && auth.logout) {
            auth.logout();
        }
        setProfileOpen(false);
        navigate('/');
    };

    return (
        <header className="shared-navbar">
            <div className="navbar-left">
                <button
                    type="button"
                    className="navbar-icon-btn mobile-menu-btn"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                    aria-expanded={sidebarOpen}
                >
                    <Menu size={20} />
                </button>

                <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <div className="brand-logo">
                        <img src={Logo} alt="Logo" style={{ height: '35px', width: 'auto' }} />
                    </div>
                </div>

                <span className={`navbar-role-badge ${getRoleBadgeClass()}`}>
                    {currentRole}
                </span>
            </div>

            <div className="navbar-center">
                <div className="navbar-search">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search events, clubs..."
                        className="search-input"
                    />
                    <kbd className="search-shortcut">⌘K</kbd>
                </div>
            </div>

            <div className="navbar-right">
                <button
                    type="button"
                    className="navbar-icon-btn theme-toggle-btn"
                    onClick={toggleTheme}
                    title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    aria-label="Toggle theme"
                >
                    <div className="theme-icon-wrapper">
                        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    </div>
                </button>

                {notificationSlot ? (
                    notificationSlot
                ) : (
                    <button
                        type="button"
                        className="navbar-icon-btn notification-btn"
                        aria-label="Notifications"
                    >
                        <Bell size={18} />
                        <span className="notification-badge">0</span>
                    </button>
                )}

                <div className="navbar-profile" ref={profileRef}>
                    <button
                        type="button"
                        className={`profile-btn ${profileOpen ? 'active' : ''}`}
                        onClick={() => setProfileOpen(!profileOpen)}
                        aria-label="Profile menu"
                        aria-expanded={profileOpen}
                    >
                        <div className="profile-avatar">
                            <User size={18} />
                        </div>
                        <div className="profile-info">
                            <span className="profile-name">{currentUserName}</span>
                            <span className="profile-role">{currentRole}</span>
                        </div>
                        <ChevronDown size={16} className={`profile-chevron ${profileOpen ? 'rotate' : ''}`} />
                    </button>

                    <div className={`profile-dropdown ${profileOpen ? 'show' : ''}`}>
                        <div className="dropdown-header">
                            <div className="dropdown-avatar">
                                <User size={24} />
                            </div>
                            <div className="dropdown-user-info">
                                <span className="dropdown-name">{currentUserName}</span>
                                <span className="dropdown-email">{currentUserName.toLowerCase().replace(/\s+/g, '.')}@gmrit.edu.in</span>
                            </div>
                        </div>
                        <div className="dropdown-divider"></div>
                        <button type="button" className="dropdown-item">
                            <UserCircle size={18} />
                            <span>My Profile</span>
                        </button>
                        <div className="dropdown-divider"></div>
                        <button type="button" className="dropdown-item logout" onClick={handleLogout}>
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default SharedNavbar;
