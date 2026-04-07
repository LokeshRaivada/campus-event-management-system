import React, { useState, useEffect } from 'react';
import { getAllClubs } from '../../services/clubService';
import './clubs.css';

function Clubs() {
  const [professionalBodies, setProfessionalBodies] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClubs() {
      try {
        const data = await getAllClubs();
        const bodies = data.filter(c => c.category === 'Professional Body');
        const regularClubs = data.filter(c => c.category !== 'Professional Body');
        setProfessionalBodies(bodies);
        setClubs(regularClubs);
      } catch (err) {
        console.error('Failed to fetch clubs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchClubs();
  }, []);

  if (loading) return <div className="clubs-section"><p>Loading clubs...</p></div>;

  return (
    <div className="clubs-section">
      {professionalBodies.length > 0 && (
        <div className="bodies">
          <div className="header">
            <h1>Professional Bodies</h1>
            <p>Explore our technical professional associations.</p>
          </div>
          <div className="logos">
            {professionalBodies.map(club => (
              <div key={club.id} className="club-card">
                <div className="club-avatar-placeholder">{club.name.charAt(0)}</div>
                <h3>{club.name}</h3>
                <p>{club.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {clubs.length > 0 && (
        <div className="bodies">
          <div className="header">
            <h1>Clubs</h1>
            <p>Discover creative and innovation-driven communities.</p>
          </div>
          <div className="logos">
            {clubs.map(club => (
              <div key={club.id} className="club-card">
                <div className="club-avatar-placeholder">{club.name.charAt(0)}</div>
                <h3>{club.name}</h3>
                <p>{club.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Clubs;
