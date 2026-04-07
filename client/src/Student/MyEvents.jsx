import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, ExternalLink } from "lucide-react";
import Sidebar from "./Sidebar";
import SharedNavbar from "../components/SharedNavbar";
import "./dashboard.css";


const mockEvents = [
  { id: 1, title: "AI Bootcamp", type: "technical", date: "Jan 10, 2024", time: "10:00 AM", venue: "Auditorium" },
  { id: 2, title: "UI/UX Workshop", type: "technical", date: "Jan 18, 2024", time: "2:00 PM", venue: "Lab 3" },
  { id: 3, title: "Robotics Expo", type: "technical", date: "Feb 02, 2024", time: "11:00 AM", venue: "Main Hall" },
];

const mockStudentRegistrations = [
  { id: 1, eventId: 1, eventTitle: "AI Bootcamp", registeredOn: "Jan 02, 2024", status: "registered" },
  { id: 2, eventId: 2, eventTitle: "UI/UX Workshop", registeredOn: "Dec 18, 2023", status: "completed" },
  { id: 3, eventId: 3, eventTitle: "Robotics Expo", registeredOn: "Dec 10, 2023", status: "registered" },
];

export default function MyEvents() {
  const [theme, setTheme] = useState(() => localStorage.getItem("student-theme") || "light");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const isDark = theme === "dark";
    document.body.classList.toggle("theme-dark", isDark);
    localStorage.setItem("student-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const registrations = mockStudentRegistrations.map((reg) => {
    const event = mockEvents.find((e) => e.id === reg.eventId);
    return { ...reg, event };
  });

  return (
    <div className="page">
      <div className="navbar-shell">
        <SharedNavbar
          role="Student"
          theme={theme}
          toggleTheme={toggleTheme}
          toggleSidebar={() => setSidebarOpen((s) => !s)}
          sidebarOpen={sidebarOpen}
        />
      </div>

      <div className="dashboard-layout">
        <Sidebar className={sidebarOpen ? "open" : ""} />

        <div className={`backdrop ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebarOpen(false)}></div>

        <main className="dashboard-main">
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
                    <span className={`badge ${reg.status === "registered" ? "badge-solid" : "badge-muted"}`}>
                      {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                    </span>
                    {reg.event && (
                      <span className="badge badge-outline">
                        {reg.event.type.charAt(0).toUpperCase() + reg.event.type.slice(1)}
                      </span>
                    )}
                  </div>

                  <h3 className="event-card-title">{reg.eventTitle}</h3>

                  {reg.event && (
                    <div className="event-meta">
                      <span className="meta-item">
                        <Calendar className="meta-icon" /> {reg.event.date}
                      </span>
                      <span className="meta-item">
                        <Clock className="meta-icon" /> {reg.event.time}
                      </span>
                      <span className="meta-item">
                        <MapPin className="meta-icon" /> {reg.event.venue}
                      </span>
                    </div>
                  )}
                </div>

                <div className="event-card-actions">
                  <span className="muted small">Registered on {reg.registeredOn}</span>
                  <Link to={`/events/${reg.eventId}`} className="outline-btn">
                    View Details <ExternalLink size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {registrations.length === 0 && (
            <div className="card empty-state">
              <Calendar className="empty-icon" />
              <h3>No registrations yet</h3>
              <p className="muted">Start exploring events and register for ones you're interested in!</p>
              <Link to="/student/events" className="primary-btn">
                Browse Events
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}