import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/admin`;

// Helper to get headers with JWT token
const getHeaders = () => {
    const stored = localStorage.getItem('gmrit-auth');
    if (!stored) return { 'Content-Type': 'application/json' };
    const auth = JSON.parse(stored);
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth?.token}`
    };
};

export async function getAnalytics() {
    try {
        const res = await fetch(`${API_URL}/analytics`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return await res.json();
    } catch (err) {
        console.error(err);
        return {
            totalUsers: 0,
            activeAdmins: 0,
            totalAdmins: 0,
            activeStudents: 0,
            totalStudents: 0,
            suspendedStudents: 0,
            totalEvents: 0,
            pendingEvents: 0,
            approvedEvents: 0,
            rejectedEvents: 0,
            totalRegistrations: 0
        };
    }
}

export async function getMonthlyData() {
    try {
        const res = await fetch(`${API_URL}/monthly-data`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch monthly data');
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}
