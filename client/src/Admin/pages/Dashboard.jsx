import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import DashboardChart from '../components/DashboardChart';
import RecentEventsTable from '../components/RecentEventsTable';
import Skeleton from '../components/Skeleton';
import { getEventStats, getRecentEvents } from '../../services/eventService';
import { subscribeToEvents } from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const auth = useAuth();
    const currentUserName = auth.username || auth.name || auth.user?.username || auth.user?.name || "Admin";
    const club = auth.club || auth.user?.club;
    const designation = auth.designation || auth.user?.designation || "Admin";

    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, activeEvents: 0, registeredStudents: 0 });
    const [recentEvents, setRecentEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [statsData, recentData] = await Promise.all([
                    getEventStats(),
                    getRecentEvents()
                ]);
                setStats(statsData);
                setRecentEvents(recentData);
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();

        // Real-time Sync
        const unsubscribe = subscribeToEvents(() => loadStats());
        
        // Backup polling (30s)
        const interval = setInterval(loadStats, 30000);

        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
            clearInterval(interval);
        };
    }, []);

    if (loading) {
        return (
            <div className="sa-dashboard-main">
                <div className="sa-stats-grid">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} height="120px" borderRadius="16px" />
                    ))}
                </div>
                <div className="sa-content-grid">
                    <Skeleton height="300px" borderRadius="16px" />
                    <Skeleton height="300px" borderRadius="16px" />
                </div>
            </div>
        );
    }

    return (
        <div className="sa-dashboard-content">

            <section className="sa-welcome-card glass hover-gradient-border">
                <div>
                    <p className="sa-eyebrow">CampusEvents • {club?.name || 'Admin Portal'}</p>
                    <h2>Welcome back, {currentUserName}! 👋</h2>
                    <p className="sa-muted" style={{ marginBottom: '8px' }}>
                        <span className="sa-pill sa-pill-primary">{designation}</span>
                        {club?.name && <span className="sa-pill sa-pill-soft" style={{ marginLeft: '8px' }}>{club.name}</span>}
                    </p>
                    <p className="sa-muted">You have {stats.PENDING || 0} pending approvals to review.</p>
                    <div className="sa-hero-actions">
                        <Link to="/admin/create-event" className="primary-btn">Create Event</Link>
                        <Link to="/admin/approvals" className="ghost-btn">View Approvals</Link>
                    </div>
                </div>
                <div className="sa-hero-badge">
                    <div className="sa-badge-number">{stats.total}</div>
                    <div>
                        <p className="sa-badge-label">Club Events</p>
                        <p className="sa-badge-text">All time</p>
                    </div>
                </div>
            </section >

            <section className="sa-stats-grid" style={{ marginTop: '20px' }}>
                <StatCard
                    title="Total Events"
                    value={stats.total}
                    icon={<Calendar size={24} />}
                    tone="primary"
                    subtitle="All categories"
                />
                <StatCard
                    title="Active Events"
                    value={stats.APPROVED}
                    icon={<CheckCircle size={24} />}
                    tone="success"
                    subtitle="Currently ongoing"
                />
                <StatCard
                    title="Registered Students"
                    value={stats.totalRegistrations}
                    icon={<Users size={24} />}
                    tone="info"
                    subtitle="Total participants"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.PENDING}
                    icon={<Clock size={24} />}
                    tone="warning"
                    subtitle="Requires attention"
                />
            </section>

            <section className="sa-content-grid" style={{ marginTop: '20px' }}>
                <div className="sa-card glass">
                    <div className="sa-card-header">
                        <h3>Analytics</h3>
                    </div>
                    <DashboardChart />
                </div>
                <div className="events-section">
                    <RecentEventsTable events={recentEvents} />
                </div>
            </section>
        </div >
    );
};

export default Dashboard;
