import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Tag, Users, ArrowLeft, ArrowRight } from "lucide-react";
import { getEventById } from "../../services/eventService";
import { API_BASE_URL } from "../../config";
import Navbar from "../../Home/navbar";
import "./EventDetails.css";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getEventById(id);
      setEvent(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="details-page">
        <Navbar />
        <div style={{ textAlign: "center", marginTop: 100 }}>
          <div className="spinner"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="details-page">
        <Navbar />
        <div style={{ textAlign: "center", marginTop: 100 }}>
          <h2>Event not found</h2>
          <button className="primary-btn" onClick={() => navigate("/")} style={{ margin: '20px auto' }}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-details-container glass">
        <Navbar />
        <div className="container animate-fadeInUp">
            <div className="event-details-card">
                <header className="event-details-header">
                    <div className="event-details-badge animate-scaleIn">
                        <Tag size={14} />
                        {event.category || event.type || 'General Event'}
                    </div>
                    <h1 className="event-details-title">{event.title}</h1>
                    <div className="event-details-club">
                        <Users size={16} />
                        Organized by <strong>{event.club_name || event.organizer || 'Student Club'}</strong>
                    </div>
                </header>

                <div className="event-details-body">
                    {event.poster && (
                        <div className="sa-card-poster" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 'var(--space-8)', boxShadow: 'var(--shadow-lg)' }}>
                            <img src={`${API_BASE_URL}${event.poster}`} alt={event.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                        </div>
                    )}

                    <div className="event-details-description">
                        <p className="font-medium text-secondary" style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About the event</p>
                        {event.description}
                    </div>

                    <div className="event-details-info">
                        <div className="event-details-info-item">
                            <Calendar />
                            <div>
                                <p className="text-muted text-xs">When</p>
                                <strong>{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</strong>
                            </div>
                        </div>
                        <div className="event-details-info-item">
                            <Clock />
                            <div>
                                <p className="text-muted text-xs">Time</p>
                                <strong>{event.time}</strong>
                            </div>
                        </div>
                        <div className="event-details-info-item">
                            <MapPin />
                            <div>
                                <p className="text-muted text-xs">Where</p>
                                <strong>{event.venue || event.location || 'Campus'}</strong>
                            </div>
                        </div>
                        <div className="event-details-info-item">
                            <Users />
                            <div>
                                <p className="text-muted text-xs">Capacity</p>
                                <strong>{event.registration_limit || 'Open Entry'}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="event-details-capacity">
                        <div className="capacity-header">
                            <span className="capacity-label">Registration Status</span>
                            <span className="capacity-value">
                                {event.registered_count || 0} / {event.registration_limit || 100} Registered
                            </span>
                        </div>
                        <div className="capacity-bar-large">
                            <div 
                                className={`capacity-bar-fill ${(event.registered_count / (event.registration_limit || 100)) >= 0.9 ? 'full' : (event.registered_count / (event.registration_limit || 100)) >= 0.7 ? 'high' : ''}`}
                                style={{ width: `${Math.min((event.registered_count / (event.registration_limit || 100)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                <footer className="event-details-footer">
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} /> Back to Browse
                    </button>
                    <button className="btn btn-primary btn-lg elevated" onClick={() => navigate('/student/dashboard')}>
                        Register Now <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                    </button>
                </footer>
            </div>
        </div>
    </div>
  );
}
