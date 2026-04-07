/**
 * StudentEvents — Browse all events page within student dashboard.
 * Reuses filter/search patterns from the public Events component.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, MapPin, Tag, ArrowRight, SlidersHorizontal, X, Users } from 'lucide-react';
import { getAllEvents, subscribeEvents } from '../../services/eventService';
import { subscribeToEvents } from '../../services/socketService';
import { API_BASE_URL } from '../../config';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';

export default function StudentEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    const fetchEventsBackground = async () => {
        try {
            const data = await getAllEvents();
            console.log("Fetched student events:", data);
            // Strict uppercase filter
            const approved = (data || []).filter((e) => e.status === 'APPROVED');
            setEvents(approved);
        } catch (err) {
            console.error("Student events load error:", err);
        }
    };

    useEffect(() => {
        const loadInitial = async () => {
            await fetchEventsBackground();
            setLoading(false);
        };
        loadInitial();

        // Real-time Sync
        const unsubscribe = subscribeToEvents(() => fetchEventsBackground());
        
        // Backup polling (30s)
        const interval = setInterval(fetchEventsBackground, 30000);
        
        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const filtered = events.filter((e) => {
        const matchSearch = (e.title || '').toLowerCase().includes(search.toLowerCase());
        const eventCategory = e.category || 'All';
        const matchType = type === 'All' || eventCategory === type;
        return matchSearch && matchType;
    });

    const uniqueTypes = ['All', ...new Set(events.map((e) => e.category || 'All'))];

    if (loading) {
        return (
            <div>
                <header className="section-header">
                    <h1>Browse Events</h1>
                    <p className="muted">Discover and register for upcoming events</p>
                </header>
                <div className="cards-grid">
                    {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} variant="card" height="300px" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-rise">
            <header className="section-header">
                <h1>Browse Events</h1>
                <p className="muted">
                    Showing <strong>{filtered.length}</strong> of <strong>{events.length}</strong> events
                </p>
            </header>

            {/* Search and filters */}
            <div className="student-filters-bar">
                <div className="student-search-box glass">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="ghost-btn sa-compact" onClick={() => setShowFilters(!showFilters)}>
                    <SlidersHorizontal size={16} />
                    Filters
                    {type !== 'All' && <span className="filter-count">1</span>}
                </button>
            </div>

            {showFilters && (
                <div className="student-filter-pills" style={{ marginBottom: '24px' }}>
                    {uniqueTypes.map((t) => (
                        <button
                            key={t}
                            className={`sa-filter-pill ${type === t ? 'active' : ''}`}
                            onClick={() => setType(t)}
                        >
                            {t}
                        </button>
                    ))}
                    {type !== 'All' && (
                        <button className="sa-filter-pill sa-danger" onClick={() => setType('All')} style={{ border: 'none', background: 'transparent' }}>
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>
            )}

            {/* Event cards */}
            {filtered.length === 0 ? (
                <EmptyState
                    icon={Calendar}
                    title="No events found"
                    message="Try adjusting your search or check back later for new events."
                />
            ) : (
                <div className="cards-grid">
                    {filtered.map((event, idx) => (
                        <div
                            key={event.id}
                            className="card glass hover-gradient-border animate-stagger"
                            style={{ animationDelay: `${idx * 70}ms`, overflow: 'hidden' }}
                        >
                            {/* Banner or Poster */}
                            {event.poster_url ? (
                                <div className="event-card-banner" style={{ height: '180px', position: 'relative' }}>
                                    <img
                                        src={`${API_BASE_URL}${event.poster_url}`}
                                        alt={event.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div className="poster-overlay" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))' }} />
                                </div>
                            ) : (
                                <div className="sa-event-banner" style={{ height: '120px', background: 'var(--brand-linear)' }} />
                            )}

                            <div className="student-event-card-body" style={{ padding: '20px' }}>
                                <div className="badge-row" style={{ marginBottom: '12px' }}>
                                    <span className="badge badge-primary">{event.category}</span>
                                    {event.maxSeats > 0 && event.registeredCount >= event.maxSeats && <span className="badge badge-danger">Full</span>}
                                </div>

                                <h3 className="event-card-title">{event.title}</h3>
                                <p className="muted" style={{ fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>{event.description?.substring(0, 100)}...</p>

                                <div className="event-meta" style={{ marginBottom: '20px' }}>
                                    <span className="meta-item"><Calendar size={14} className="meta-icon" /> {new Date(event.date).toLocaleDateString()}</span>
                                    <span className="meta-item"><Clock size={14} className="meta-icon" /> {event.time}</span>
                                    <span className="meta-item"><MapPin size={14} className="meta-icon" /> {event.venue}</span>
                                    <span className="meta-item"><Users size={14} className="meta-icon" /> {event.registeredCount} / {event.maxSeats > 0 ? event.maxSeats : '∞'} seats</span>
                                </div>

                                <Link to={`/student/events/${event.id}`} className="primary-btn sa-compact" style={{ width: '100%', justifyContent: 'center' }}>
                                    View Details <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
