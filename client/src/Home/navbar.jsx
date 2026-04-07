import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/Lokesh.png';
import LoginModal from '../components/LoginModal';
import { getNotifications, markAsRead } from '../services/notificationService';
import './navbarStyles.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('theme-dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('theme-dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const toggleTheme = () => setDarkMode(!darkMode);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);

        if (isAuthenticated) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
            return () => {
                window.removeEventListener('scroll', handleScroll);
                clearInterval(interval);
            };
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isAuthenticated]);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (err) {
            console.error('Failed to mark read:', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { label: 'Home', path: '/', icon: 'fa-house' },
        { label: 'Events', path: '/events', icon: 'fa-calendar-days' },
        { label: 'Clubs', path: '/clubs', icon: 'fa-users-rectangle' },
    ];

    return (
        <>
            <nav className={`university-navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    {/* LEFT: Branding */}
                    <div className="nav-left" onClick={() => navigate('/')}>
                        <div className="navbar-logo-container">
                            <img src={Logo} alt="Logo" className="brand-logo" />
                        </div>
                    </div>

                    {/* CENTER: Navigation Links */}
                    <div className="nav-center">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="nav-right">
                        <div className="nav-icons">
                            <div className="notification-wrapper">
                                <button
                                    className="nav-icon-btn"
                                    aria-label="Notifications"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                >
                                    <i className="fa-regular fa-bell"></i>
                                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                </button>

                                {showNotifications && (
                                    <div className="notification-dropdown">
                                        <div className="dropdown-header">
                                            <h3>Notifications</h3>
                                            <button className="clear-btn" onClick={() => setShowNotifications(false)}>Close</button>
                                        </div>
                                        <div className="dropdown-content">
                                            {notifications.length === 0 ? (
                                                <p className="no-notif">No notifications yet.</p>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                                                        onClick={() => handleMarkAsRead(n.id)}
                                                    >
                                                        <p className="notif-msg">{n.message}</p>
                                                        <span className="notif-time">{new Date(n.created_at).toLocaleTimeString()}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button className="nav-icon-btn" onClick={toggleTheme} aria-label="Toggle Theme">
                                <i className={`fa-regular ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                            </button>
                        </div>

                        {isAuthenticated ? (
                            <div className="nav-profile-section">
                                <button className="dashboard-btn" onClick={() => {
                                    const redirectPath = useAuth().getRoleRedirect(useAuth().role);
                                    navigate(redirectPath);
                                }}>
                                    Dashboard
                                </button>
                                <button className="logout-minimal-btn" onClick={handleLogout} title="Logout">
                                    <i className="fa-solid fa-right-from-bracket"></i>
                                </button>
                            </div>
                        ) : (
                            <button className="login-btn" onClick={() => setLoginModalOpen(true)}>
                                Login
                            </button>
                        )}

                        {/* Mobile Toggle */}
                        <button
                            className={`hamburger-btn ${mobileMenuOpen ? 'open' : ''}`}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer */}
            <div className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>
            <div className={`mobile-drawer ${mobileMenuOpen ? 'active' : ''}`}>
                <div className="mobile-drawer-header">
                    <img src={Logo} alt="Logo" className="brand-logo" />
                </div>
                <div className="mobile-nav-links">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => {
                                navigate(item.path);
                                setMobileMenuOpen(false);
                            }}
                        >
                            <i className={`fa-solid ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <LoginModal
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
            />
        </>
    );
};

export default Navbar;
