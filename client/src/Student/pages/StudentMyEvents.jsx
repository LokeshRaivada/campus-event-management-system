/**
 * StudentMyEvents — My registered events page (refactored from MyEvents.jsx).
 * Now rendered inside StudentLayout, no Navbar/Sidebar here.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ExternalLink, Ticket } from 'lucide-react';
import { getMyRegistrations } from '../../services/registrationService';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export default function StudentMyEvents() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await getMyRegistrations();
            setRegistrations(data);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="sa-loading-container" style={{ padding: '20px' }}>
                <LoadingSkeleton variant="card" count={3} />
            </div>
        );
    }

    return (
        <>
            <header className="section-header">
                <h1>My Events</h1>
                <p className="muted">Track your registered events and participation history</p>
            </header>

            <div className="cards-vertical">
                {registrations.map((reg, idx) => (
                    <div
                        key={reg.id}
                        className="card event-card hover-card hover-gradient-border animate-stagger"
                        style={{ animationDelay: `${idx * 70}ms` }}
                    >
                        <div className="event-card-top">
                            <div className="badge-row">
                                <span className={`badge ${reg.status === 'REGISTERED' || reg.status === 'registered' ? 'badge-primary' : 'badge-muted'}`}>
                                    {reg.status}
                                </span>
                                <span className="badge badge-outline">
                                    {reg.category}
                                </span>
                            </div>
                            <h3 className="event-card-title">{reg.eventTitle}</h3>
                            <div className="event-meta">
                                <span className="meta-item">
                                    <Calendar className="meta-icon" size={14} />
                                    {reg.date ? new Date(reg.date).toLocaleDateString() : 'TBD'}
                                </span>
                                <span className="meta-item"><Clock className="meta-icon" size={14} /> {reg.time || 'TBA'}</span>
                                <span className="meta-item"><MapPin className="meta-icon" size={14} /> {reg.venue || 'TBA'}</span>
                            </div>
                        </div>
                        <div className="event-card-actions" style={{ gap: '12px' }}>
                            <span className="muted small">Registered on {reg.registered_at && new Date(reg.registered_at) != 'Invalid Date' ? new Date(reg.registered_at).toLocaleDateString() : 'Recently'}</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Link to={`/student/events/${reg.event_id}`} className="ghost-btn sa-compact">
                                    Details
                                </Link>
                                <Link to={`/student/my-events/${reg.event_id}/pass`} className="primary-btn sa-compact">
                                    <Ticket size={16} /> View Pass
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {registrations.length === 0 && (
                <EmptyState
                    icon={Calendar}
                    title="No registrations yet"
                    message="Start exploring events and register for ones you're interested in!"
                    action={() => { }}
                    actionLabel="Browse Events"
                />
            )}
        </>
    );
}
