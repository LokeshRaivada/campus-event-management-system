import React from "react";
import { Calendar, Clock, MapPin, Users, Tag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./EventCard.css";

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const spotsLeft = event.capacity - (event.registered || 0);
  const isAlmostFull = spotsLeft <= 5 && spotsLeft > 0;
  const capacityPercentage = ((event.registered || 0) / event.capacity) * 100;

  const getCapacityClass = () => {
    if (capacityPercentage >= 90) return 'full';
    if (capacityPercentage >= 70) return 'high';
    return '';
  };

  // Get tag class based on event type
  const getTagClass = () => {
    const typeMap = {
      'Technical': 'technical',
      'Cultural': 'cultural',
      'Workshop': 'workshop',
      'Seminar': 'seminar'
    };
    return typeMap[event.type] || '';
  };

  return (
    <div className="event-card">
      <div className="event-card-header">
        <span className={`event-tag ${getTagClass()}`}>{event.type}</span>
        {isAlmostFull && (
          <span className="spots-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            ⚠️ Only few seats left
          </span>
        )}
      </div>

      <h3 className="event-title">{event.title}</h3>
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
          <span>{event.location}</span>
        </div>
        <div className="event-meta-item" style={{display: 'flex', alignItems: 'center'}}>
          <Users size={16} />
          <span>Seats: {event.registered || 0} / {event.capacity} ({spotsLeft} remaining)</span>
        </div>
      </div>

      {event.capacity && (
        <div className="capacity-bar">
          <div 
            className={`capacity-fill ${getCapacityClass()}`}
            style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
          />
        </div>
      )}

      <button
        className="event-btn"
        onClick={() => navigate("/event-details", { state: { event } })}
      >
        View Details
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default EventCard;
