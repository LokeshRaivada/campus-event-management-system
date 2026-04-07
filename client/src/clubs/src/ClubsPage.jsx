import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, SlidersHorizontal, Users, ArrowRight, Sparkles, Trophy, Palette } from "lucide-react";
import { getAllClubs } from "../../services/clubService";
import { getAllEvents } from "../../services/eventService";
import "./ClubsPage.css";
import Navbar from "../../Home/navbar";

const categoryIcons = {
  Technical: <Sparkles size={14} />,
  Cultural: <Palette size={14} />,
  Default: <Users size={14} />,
};

const categoryGradients = {
  Technical: "technical",
  Cultural: "cultural",
};

export default function ClubsPage() {
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [clubsData, eventsData] = await Promise.all([
          getAllClubs(),
          getAllEvents()
        ]);
        setClubs(clubsData);
        setEvents(eventsData);
      } catch (err) {
        console.error("Failed to load clubs page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const categories = ["All", ...new Set(clubs.map((c) => c.category || "Club"))];

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch = club.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || (club.category || "Club") === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeFilterCount = categoryFilter !== "All" ? 1 : 0;

  const getClubEventCount = (clubId) =>
    events.filter((e) => e.club_id === clubId).length;

  if (loading) return (
    <>
      <Navbar />
      <div className="clubs-page" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="loader">Loading clubs...</div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="clubs-page">
        <aside className="clubs-filters">
          <div className="clubs-filters-header">
            <div className="clubs-filters-title">
              <SlidersHorizontal size={18} />
              <h3>Filters</h3>
            </div>
            {activeFilterCount > 0 && (
              <button
                className="clubs-clear-btn"
                onClick={() => setCategoryFilter("All")}
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>

          <div className="clubs-filter-group">
            <label>Category</label>
            <div className="clubs-filter-pills">
              {categories.map((cat, i) => (
                <button
                  key={cat}
                  className={`clubs-filter-pill ${categoryFilter === cat ? "active" : ""} ${cat !== "All" ? categoryGradients[cat] || "" : ""}`}
                  onClick={() => setCategoryFilter(cat)}
                  style={{ "--pill-index": i }}
                >
                  {cat !== "All" && (categoryIcons[cat] || categoryIcons.Default)}
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="clubs-stats-summary">
            <div className="clubs-stat-item">
              <span className="clubs-stat-number">{clubs.length}</span>
              <span className="clubs-stat-label">Total Clubs</span>
            </div>
            <div className="clubs-stat-item">
              <span className="clubs-stat-number">{events.length}</span>
              <span className="clubs-stat-label">Total Events</span>
            </div>
          </div>
        </aside>

        <main className="clubs-content">
          <div className="clubs-header-section">
            <h1>Explore Clubs</h1>
            <p className="clubs-subtitle">
              Showing <strong>{filteredClubs.length}</strong> of{" "}
              <strong>{clubs.length}</strong> clubs
            </p>
          </div>

          <div className="clubs-search-box">
            <Search className="clubs-search-icon" size={18} />
            <input
              ref={searchRef}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search clubs..."
            />
            {searchText && (
              <>
                <span className="clubs-search-count">
                  {filteredClubs.length} found
                </span>
                <button
                  className="clubs-search-clear"
                  onClick={() => setSearchText("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              </>
            )}
            <kbd className="clubs-search-kbd">Ctrl K</kbd>
          </div>

          <div className="clubs-grid-page">
            {filteredClubs.map((club, index) => {
              const eventCount = getClubEventCount(club.id);
              const category = club.category || "Club";
              const gradientClass = categoryGradients[category] || "";

              return (
                <div
                  className="clubs-card"
                  key={club.id}
                  style={{ "--card-index": index }}
                >
                  <div className={`clubs-card-banner ${gradientClass}`}>
                    <span className="clubs-banner-pattern" />
                  </div>

                  <div className="clubs-shimmer-effect" />

                  <div className="clubs-card-body">
                    <div className="clubs-card-header">
                      <span className={`clubs-tag ${gradientClass}`}>
                        {categoryIcons[category] || categoryIcons.Default}
                        {category}
                      </span>
                      {eventCount > 0 && (
                        <span className="clubs-upcoming-badge">
                          {eventCount} event{eventCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <h3>{club.name}</h3>
                    <p className="clubs-description">{club.description}</p>

                    <div className="clubs-meta">
                      <div className="clubs-meta-item">
                        <Users size={16} />
                        <span>{club.members || 0} Members</span>
                      </div>
                      <div className="clubs-meta-item">
                        <Trophy size={16} />
                        <span>{eventCount} Events</span>
                      </div>
                    </div>

                    <button
                      className="clubs-view-btn"
                      onClick={() => navigate(`/clubs/${club.id}`)}
                    >
                      View Events
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredClubs.length === 0 && (
            <div className="clubs-no-results">
              <div className="clubs-no-results-icon">🏢</div>
              <h3>No clubs found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
