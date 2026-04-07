import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Tag, ArrowRight, Users, SlidersHorizontal, X } from "lucide-react";
import SearchBar from "./SearchBar";
import { getAllEvents } from "../../services/eventService";
import "./Events.css";
import Navbar from "../../Home/navbar";

export default function Events() {
    const [eventsData, setEventsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: "",
        type: "All",
        club: "All"
    });

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllEvents();
        console.log("Fetched public events:", data);
        // Strict uppercase filter
        const approvedOnly = data.filter(e => e.status === 'APPROVED');
        setEventsData(approvedOnly);
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

    const navigate = useNavigate();

    const filteredEvents = useMemo(() => {
        return eventsData.filter((e) => {
            const matchSearch = (e.title || '').toLowerCase().includes(filters.search.toLowerCase());
            const matchType = filters.type === "All" || (e.category || e.type) === filters.type;
            const matchClub = filters.club === "All" || (e.club_name || e.club) === filters.club;
            return matchSearch && matchType && matchClub;
        });
    }, [eventsData, filters]);

    const uniqueTypes = useMemo(() => ["All", ...new Set(eventsData.map(e => e.category || e.type))].filter(Boolean), [eventsData]);
    const uniqueClubs = useMemo(() => ["All", ...new Set(eventsData.map(e => e.club_name || e.club))].filter(Boolean), [eventsData]);

    const activeFilterCount = (filters.type !== "All" ? 1 : 0) + (filters.club !== "All" ? 1 : 0);

    const clearFilters = () => setFilters({ ...filters, type: "All", club: "All" });

  const getTagClass = (eventType) => {
    const typeMap = {
      'Technical': 'technical',
      'Cultural': 'cultural',
      'Workshop': 'workshop',
      'Seminar': 'seminar'
    };
    return typeMap[eventType] || '';
  };

  const getCapacityInfo = (event) => {
    const registered = event.registered || 0;
    const capacity = event.capacity || 100;
    const percentage = (registered / capacity) * 100;
    const spotsLeft = capacity - registered;
    return { percentage, spotsLeft, isAlmostFull: spotsLeft <= 5 };
  };

  return (
    <>
      <Navbar />
      <div className="events-page">
        <aside className="filters">
          <div className="filters-header">
            <div className="filters-title">
              <SlidersHorizontal size={18} />
              <h3>Filters</h3>
            </div>
            {activeFilterCount > 0 && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                <X size={14} />
                Clear ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="filter-group">
            <label>Event Type</label>
            <div className="filter-pills">
              {uniqueTypes.map((t, i) => (
                <button
                  key={t}
                  className={`filter-pill ${filters.type === t ? 'active' : ''} ${t !== 'All' ? getTagClass(t) : ''}`}
                  onClick={() => setFilters({ ...filters, type: t })}
                  style={{ '--pill-index': i }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Club</label>
            <div className="filter-pills">
              {uniqueClubs.map((c, i) => (
                <button
                  key={c}
                  className={`filter-pill ${filters.club === c ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, club: c })}
                  style={{ '--pill-index': i }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="events-content">
          <div className="events-header">
            <h1>Explore Events</h1>
            <p className="events-subtitle">
              Showing <strong>{filteredEvents.length}</strong> of{" "}
              <strong>{eventsData.length}</strong> events
            </p>
          </div>
          <SearchBar
            value={filters.search}
            onChange={(val) => setFilters({ ...filters, search: val })}
            resultCount={filters.search ? filteredEvents.length : undefined}
          />

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
              <div className="sa-loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.1)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p className="muted">Discovering events...</p>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((event, index) => {
                const { percentage, spotsLeft, isAlmostFull } = getCapacityInfo(event);
                const capacityClass = percentage >= 90 ? 'full' : percentage >= 70 ? 'high' : '';

                return (
                  <div
                    className="event-card"
                    key={event.id}
                    style={{ '--card-index': index }}
                  >
                    {/* Gradient banner */}
                    <div className={`event-card-banner ${getTagClass(event.type)}`}>
                      <span className="banner-pattern" />
                    </div>

                    <div className="shimmer-effect" />
                    <div className="event-card-body">
                      <div className="event-card-header">
                        <span className={`tag ${getTagClass(event.type)}`}>{event.type}</span>
                        {isAlmostFull && (
                          <span className="spots-badge">🔥 {spotsLeft} spots left!</span>
                        )}
                      </div>

                      <h3>{event.title}</h3>
                      <p className="event-description">{event.description}</p>

                      <div className="event-meta">
                        <div className="event-meta-item club">
                          <Tag size={16} />
                          <span>{event.club}</span>
                        </div>
                        <div className="event-meta-item">
                          <Calendar size={16} />
                          <span>{event.date}</span>
                        </div>
                        <div className="event-meta-item">
                          <Clock size={16} />
                          <span>{event.time}</span>
                        </div>
                        <div className="event-meta-item">
                          <MapPin size={16} />
                          <span>{event.venue || event.location}</span>
                        </div>
                        {(event.registered_count !== undefined) && (
                          <div className="event-meta-item">
                            <Users size={16} />
                            <span>{event.registered_count || 0} / {event.registration_limit || 100} registered</span>
                          </div>
                        )}
                      </div>

                      {event.capacity && (
                        <div className="capacity-bar">
                          <div
                            className={`capacity-fill ${capacityClass}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      )}

                      <button onClick={() => navigate(`/events/${event.id}`)}>
                        View Details
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredEvents.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No events found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
