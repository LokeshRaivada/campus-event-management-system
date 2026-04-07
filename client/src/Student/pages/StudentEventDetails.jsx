/**
 * StudentEventDetails — event details page within student dashboard.
 * Shows full event info with register button.
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Tag, Users, ArrowLeft, CheckCircle } from 'lucide-react';
import { getEventById } from '../../services/eventService';
import { checkRegistration, registerForEvent, cancelRegistration } from '../../services/registrationService';
import { API_BASE_URL } from '../../config';
import { useToast } from '../../components/ui/Toast';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export default function StudentEventDetails() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registered, setRegistered] = useState(false);
    const [processing, setProcessing] = useState(false);
    const { addToast } = useToast();

    const loadData = async () => {
        const [eventData, regData] = await Promise.all([
            getEventById(id),
            checkRegistration(id)
        ]);
        setEvent(eventData);
        setRegistered(regData.registered);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleRegister = async () => {
        setProcessing(true);
        try {
            const res = await registerForEvent(id);
            if (res.success) {
                setRegistered(true);
                addToast("Registered successfully ✅", 'success');
                loadData();
            } else {
                addToast(res.message || 'Registration failed', 'error');
            }
        } catch (err) {
            addToast('Something went wrong', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        setProcessing(true);
        try {
            const res = await cancelRegistration(id);
            if (res.success) {
                setRegistered(false);
                addToast('Registration cancelled', 'info');
                loadData();
            } else {
                addToast(res.message || 'Cancellation failed', 'error');
            }
        } catch (err) {
            addToast('Something went wrong', 'error');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div style={{ padding: '24px' }}><LoadingSkeleton variant="card" height="400px" /></div>;

    if (!event) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                <h3>Event not found</h3>
                <Link to="/student/events" className="primary-btn sa-compact" style={{ marginTop: '16px', display: 'inline-flex' }}>
                    <ArrowLeft size={16} /> Back to Events
                </Link>
            </div>
        );
    }

    const isFull = event.maxSeats > 0 && event.registeredCount >= event.maxSeats;

    return (
        <div className="animate-rise">
            <Link to="/student/events" className="ghost-btn sa-compact" style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={16} /> Back to Events
            </Link>

            <div className="card glass hover-gradient-border" style={{ overflow: 'hidden', position: 'relative' }}>
                {event.poster_url ? (
                    <div className="event-detail-banner" style={{ height: '350px', position: 'relative' }}>
                        <img 
                            src={`${API_BASE_URL}${event.poster_url}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            alt={event.title}
                        />
                    </div>
                ) : (
                    <div className="sa-event-banner large" style={{ height: '200px', background: 'var(--brand-linear)' }} />
                )}

                <div style={{ padding: '32px' }}>
                    <div className="badge-row" style={{ marginBottom: '16px' }}>
                        <span className="badge badge-primary">{event.category}</span>
                        {isFull && <span className="badge badge-danger">Sold Out</span>}
                    </div>

                    <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>{event.title}</h1>
                    <p className="muted" style={{ fontSize: '16px', lineHeight: 1.6, marginBottom: '32px' }}>{event.description}</p>

                    <div className="sa-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div className="sa-meta-item">
                            <Calendar size={18} />
                            <div>
                                <label>Date</label>
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="sa-meta-item">
                            <Clock size={18} />
                            <div>
                                <label>Time</label>
                                <span>{event.time}</span>
                            </div>
                        </div>
                        <div className="sa-meta-item">
                            <MapPin size={18} />
                            <div>
                                <label>Venue</label>
                                <span>{event.venue}</span>
                            </div>
                        </div>
                        <div className="sa-meta-item" style={{display: 'flex', flexDirection: 'column'}}>
                            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                <Users size={18} />
                                <div>
                                    <label>Seats</label>
                                    <span>{event.registeredCount} / {event.maxSeats > 0 ? event.maxSeats : '∞'} filled</span>
                                </div>
                            </div>
                            {event.maxSeats > 0 && (event.maxSeats - event.registeredCount) <= 5 && (event.maxSeats - event.registeredCount) > 0 && (
                                <div style={{ color: '#ffb700', fontSize: '12px', marginTop: '4px', fontWeight: 'bold' }}>
                                    ⚠️ Only few seats left
                                </div>
                            )}
                        </div>
                        <div className="sa-meta-item">
                            <Clock size={18} />
                            <div>
                                <label>Starts in</label>
                                <span>
                                    {(() => {
                                        const eventDate = new Date(`${event.date}T${event.time || '00:00'}`);
                                        const now = new Date();
                                        const diff = eventDate - now;
                                        if (diff > 0) {
                                            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                                            return `${days} days ${hours} hours`;
                                        }
                                        return 'Started/Ended';
                                    })()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px' }}>
                        {registered ? (
                            <button className="primary-btn elevated" disabled style={{ padding: '12px 32px', backgroundColor: '#28a745', borderColor: '#28a745', opacity: 1, color: '#fff', cursor: 'not-allowed' }}>
                                Registered ✅
                            </button>
                        ) : (
                            <button 
                                className="primary-btn elevated" 
                                onClick={handleRegister} 
                                disabled={isFull || processing}
                                style={{ padding: '12px 32px', transition: 'all 0.3s ease' }}
                            >
                                {isFull ? 'Seats Full' : processing ? 'Registering...' : 'Register Now'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
