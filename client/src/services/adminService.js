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

export async function getAllAdmins() {
    try {
        const res = await fetch(`${API_URL}/admins`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch admins');
        const data = await res.json();

        // Mapping backend fields to frontend expectations if necessary
        return data.map(admin => ({
            ...admin,
            name: admin.username, // UI expects .name
            joinedOn: new Date(admin.created_at).toLocaleDateString()
        }));
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function createAdmin(data) {
    try {
        const res = await fetch(`${API_URL}/create-admin`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                username: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                department: data.department,
                clubName: data.clubName
            }),
        });
        const result = await res.json();
        return result;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function updateAdmin(id, updates) {
    try {
        const res = await fetch(`${API_URL}/admins/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update admin');
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function deleteAdmin(id) {
    try {
        const res = await fetch(`${API_URL}/admins/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete admin');
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function toggleAdminStatus(id) {
    try {
        const res = await fetch(`${API_URL}/admins/${id}/toggle`, {
            method: 'PATCH',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to toggle status');
        return await res.json();
    } catch (err) {
        console.error(err);
        return { status: 'active' };
    }
}
export async function getAnalytics() {
    try {
        const res = await fetch(`${API_URL}/analytics`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return await res.json();
    } catch (err) {
        console.error(err);
        return {
            totalUsers: 0,
            totalAdmins: 0,
            totalStudents: 0,
            totalEvents: 0,
            approvedEvents: 0,
            pendingEvents: 0,
            rejectedEvents: 0
        };
    }
}
