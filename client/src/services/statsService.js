import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/public/stats`;

export async function getPublicStats() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch stats');
        return await res.json();
    } catch (err) {
        console.error('getPublicStats error:', err);
        return { clubs: 16, eventsPerYear: 120, students: 5000, satisfaction: "95%" };
    }
}
