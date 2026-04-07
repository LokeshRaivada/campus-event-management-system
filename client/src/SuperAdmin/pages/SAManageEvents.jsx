/**
 * SAManageEvents — SuperAdmin page for global event management.
 * View all events across admins, force approve/reject, delete.
 */
import React, { useState, useEffect } from 'react';
import { Search, Trash2, Check, X as XIcon, CalendarDays } from 'lucide-react';
import { getAllEvents, getSystemEvents, deleteEvent, approveEvent, rejectEvent, subscribeEvents } from '../../services/eventService';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import '../styles/SuperAdminPages.css';

export default function SAManageEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { addToast } = useToast();

    const fetchEventsBackground = async () => {
        const data = await getSystemEvents();
        setEvents(data);
    };

    useEffect(() => {
        const loadInitial = async () => {
            setLoading(true);
            await fetchEventsBackground();
            setLoading(false);
        };
        loadInitial();

        // Auto-refresh when events change externally
        const unsub = subscribeEvents(fetchEventsBackground);
        
        // Polling every 5s for real-time
        const interval = setInterval(fetchEventsBackground, 5000);

        return () => {
            unsub();
            clearInterval(interval);
        };
    }, []);

    const filtered = events.filter((e) => {
        const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || (e.organizer || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || e.status?.toLowerCase() === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleApprove = async (id, title) => {
        await approveEvent(id);
        addToast(`"${title}" approved`, 'success');
        fetchEventsBackground();
    };

    const handleReject = async (id, title) => {
        await rejectEvent(id);
        addToast(`"${title}" rejected`, 'warning');
        fetchEventsBackground();
    };

    const handleDelete = async (id, title) => {
        if (window.confirm(`Delete event "${title}"? This cannot be undone.`)) {
            await deleteEvent(id);
            addToast(`"${title}" deleted`, 'success');
            fetchEventsBackground();
        }
    };

    const getStatusClass = (status) => {
        const map = { Approved: 'active', Pending: 'pending', Rejected: 'suspended' };
        return map[status] || '';
    };

    if (loading) {
        return (
            <div className="sa-page-content">
                <div className="sa-page-header"><h1>Manage Events</h1></div>
                <LoadingSkeleton variant="table" count={5} />
            </div>
        );
    }

    return (
        <div className="sa-page-content">
            <div className="sa-page-header">
                <div>
                    <h1>Manage Events</h1>
                    <p className="sa-muted">{events.length} event{events.length !== 1 ? 's' : ''} across all admins</p>
                </div>
            </div>

            {/* Filters */}
            <div className="sa-filters-bar">
                <div className="sa-search-box">
                    <Search size={18} />
                    <input type="text" placeholder="Search by title or organizer..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="sa-filter-pills">
                    {['all', 'approved', 'pending', 'rejected'].map((s) => (
                        <button key={s} className={`sa-filter-pill ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <EmptyState icon={CalendarDays} title="No events found" message="Try adjusting your search or filter criteria." />
            ) : (
                <div className="sa-card glass">
                    <div className="sa-table-wrapper">
                        <table className="sa-data-table">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th className="sa-hide-sm">Organizer</th>
                                    <th className="sa-hide-md">Date</th>
                                    <th className="sa-hide-md">Registrations</th>
                                    <th>Status</th>
                                    <th className="sa-text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((event, idx) => (
                                    <tr key={event.id} className="hover-row animate-stagger" style={{ animationDelay: `${idx * 50}ms` }}>
                                        <td>
                                            <div>
                                                <strong>{event.title}</strong>
                                                <small className="sa-muted sa-show-sm-only" style={{ display: 'block' }}>{event.organizer}</small>
                                            </div>
                                        </td>
                                        <td className="sa-hide-sm sa-muted">{event.organizer || event.club}</td>
                                        <td className="sa-hide-md sa-muted">{new Date(event.date).toLocaleDateString()}</td>
                                        <td className="sa-hide-md sa-muted">{event.registered_count || 0}</td>
                                        <td>
                                            <span className={`sa-status-badge ${getStatusClass(event.status)}`}>{event.status}</span>
                                        </td>
                                        <td className="sa-text-right">
                                            <div className="sa-table-actions">
                                                {event.status !== 'APPROVED' && (
                                                    <button className="ghost-btn sa-compact sa-icon-btn" onClick={() => handleApprove(event.id, event.title)} title="Approve" style={{ color: '#10b981' }}>
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                                {event.status !== 'REJECTED' && (
                                                    <button className="ghost-btn sa-compact sa-icon-btn" onClick={() => handleReject(event.id, event.title)} title="Reject" style={{ color: '#f59e0b' }}>
                                                        <XIcon size={16} />
                                                    </button>
                                                )}
                                                <button className="ghost-btn sa-compact sa-icon-btn sa-danger" onClick={() => handleDelete(event.id, event.title)} title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
