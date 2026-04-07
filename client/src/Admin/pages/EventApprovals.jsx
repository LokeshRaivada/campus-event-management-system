import React, { useState, useEffect } from 'react';
import { Check, X as XIcon } from 'lucide-react';
import { getPendingEvents, approveEvent, rejectEvent } from '../../services/eventService';

const EventApprovals = () => {
    const [pendingEvents, setPendingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            const data = await getPendingEvents();
            setPendingEvents(data);
            setLoading(false);
        };
        fetchEvents();
    }, []);

    const handleApprove = async (id) => {
        if (window.confirm("Approve this event?")) {
            await approveEvent(id);
            setPendingEvents(prev => prev.filter(e => e.id !== id));
        }
    }

    const handleReject = async (id) => {
        if (window.confirm("Reject this event?")) {
            await rejectEvent(id);
            setPendingEvents(prev => prev.filter(e => e.id !== id));
        }
    }

    return (
        <div className="sa-dashboard-content">
            <div className="sa-card-header" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Event Approvals</h2>
            </div>

            <div className="sa-card glass">
                <div className="sa-card-header">
                    <h3>Pending Requests</h3>
                    <span className="sa-pill sa-pill-primary">{pendingEvents.length} Pending</span>
                </div>

                {pendingEvents.length > 0 ? (
                    <div className="sa-list">
                        {pendingEvents.map((event, idx) => (
                            <div key={event.id} className="sa-list-item hover-card animate-stagger" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <p className="sa-list-title" style={{ fontSize: '16px' }}>{event.title}</p>
                                        <span className="sa-tag sa-tag-closed" style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#ffedd5' }}>Pending Review</span>
                                    </div>
                                    <p className="sa-muted" style={{ fontSize: '13px', marginBottom: '8px' }}>
                                        {event.date} • <span style={{ color: 'var(--brand)', fontWeight: '600' }}>{event.organizer}</span>
                                    </p>
                                    <p style={{ fontSize: '14px', color: 'var(--text)', opacity: 0.9 }}>{event.description}</p>
                                </div>

                                <div className="sa-table-actions" style={{ marginLeft: '16px', flexDirection: 'column', gap: '8px' }}>
                                    <button
                                        className="primary-btn sa-compact"
                                        onClick={() => handleApprove(event.id)}
                                        title="Approve"
                                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                                    >
                                        <Check size={16} /> Approve
                                    </button>
                                    <button
                                        className="ghost-btn sa-compact"
                                        onClick={() => handleReject(event.id)}
                                        title="Reject"
                                        style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                                    >
                                        <XIcon size={16} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                        <p>No pending approvals. great job!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventApprovals;
