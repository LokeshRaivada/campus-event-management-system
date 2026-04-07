import React from 'react';
import { Link } from 'react-router-dom'; // Assuming we might want a link
// import '../styles/RecentEventsTable.css'; // Deprecated

const RecentEventsTable = ({ events }) => {
    return (
        <div className="sa-card glass">
            <div className="sa-card-header">
                <h3>Recent Events</h3>
                <Link to="/admin/events" className="sa-text-link">View all →</Link>
            </div>
            <div className="sa-table-wrapper">
                <table className="sa-data-table">
                    <thead>
                        <tr>
                            <th>Event Title</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Category</th>
                            <th>Attendance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event, idx) => (
                            <tr key={event.id} className="hover-row animate-stagger" style={{ animationDelay: `${idx * 60}ms` }}>
                                <td>{event.title}</td>
                                <td>{event.date}</td>
                                <td>
                                    <span className={`sa-tag sa-tag-${(event.status || 'pending').toLowerCase()}`}>
                                        {event.status}
                                    </span>
                                </td>
                                <td>{event.category}</td>
                                <td>{event.attendedCount || 0} / {event.registeredCount || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentEventsTable;
