/**
 * SADashboard — SuperAdmin Dashboard page.
 * Now fully dynamic, fetching data from the real MySQL backend.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as adminService from '../../services/adminService';
import * as eventService from '../../services/eventService';
import * as clubService from '../../services/clubService';
import { API_BASE_URL } from '../../config';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { useToast } from '../../components/ui/Toast';
import { subscribeToEvents } from '../../services/socketService';

export default function SADashboard() {
    const auth = useAuth();
    const currentUserName = auth.username || auth.name || auth.user?.username || auth.user?.name || "Admin";
    const [analytics, setAnalytics] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [pendingEvents, setPendingEvents] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const loadInitial = async () => {
            setLoading(true);
            await loadDashboardData();
            setLoading(false);
        };
        loadInitial();

        // Real-time Dashboard Updates
        subscribeToEvents((data, type) => {
            console.log(`📡 Dashboard sync: Event ${type}`, data);
            loadDashboardData(); // Refresh all stats/lists
            if (type === 'CREATED') {
                addToast(`New Event Request: ${data.title}`, 'info');
            }
        });

        // Backup polling (less frequent)
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            const [
                analyticsData,
                adminsData,
                clubsData,
                pendingData,
                recentEventsData
            ] = await Promise.all([
                adminService.getAnalytics(),
                adminService.getAllAdmins(),
                clubService.getAllClubs(),
                eventService.getPendingEvents(),
                eventService.getRecentEvents()
            ]);

            setAnalytics(analyticsData);
            setAdmins(adminsData.slice(0, 3));
            setClubs(clubsData.slice(0, 5));
            setRecentEvents(recentEventsData);
            setPendingEvents(pendingData);
        } catch (err) {
            console.error('[SADashboard] Error loading dashboard:', err);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        if (window.confirm(`${newStatus} this event?`)) {
            try {
                const res = await eventService.updateEventStatus(id, newStatus);
                if (res && (res.success || res.id)) {
                    addToast(`Event ${newStatus}ed`, 'success');
                    // Data will refresh via the subscription
                } else {
                    addToast('Failed to update event', 'error');
                }
            } catch (err) {
                addToast('Failed to update status', 'error');
            }
        }
    };

    const statCards = [
        { id: 1, title: 'Total Clubs', value: analytics?.totalClubs || clubs.length, subtitle: 'Across categories', tone: 'primary', iconClass: 'fa-solid fa-building' },
        { id: 2, title: 'Total Events', value: analytics?.totalEvents || 0, subtitle: 'All time', tone: 'info', iconClass: 'fa-regular fa-calendar-check' },
        { id: 3, title: 'Pending Approvals', value: analytics?.pendingEvents || 0, subtitle: 'Requires attention', tone: 'warning', iconClass: 'fa-solid fa-clock' },
        { id: 4, title: 'Active Students', value: analytics?.activeStudents || 0, subtitle: 'Total participants', tone: 'success', iconClass: 'fa-solid fa-users' },
    ];

    if (loading) {
        return (
            <div className="sa-dashboard-main">
                <LoadingSkeleton variant="stats" count={4} />
                <LoadingSkeleton variant="table" count={5} />
            </div>
        );
    }

    return (
        <>
            {/* Welcome card */}
            <section id="overview" className="sa-welcome-card glass hover-gradient-border">
                <div>
                    <p className="sa-eyebrow">CampusEvents • Super Admin</p>
                    <h2>Welcome back, {currentUserName}! 👋</h2>
                    <p className="sa-muted">You have {analytics?.pendingEvents || 0} pending events waiting for your approval.</p>
                    <div className="sa-hero-actions">
                        <Link to="/" className="primary-btn">View Portal</Link>
                        <Link to="/superadmin/manage-events" className="ghost-btn">Manage Events</Link>
                    </div>
                </div>
                <div className="sa-hero-badge">
                    <div className="sa-badge-number">{analytics?.totalEvents || 0}</div>
                    <div>
                        <p className="sa-badge-label">Total Events</p>
                        <p className="sa-badge-text">All time</p>
                    </div>
                </div>
            </section>

            {/* Stat cards */}
            <section className="sa-stats-grid">
                {statCards.map((card, idx) => (
                    <div
                        key={card.id}
                        className={`sa-stat-card ${card.tone} hover-gradient-border animate-stagger`}
                        style={{ animationDelay: `${idx * 80}ms` }}
                    >
                        <div className="sa-stat-icon">
                            <i className={card.iconClass} aria-hidden="true" />
                        </div>
                        <div>
                            <p className="sa-stat-title">{card.title}</p>
                            <h3 className="sa-stat-value">{card.value}</h3>
                            <p className="sa-stat-subtitle">{card.subtitle}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Event Approvals */}
            <section className="sa-card glass">
                <div className="sa-card-header">
                    <h3>Event Approvals</h3>
                    <span className="sa-pill sa-pill-primary">{pendingEvents.length} Pending</span>
                </div>
                {pendingEvents.length > 0 ? (
                    <div className="sa-list">
                        {pendingEvents.map((event, idx) => (
                            <div key={event.id} className="sa-list-item hover-card animate-stagger" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
                                        <p className="sa-list-title" style={{ fontSize: '16px' }}>{event.title}</p>
                                        <span className={`sa-tag sa-tag-${(event.status || 'PENDING').toLowerCase()}`}>
                                            {(event.status || 'PENDING')} Review
                                        </span>
                                    </div>
                                    <p className="sa-muted" style={{ fontSize: '13px', marginBottom: '8px' }}>
                                        {new Date(event.date).toLocaleDateString()} • <span style={{ color: 'var(--brand)', fontWeight: '600' }}>{event.club_name || 'Individual'}</span>
                                    </p>
                                    <p style={{ fontSize: '14px', color: 'var(--text)', opacity: 0.9 }}>{event.description}</p>
                                </div>
                                <div className="sa-table-actions" style={{ marginLeft: '16px', flexDirection: 'column', gap: '8px' }}>
                                    <button className="primary-btn sa-compact" onClick={() => handleStatusChange(event.id, 'APPROVED')} title="Approve"
                                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                                        <i className="fa-solid fa-check" style={{ marginRight: '4px' }} /> Approve
                                    </button>
                                    <button className="ghost-btn sa-compact" onClick={() => handleStatusChange(event.id, 'REJECTED')} title="Reject"
                                        style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
                                        <i className="fa-solid fa-xmark" style={{ marginRight: '4px' }} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                        <i className="fa-solid fa-circle-check" style={{ fontSize: '32px', color: '#10b981', marginBottom: '12px', display: 'block' }} />
                        <p>No pending approvals. All clear! 🎉</p>
                    </div>
                )}
            </section>

            {/* Clubs table */}
            <section className="sa-card glass">
                <div className="sa-card-header">
                    <h3>Recent Clubs</h3>
                    <Link to="/superadmin/manage-clubs" className="primary-btn sa-compact">
                        <i className="fa-solid fa-eye" /> View All
                    </Link>
                </div>
                <div className="sa-table-wrapper">
                    <table className="sa-data-table">
                        <thead>
                            <tr>
                                <th>Club Name</th>
                                <th>Assigned Admin</th>
                                <th className="sa-text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clubs.map((club, idx) => (
                                <tr key={club.id} className="hover-row animate-stagger" style={{ animationDelay: `${idx * 60}ms` }}>
                                    <td><strong>{club.name}</strong></td>
                                    <td>
                                        <span className="sa-pill sa-pill-soft">{club.admin_name || 'Unassigned'}</span>
                                    </td>
                                    <td className="sa-text-right">
                                        <div className="sa-table-actions">
                                            <Link to="/superadmin/manage-clubs" className="ghost-btn sa-compact"><i className="fa-regular fa-pen-to-square" /></Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Bottom two-column grid */}
            <section className="sa-content-grid">
                <div className="sa-card glass">
                    <div className="sa-card-header">
                        <h3>Admin Team</h3>
                        <Link to="/superadmin/manage-admins" className="sa-text-link">View all →</Link>
                    </div>
                    <div className="sa-list">
                        {admins.map((admin, idx) => (
                            <div key={admin.id} className="sa-list-item hover-card animate-stagger" style={{ animationDelay: `${idx * 70}ms` }}>
                                <div>
                                    <p className="sa-list-title">{admin.username}</p>
                                    <p className="sa-muted">{admin.role} • {admin.clubName || 'General'}</p>
                                </div>
                                <Link to="/superadmin/manage-admins" className="ghost-btn sa-compact">View</Link>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sa-card glass">
                    <div className="sa-card-header">
                        <h3>Recent Events</h3>
                        <Link to="/superadmin/manage-events" className="sa-text-link">View all →</Link>
                    </div>
                    <div className="sa-event-list">
                        {recentEvents.length > 0 ? recentEvents.map((ev, idx) => (
                            <div key={ev.id} className="sa-event-item hover-card animate-stagger" style={{ animationDelay: `${idx * 80}ms`, display: 'flex', gap: '12px' }}>
                                {ev.poster && (
                                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={`${API_BASE_URL}${ev.poster}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <div className="sa-event-top">
                                        <span className={`sa-tag sa-tag-${(ev.status || 'PENDING').toLowerCase()}`}>{ev.status}</span>
                                        <span className="sa-event-time">{new Date(ev.date).toLocaleDateString()}</span>
                                    </div>
                                    <h4 style={{ margin: '4px 0', fontSize: '14px' }}>{ev.title}</h4>
                                    <p className="sa-muted" style={{ fontSize: '12px', marginBottom: '4px' }}>{ev.venue}</p>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>Attendance: {ev.attendedCount || 0} / {ev.registeredCount || 0}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="sa-muted">No recent events.</p>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
