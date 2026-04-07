import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/registrations`;

const getHeaders = () => {
    const auth = JSON.parse(localStorage.getItem('gmrit-auth'));
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth?.token}`
    };
};

export async function registerForEvent(eventId) {
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ eventId }),
        });
        return await res.json();
    } catch (err) {
        console.error(err);
        return { success: false };
    }
}

export async function cancelRegistration(eventId) {
    try {
        const res = await fetch(`${API_URL}/${eventId}/cancel`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return await res.json();
    } catch (err) {
        console.error(err);
        return { success: false };
    }
}

export async function getMyRegistrations() {
    try {
        const res = await fetch(`${API_URL}/my-registrations`, { headers: getHeaders() });
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function checkRegistration(eventId) {
    try {
        const res = await fetch(`${API_URL}/check/${eventId}`, { headers: getHeaders() });
        if (!res.ok) return { registered: false };
        return await res.json();
    } catch (err) {
        console.error(err);
        return { registered: false };
    }
}

export async function getMyStats() {
    try {
        const res = await fetch(`${API_URL}/my-stats`, { headers: getHeaders() });
        if (!res.ok) return { registered: 0, upcoming: 0, completed: 0 };
        return await res.json();
    } catch (err) {
        console.error(err);
        return { registered: 0, upcoming: 0, completed: 0 };
    }
}

export async function getAdminRegistrations() {
    try {
        const res = await fetch(`${API_URL}/admin-registrations`, { headers: getHeaders() });
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function getTicket(eventId) {
    try {
        const res = await fetch(`${API_URL}/ticket/${eventId}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch ticket');
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function validateTicket(token) {
    try {
        const res = await fetch(`${API_URL}/validate`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ token })
        });
        return await res.json();
    } catch (err) {
        console.error(err);
        return { success: false, message: 'Server error during validation' };
    }
}
