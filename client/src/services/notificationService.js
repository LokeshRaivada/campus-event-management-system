import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/notifications`;

// Helper to get headers with JWT token
const getHeaders = () => {
    const stored = localStorage.getItem('gmrit-auth');
    if (!stored) {
        console.warn('notificationService: No auth data found in localStorage');
        return { 'Content-Type': 'application/json' };
    }

    try {
        const auth = JSON.parse(stored);
        if (!auth?.token) {
            console.warn('notificationService: Token missing from auth data');
            return { 'Content-Type': 'application/json' };
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
        };
    } catch (err) {
        console.error('notificationService: Error parsing auth data', err);
        return { 'Content-Type': 'application/json' };
    }
};

/** Pub/sub for real-time updates */
const listeners = new Set();
const notifyListeners = () => listeners.forEach(fn => fn());

export function subscribeNotifications(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

export async function getNotifications() {
    try {
        const res = await fetch(API_URL, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch notifications');
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function markAsRead(id) {
    try {
        const res = await fetch(`${API_URL}/${id}/read`, {
            method: 'PATCH',
            headers: getHeaders()
        });
        notifyListeners();
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function markAllAsRead() {
    try {
        const res = await fetch(`${API_URL}/mark-all-read`, {
            method: 'PATCH',
            headers: getHeaders()
        });
        notifyListeners();
        return await res.json();
    } catch (err) {
        console.error(err);
    }
}

export function getUnreadCount(notifications = []) {
    return notifications.filter(n => n.status === 'PENDING').length;
}

export async function markAsDone(id) {
    try {
        const res = await fetch(`${API_URL}/${id}/done`, {
            method: 'PATCH',
            headers: getHeaders()
        });
        notifyListeners();
        return await res.json();
    } catch (err) {
        console.error(err);
    }
}

export async function setNotificationAction(id, action) {
    try {
        const res = await fetch(`${API_URL}/${id}/done`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ action_taken: action })
        });
        notifyListeners();
        return await res.json();
    } catch (err) {
        console.error('setNotificationAction failed:', err);
        return null;
    }
}

export async function addEventApprovalNotification(event) {
    if (!event) return;
    try {
        const res = await fetch(`${API_URL}/create`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                userRole: 'super_admin',
                eventId: event.id,
                type: 'EVENT_CREATED',
                title: 'New Event Request',
                message: `${event.organizer || 'Admin'} requested approval for "${event.title}"`
            })
        });
        notifyListeners();
        return await res.json();
    } catch (err) {
        console.error('Failed to add approval notification:', err);
    }
}
