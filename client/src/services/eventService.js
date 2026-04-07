import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/events`;

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

/** Pub/sub — listeners get called whenever events data changes */
const eventListeners = new Set();
export function notifyEventListeners() {
    eventListeners.forEach((fn) => fn());
}

/** Subscribe to event changes — returns an unsubscribe function */
export function subscribeEvents(callback) {
    eventListeners.add(callback);
    return () => eventListeners.delete(callback);
}

export async function getAllEvents() {
    try {
        const res = await fetch(`${API_URL}/all`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch events');
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function getSystemEvents() {
    try {
        const res = await fetch(`${API_URL}/system`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch system events');
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function getMyEvents() {
    try {
        const res = await fetch(`${API_URL}/my`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch my events');
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function getEventById(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch event');
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function createEvent(eventData) {
    try {
        let body;
        let headers = { ...getHeaders() };

        if (eventData.poster) {
            body = new FormData();
            Object.keys(eventData).forEach(key => {
                if (eventData[key] !== undefined && eventData[key] !== null) {
                    body.append(key, eventData[key]);
                }
            });
            // When using FormData, fetch automatically sets the correct boundary
            delete headers['Content-Type'];
        } else {
            body = JSON.stringify(eventData);
        }

        const res = await fetch(`${API_URL}/create`, {
            method: 'POST',
            headers: headers,
            body: body,
        });
        if (!res.ok) throw new Error('Failed to create event');
        const result = await res.json();
        notifyEventListeners();
        return result;
    } catch (err) {
        console.error(err);
        return { success: false, message: err.message };
    }
}

export async function updateEvent(id, eventData) {
    try {
        let body;
        let headers = { ...getHeaders() };

        if (eventData.poster && typeof eventData.poster !== 'string') {
            body = new FormData();
            Object.keys(eventData).forEach(key => {
                if (eventData[key] !== undefined && eventData[key] !== null) {
                    body.append(key, eventData[key]);
                }
            });
            delete headers['Content-Type'];
        } else {
            body = JSON.stringify(eventData);
        }

        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: headers,
            body: body,
        });
        if (!res.ok) throw new Error('Failed to update event');
        const result = await res.json();
        notifyEventListeners();
        return result;
    } catch (err) {
        console.error(err);
        return { success: false, message: err.message };
    }
}

export async function updateEventStatus(id, status) {
    try {
        const res = await fetch(`${API_URL}/${id}/status`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Failed to update status');
        const result = await res.json();
        notifyEventListeners();
        return result;
    } catch (err) {
        console.error(err);
        return { success: false, message: err.message };
    }
}

export async function deleteEvent(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete event');
        notifyEventListeners();
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function approveEvent(id) {
    return updateEventStatus(id, 'APPROVED');
}

export async function rejectEvent(id) {
    return updateEventStatus(id, 'REJECTED');
}

export async function getPendingEvents() {
    try {
        const res = await fetch(`${API_URL}/pending`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch pending events');
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function getEventStats() {
    try {
        const res = await fetch(`${API_URL}/stats`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch stats');
        return await res.json();
    } catch (err) {
        console.error(err);
        return { total: 0, approved: 0, pending: 0, rejected: 0, totalRegistrations: 0 };
    }
}
export async function getRecentEvents() {
    try {
        const res = await fetch(`${API_URL}/recent`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch recent events');
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}
