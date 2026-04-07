import React, { useState, useEffect } from 'react';
import { Users, ChevronDown, ChevronUp, Search, Download } from 'lucide-react';
import { getAdminRegistrations } from '../../services/registrationService';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';


// ── Tag Styles ──────────────────────────────────────────────────
const tagStyles = {
    'Tech': { bg: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff' },
    'Non-Tech': { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' },
    'Workshop': { bg: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' },
};

const Registrations = () => {
    const [expandedEvent, setExpandedEvent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [eventsWithRegistrations, setEventsWithRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRecordsBackground = async () => {
        const data = await getAdminRegistrations();
        setEventsWithRegistrations(data);
    };

    const loadRecordsInitial = async () => {
        setLoading(true);
        await loadRecordsBackground();
        setLoading(false);
    };

    useEffect(() => {
        loadRecordsInitial();

        // Polling every 5s for real-time updates
        const interval = setInterval(loadRecordsBackground, 5000);

        return () => clearInterval(interval);
    }, []);

    const toggleExpand = (eventId) => {
        setExpandedEvent(prev => prev === eventId ? null : eventId);
    };

    const filteredEvents = eventsWithRegistrations.filter(event =>
        (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.tag || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.organizer || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = (event) => {
        if (!event.participants || event.participants.length === 0) {
            alert('No participants to export.');
            return;
        }

        const headers = ['S.No', 'Name', 'JNTU Number', 'Branch'];
        const rows = event.participants.map((p, idx) => 
            `"${idx + 1}","${p.name || ''}","${p.jntuNumber || ''}","${p.branch || ''}"`
        );
        
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${(event.title || 'Event').replace(/\s+/g, '_')}_Participants.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="sa-dashboard-content">
            <div className="sa-card-header" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Registrations</h2>
            </div>

            {/* Search */}
            <div className="sa-card glass" style={{ marginBottom: '24px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--card)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '10px', maxWidth: '400px' }}>
                    <Search size={18} color="var(--muted)" />
                    <input
                        type="text"
                        placeholder="Search by event name, tag, or organizer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            width: '100%',
                            color: 'var(--text)',
                            fontSize: '14px'
                        }}
                    />
                </div>
            </div>

            {/* Event Cards Grid */}
            <div className="reg-events-grid">
                {loading ? (
                    <LoadingSkeleton variant="card" count={3} />
                ) : (
                    filteredEvents.map((event, idx) => {
                        const isExpanded = expandedEvent === event.id;
                        const tag = tagStyles[event.tag] || tagStyles['Tech'];

                        return (
                            <div
                                key={event.id}
                                className={`reg-event-card sa-card glass animate-stagger ${isExpanded ? 'expanded' : ''}`}
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                {/* Card Header */}
                                <div className="reg-card-top">
                                    <div className="reg-card-info">
                                        <div className="reg-card-title-row">
                                            <h3 className="reg-card-title">{event.title}</h3>
                                            <span
                                                className="reg-tag"
                                                style={{ background: tag.bg, color: tag.color }}
                                            >
                                                {event.tag}
                                            </span>
                                        </div>
                                        <p className="reg-card-meta">
                                            <i className="fa-regular fa-calendar" style={{ marginRight: '6px' }}></i>
                                            {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}
                                            <span style={{ margin: '0 8px', opacity: 0.5 }}>•</span>
                                            <span style={{ color: 'var(--brand)', fontWeight: '600' }}>{event.organizer}</span>
                                        </p>
                                    </div>

                                    <div className="reg-card-stats">
                                        <div className="reg-stat-badge">
                                            <Users size={16} />
                                            <span>{event.registeredCount || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="reg-card-actions">
                                    <button
                                        className={`reg-view-btn ${isExpanded ? 'active' : ''}`}
                                        onClick={() => toggleExpand(event.id)}
                                    >
                                        <Users size={16} />
                                        <span>{isExpanded ? 'Hide Members' : 'View Registered Members'}</span>
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>

                                    <button
                                        className="reg-export-btn"
                                        onClick={() => handleExport(event)}
                                        title="Export CSV"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>

                                {/* Expandable Participant List */}
                                <div className={`reg-participants ${isExpanded ? 'visible' : ''}`}>
                                    <div className="reg-participants-inner">
                                        <div className="reg-participants-header">
                                            <h4>
                                                <i className="fa-solid fa-user-group" style={{ marginRight: '8px', color: 'var(--brand)' }}></i>
                                                Registered Participants ({event.participants.length})
                                            </h4>
                                        </div>
                                        <div className="sa-table-wrapper">
                                            <table className="sa-data-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Name</th>
                                                        <th>JNTU Number</th>
                                                        <th>Branch</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {event.participants.map((p, pIdx) => (
                                                        <tr key={p.id} className="hover-row">
                                                            <td style={{ color: 'var(--muted)', fontWeight: '500' }}>{pIdx + 1}</td>
                                                            <td style={{ fontWeight: '600' }}>{p.name}</td>
                                                            <td>
                                                                <code style={{
                                                                    background: 'var(--bg, #f1f5f9)',
                                                                    padding: '3px 8px',
                                                                    borderRadius: '6px',
                                                                    fontSize: '13px',
                                                                    fontWeight: '600',
                                                                    color: 'var(--brand, #6366f1)'
                                                                }}>
                                                                    {p.jntuNumber}
                                                                </code>
                                                            </td>
                                                            <td>
                                                                <span className="reg-branch-badge">{p.branch}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {filteredEvents.length === 0 && (
                <div className="sa-card glass" style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '32px', marginBottom: '12px', display: 'block', opacity: 0.5 }}></i>
                    <p>No events found matching "<strong>{searchTerm}</strong>"</p>
                </div>
            )}
        </div>
    );
};

export default Registrations;
