/**
 * StudentDashboardPage — Dashboard content extracted from StudentDashboard.jsx.
 * Now rendered inside StudentLayout (no Navbar/Sidebar here).
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllEvents, getEventStats } from '../../services/eventService';
import { getMyStats, getMyRegistrations } from '../../services/registrationService';
import { getNotifications, getUnreadCount } from '../../services/notificationService';
import { subscribeToEvents, subscribeToNotifications } from '../../services/socketService';
import { API_BASE_URL } from '../../config';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export default function StudentDashboardPage() {
    const auth = useAuth();
    const currentUserName = auth.username || auth.name || auth.user?.username || auth.user?.name || "Student";
    const [stats, setStats] = useState({
        registered: 0,
        upcoming: 0,
        completed: 0,
        unreadNotifs: 0
    });
    const [recentEvents, setRecentEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [allEvents, notifs, regStats, regList] = await Promise.all([
                    getAllEvents(),
                    getNotifications(),
                    getMyStats(),
                    getMyRegistrations()
                ]);

                setRegistrations(regList.slice(0, 5));

                const approved = allEvents
                    .filter(e => e.status === 'APPROVED')
                    .sort((a, b) => b.id - a.id)
                    .slice(0, 3);

                setRecentEvents(approved);

                setStats({
                    registered: regStats.registered,
                    upcoming: regStats.upcoming,
                    completed: regStats.completed,
                    unreadNotifs: getUnreadCount(notifs)
                });
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();

        // Real-time Sync
        const unsubEvents = subscribeToEvents(() => loadData());
        const unsubNotifs = subscribeToNotifications(() => loadData());
        
        const interval = setInterval(loadData, 30000);
        
        return () => {
            if (typeof unsubEvents === 'function') unsubEvents();
            if (typeof unsubNotifs === 'function') unsubNotifs();
            clearInterval(interval);
        };
    }, []);

    const statCards = [
        { id: 1, title: 'Registered Events', value: stats.registered, subtitle: 'This semester', tone: 'primary', iconClass: 'fa-solid fa-clipboard-list' },
        { id: 2, title: 'Upcoming Events', value: stats.upcoming, subtitle: 'Next 7 days', tone: 'info', iconClass: 'fa-regular fa-calendar-check' },
        { id: 3, title: 'Completed', value: stats.completed, subtitle: 'Events attended', tone: 'success', iconClass: 'fa-solid fa-circle-check' },
        { id: 4, title: 'Notifications', value: stats.unreadNotifs, subtitle: 'Unread', tone: 'warning', iconClass: 'fa-regular fa-bell' },
    ];

    const quickLinks = [
        { id: 1, label: 'Browse Events', to: '/student/events', description: 'Discover all active events' },
        { id: 2, label: 'My Registrations', to: '/student/my-events', description: 'Manage your seats' },
        { id: 3, label: 'My Profile', to: '/student/profile', description: 'View & edit profile' },
    ];

    if (loading) {
        return (
            <div className="sa-loading-container" style={{ padding: '20px' }}>
                <LoadingSkeleton variant="card" count={3} />
            </div>
        );
    }
    return (
        <>
            {/* Welcome Card */}
            <section className="welcome-card glass animate-rise hover-gradient-border">
                <div>
                    <p className="eyebrow">GMRIT Events • Student Dashboard</p>
                    <h2>Welcome back, {currentUserName}! 👋</h2>
                    <p className="muted">You have {stats.upcoming} upcoming events this week. Don't miss out!</p>
                    <div className="hero-actions">
                        <Link to="/student/events" className="primary-btn elevated">Explore Events</Link>
                    </div>
                </div>
                <div className="hero-badge">
                    <div className="badge-number animate-pulse-soft">{stats.upcoming}</div>
                    <div>
                        <p className="badge-label">My Upcoming</p>
                        <p className="badge-text">Registered</p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="stats-grid">
                {statCards.map((card, idx) => (
                    <div key={card.id} className={`stat-card ${card.tone} animate-stagger hover-gradient-border`} style={{ animationDelay: `${idx * 80}ms` }}>
                        <div className="stat-icon">
                            <i className={card.iconClass} aria-hidden="true" />
                        </div>
                        <div>
                            <p className="stat-title">{card.title}</p>
                            <h3 className="stat-value">{card.value}</h3>
                            <p className="stat-subtitle">{card.subtitle}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Content grid */}
            <section className="content-grid">
                <div className="card glass animate-fade hover-gradient-border">
                    <div className="card-header">
                        <h3>Recently Added Events</h3>
                        <Link to="/student/events" className="text-link">View all →</Link>
                    </div>
                    <div className="event-list">
                        {recentEvents.length === 0 ? (
                            <p className="muted" style={{ padding: '20px', textAlign: 'center' }}>No recent events found.</p>
                        ) : (
                            recentEvents.map((ev, idx) => (
                                <div key={ev.id} className="event-item hover-card animate-stagger hover-gradient-border" style={{ animationDelay: `${idx * 90}ms`, display: 'flex', gap: '16px', padding: '12px' }}>
                                    {ev.poster_url && (
                                        <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                            <img src={`${API_BASE_URL}${ev.poster_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div className="event-top" style={{ marginBottom: '4px' }}>
                                            <span className="tag primary" style={{ fontSize: '10px', padding: '2px 8px' }}>{ev.category}</span>
                                            <span className="event-time" style={{ fontSize: '11px' }}>{new Date(ev.date).toLocaleDateString()}</span>
                                        </div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{ev.title}</h4>
                                        <p className="muted" style={{ fontSize: '12px', margin: 0 }}>{ev.description?.substring(0, 80)}...</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="card glass animate-fade hover-gradient-border" style={{ animationDelay: '140ms' }}>
                    <div className="card-header">
                        <h3>Quick Actions</h3>
                        <span className="pill pill-primary">Updated</span>
                    </div>
                    <div className="quick-links">
                        {quickLinks.map((link) => (
                            <Link key={link.id} to={link.to} className="quick-link hover-card hover-gradient-border">
                                <div>
                                    <p className="quick-link-title">{link.label}</p>
                                    <p className="quick-link-desc muted">{link.description}</p>
                                </div>
                                <span className="quick-link-arrow">→</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Registrations table */}
            <section className="card glass animate-fade hover-gradient-border" style={{ animationDelay: '180ms' }}>
                <div className="card-header">
                    <h3>My Registrations</h3>
                    <Link to="/student/my-events" className="text-link">View all →</Link>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th className="hide-sm">Registered On</th>
                                <th>Status</th>
                                <th className="ta-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrations.map((reg, idx) => (
                                <tr key={reg.id} className="hover-row animate-stagger" style={{ animationDelay: `${idx * 70}ms` }}>
                                    <td style={{ fontWeight: '600' }}>{reg.eventTitle}</td>
                                    <td className="hide-sm muted" style={{ fontSize: '13px' }}>{reg.registered_at ? new Date(reg.registered_at).toLocaleDateString() : 'Recently'}</td>
                                    <td>
                                        <span className={`status-badge ${(reg.attendance_status === 'CHECKED_IN' || reg.status === 'COMPLETED') ? 'success' : (reg.status === 'REGISTERED' ? 'primary' : 'neutral')}`}>
                                            {reg.attendance_status === 'CHECKED_IN' ? 'CHECKED IN' : (reg.status || 'REGISTERED')}
                                        </span>
                                    </td>
                                    <td className="ta-right">
                                        <Link to={`/student/my-events/${reg.event_id}/pass`} className="text-link" style={{ fontSize: '12px', fontWeight: '700' }}>
                                            View Pass →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}
