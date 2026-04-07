import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Mail,
  Tag,
  ArrowRight,
  Sparkles,
  Palette,
} from "lucide-react";
import { getAllClubs } from "../../services/clubService";
import { getAllEvents } from "../../services/eventService";
import { useState, useEffect } from "react";
import "./ClubDetails.css";
import Navbar from "../../Home/navbar";

const categoryGradients = {
  Technical: "technical",
  Cultural: "cultural",
};

const categoryIcons = {
  Technical: <Sparkles size={18} />,
  Cultural: <Palette size={18} />,
};

export default function ClubDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [allClubs, allEvents] = await Promise.all([
          getAllClubs(),
          getAllEvents()
        ]);
        const foundClub = allClubs.find((c) => c.id === Number(id));
        setClub(foundClub);
        if (foundClub) {
          setClubEvents(allEvents.filter((e) => e.club === foundClub.name));
        }
      } catch (err) {
        console.error("Error fetching club details", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="club-detail-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <div className="loader">Loading...</div>
        </div>
      </>
    );
  }

  if (!club) {
    return (
      <>
        <Navbar />
        <div className="club-detail-not-found">
          <div className="club-detail-not-found-icon">🏢</div>
          <h2>Club not found</h2>
          <p>The club you're looking for doesn't exist.</p>
          <button className="club-detail-back-btn" onClick={() => navigate("/clubs")}>
            <ArrowLeft size={16} />
            Back to Clubs
          </button>
        </div>
      </>
    );
  }

  const gradientClass = categoryGradients[club.category] || "";

  const getTagClass = (eventType) => {
    const typeMap = {
      Technical: "technical",
      Cultural: "cultural",
      Workshop: "workshop",
      Seminar: "seminar",
    };
    return typeMap[eventType] || "";
  };

  const getCapacityInfo = (event) => {
    if (!event.registered || !event.capacity) return null;
    const registered =
      typeof event.registered === "string"
        ? parseInt(event.registered.split("/")[0].trim(), 10)
        : event.registered;
    const capacity =
      typeof event.capacity === "string"
        ? parseInt(event.capacity, 10)
        : event.capacity || 100;
    const percentage = (registered / capacity) * 100;
    const spotsLeft = capacity - registered;
    return { registered, capacity, percentage, spotsLeft, isAlmostFull: spotsLeft <= 5 && spotsLeft > 0 };
  };

  return (
    <>
      <Navbar />
      <div className="club-detail-page">
        {/* Hero Banner */}
        <div className={`club-detail-hero ${gradientClass}`}>
          <div className="club-detail-hero-pattern" />
          <div className="club-detail-hero-content">
            <button
              className="club-detail-back-link"
              onClick={() => navigate("/clubs")}
            >
              <ArrowLeft size={16} />
              Back to Clubs
            </button>

            <div className="club-detail-hero-info">
              <div className="club-detail-hero-badge">
                <span className={`club-detail-category-tag ${gradientClass}`}>
                  {categoryIcons[club.category]}
                  {club.category}
                </span>
              </div>
              <h1>{club.name}</h1>
              <p className="club-detail-hero-desc">{club.description}</p>
            </div>

            <div className="club-detail-hero-stats">
              <div className="club-detail-stat">
                <Users size={20} />
                <div>
                  <span className="club-detail-stat-value">{club.members}</span>
                  <span className="club-detail-stat-label">Members</span>
                </div>
              </div>
              <div className="club-detail-stat">
                <Calendar size={20} />
                <div>
                  <span className="club-detail-stat-value">{clubEvents.length}</span>
                  <span className="club-detail-stat-label">Events</span>
                </div>
              </div>
              <div className="club-detail-stat">
                <Tag size={20} />
                <div>
                  <span className="club-detail-stat-value">{club.founded}</span>
                  <span className="club-detail-stat-label">Founded</span>
                </div>
              </div>
              {club.email && (
                <div className="club-detail-stat">
                  <Mail size={20} />
                  <div>
                    <span className="club-detail-stat-value club-detail-email">
                      {club.email}
                    </span>
                    <span className="club-detail-stat-label">Contact</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="club-detail-events-section">
          <div className="club-detail-events-header">
            <h2>
              Events by <span className="club-detail-highlight">{club.name}</span>
            </h2>
            <p className="club-detail-events-count">
              <strong>{clubEvents.length}</strong> event{clubEvents.length !== 1 ? "s" : ""}
            </p>
          </div>

          {clubEvents.length === 0 ? (
            <div className="club-detail-empty">
              <div className="club-detail-empty-icon">📋</div>
              <h3>No events yet</h3>
              <p>This club hasn't organized any events yet. Check back later!</p>
            </div>
          ) : (
            <div className="club-detail-events-grid">
              {clubEvents.map((event, index) => {
                const capacityInfo = getCapacityInfo(event);

                return (
                  <div
                    className="club-detail-event-card"
                    key={event.id}
                    style={{ "--card-index": index }}
                  >
                    {/* Gradient banner */}
                    <div className={`club-detail-event-banner ${getTagClass(event.type)}`}>
                      <span className="club-detail-banner-pattern" />
                    </div>

                    <div className="club-detail-event-shimmer" />

                    <div className="club-detail-event-body">
                      <div className="club-detail-event-top">
                        <span className={`club-detail-event-tag ${getTagClass(event.type)}`}>
                          {event.type}
                        </span>
                        {capacityInfo?.isAlmostFull && (
                          <span className="club-detail-spots-badge">
                            🔥 {capacityInfo.spotsLeft} spots left!
                          </span>
                        )}
                      </div>

                      <h3>{event.title}</h3>
                      <p className="club-detail-event-desc">{event.description}</p>

                      <div className="club-detail-event-meta">
                        <div className="club-detail-meta-item">
                          <Calendar size={16} />
                          <span>{event.date}</span>
                        </div>
                        <div className="club-detail-meta-item">
                          <Clock size={16} />
                          <span>{event.time}</span>
                        </div>
                        <div className="club-detail-meta-item">
                          <MapPin size={16} />
                          <span>{event.location}</span>
                        </div>
                        {event.registered && (
                          <div className="club-detail-meta-item">
                            <Users size={16} />
                            <span>{event.registered} registered</span>
                          </div>
                        )}
                      </div>

                      <button
                        className="club-detail-event-btn"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        View Details
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
