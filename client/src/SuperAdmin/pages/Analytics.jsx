/**
 * Analytics — SuperAdmin analytics page with stats cards and charts.
 * Reuses DashboardChart from Admin module.
 */
import React, { useState, useEffect } from 'react';
import { Users, UserCog, CalendarDays, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { getAnalytics, getMonthlyData } from '../../services/superAdminService';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import '../styles/SuperAdminPages.css';

export default function Analytics() {
    const [data, setData] = useState(null);
    const [monthly, setMonthly] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [analytics, monthlyData] = await Promise.all([getAnalytics(), getMonthlyData()]);
            setData(analytics);
            setMonthly(monthlyData);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="sa-page-content">
                <div className="sa-page-header"><h1>Analytics</h1></div>
                <LoadingSkeleton variant="stat" count={6} />
            </div>
        );
    }

    const statCards = [
        { label: 'Total Users', value: data.totalUsers, icon: Users, tone: 'primary', subtitle: 'All platform users' },
        { label: 'Active Admins', value: `${data.activeAdmins}/${data.totalAdmins}`, icon: UserCog, tone: 'info', subtitle: 'Active / Total' },
        { label: 'Active Students', value: `${data.activeStudents}/${data.totalStudents}`, icon: Users, tone: 'success', subtitle: `${data.suspendedStudents} suspended` },
        { label: 'Total Events', value: data.totalEvents, icon: CalendarDays, tone: 'warning', subtitle: `${data.pendingEvents} pending approval` },
        { label: 'Total Registrations', value: data.totalRegistrations, icon: TrendingUp, tone: 'primary', subtitle: 'Event registrations' },
        { label: 'Approval Rate', value: `${data.totalEvents > 0 ? Math.round((data.approvedEvents / data.totalEvents) * 100) : 0}%`, icon: Activity, tone: 'success', subtitle: `${data.approvedEvents} approved` },
    ];

    const maxEvents = Math.max(...monthly.map((m) => m.events), 1);
    const maxRegs = Math.max(...monthly.map((m) => m.registrations), 1);

    return (
        <div className="sa-page-content">
            <div className="sa-page-header">
                <div>
                    <h1>Analytics</h1>
                    <p className="sa-muted">Platform overview and performance metrics</p>
                </div>
            </div>

            {/* Stats grid */}
            <div className="sa-analytics-grid">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className={`sa-stat-card ${card.tone} hover-gradient-border animate-stagger`} style={{ animationDelay: `${idx * 80}ms` }}>
                            <div className="sa-stat-icon">
                                <Icon size={20} />
                            </div>
                            <div>
                                <p className="sa-stat-title">{card.label}</p>
                                <h3 className="sa-stat-value">{card.value}</h3>
                                <p className="sa-stat-subtitle">{card.subtitle}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="sa-charts-grid">
                <div className="sa-card glass">
                    <div className="sa-card-header">
                        <h3><BarChart3 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Events Per Month</h3>
                    </div>
                    <div className="sa-chart-container">
                        {monthly.map((m, idx) => (
                            <div key={idx} className="sa-chart-bar-group">
                                <div className="sa-chart-bar-wrapper">
                                    <div
                                        className="sa-chart-bar events"
                                        style={{ height: `${(m.events / maxEvents) * 100}%` }}
                                        title={`${m.events} events`}
                                    >
                                        <span className="sa-chart-bar-value">{m.events}</span>
                                    </div>
                                </div>
                                <span className="sa-chart-label">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sa-card glass">
                    <div className="sa-card-header">
                        <h3><TrendingUp size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Registrations Per Month</h3>
                    </div>
                    <div className="sa-chart-container">
                        {monthly.map((m, idx) => (
                            <div key={idx} className="sa-chart-bar-group">
                                <div className="sa-chart-bar-wrapper">
                                    <div
                                        className="sa-chart-bar registrations"
                                        style={{ height: `${(m.registrations / maxRegs) * 100}%` }}
                                        title={`${m.registrations} registrations`}
                                    >
                                        <span className="sa-chart-bar-value">{m.registrations}</span>
                                    </div>
                                </div>
                                <span className="sa-chart-label">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary cards */}
            <div className="sa-content-grid">
                <div className="sa-card glass">
                    <div className="sa-card-header">
                        <h3>Event Distribution</h3>
                    </div>
                    <div className="sa-distribution-list">
                        <div className="sa-distribution-item">
                            <div className="sa-dist-label"><span className="sa-dot" style={{ background: '#10b981' }} /> Approved</div>
                            <div className="sa-dist-bar-wrap">
                                <div className="sa-dist-bar" style={{ width: `${(data.approvedEvents / data.totalEvents) * 100}%`, background: '#10b981' }} />
                            </div>
                            <span className="sa-dist-value">{data.approvedEvents}</span>
                        </div>
                        <div className="sa-distribution-item">
                            <div className="sa-dist-label"><span className="sa-dot" style={{ background: '#f59e0b' }} /> Pending</div>
                            <div className="sa-dist-bar-wrap">
                                <div className="sa-dist-bar" style={{ width: `${(data.pendingEvents / data.totalEvents) * 100}%`, background: '#f59e0b' }} />
                            </div>
                            <span className="sa-dist-value">{data.pendingEvents}</span>
                        </div>
                        <div className="sa-distribution-item">
                            <div className="sa-dist-label"><span className="sa-dot" style={{ background: '#ef4444' }} /> Rejected</div>
                            <div className="sa-dist-bar-wrap">
                                <div className="sa-dist-bar" style={{ width: `${(data.rejectedEvents / data.totalEvents) * 100}%`, background: '#ef4444' }} />
                            </div>
                            <span className="sa-dist-value">{data.rejectedEvents}</span>
                        </div>
                    </div>
                </div>

                <div className="sa-card glass">
                    <div className="sa-card-header">
                        <h3>User Breakdown</h3>
                    </div>
                    <div className="sa-distribution-list">
                        <div className="sa-distribution-item">
                            <div className="sa-dist-label"><span className="sa-dot" style={{ background: 'var(--brand, #6366f1)' }} /> Students</div>
                            <div className="sa-dist-bar-wrap">
                                <div className="sa-dist-bar" style={{ width: `${(data.totalStudents / data.totalUsers) * 100}%`, background: 'var(--brand, #6366f1)' }} />
                            </div>
                            <span className="sa-dist-value">{data.totalStudents}</span>
                        </div>
                        <div className="sa-distribution-item">
                            <div className="sa-dist-label"><span className="sa-dot" style={{ background: '#8b5cf6' }} /> Admins</div>
                            <div className="sa-dist-bar-wrap">
                                <div className="sa-dist-bar" style={{ width: `${(data.totalAdmins / data.totalUsers) * 100}%`, background: '#8b5cf6' }} />
                            </div>
                            <span className="sa-dist-value">{data.totalAdmins}</span>
                        </div>
                        <div className="sa-distribution-item">
                            <div className="sa-dist-label"><span className="sa-dot" style={{ background: '#06b6d4' }} /> Super Admin</div>
                            <div className="sa-dist-bar-wrap">
                                <div className="sa-dist-bar" style={{ width: `${(1 / data.totalUsers) * 100}%`, background: '#06b6d4' }} />
                            </div>
                            <span className="sa-dist-value">1</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
