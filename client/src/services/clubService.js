import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/clubs`;

const getHeaders = () => {
    const stored = localStorage.getItem('gmrit-auth');
    if (!stored) return { 'Content-Type': 'application/json' };
    const auth = JSON.parse(stored);
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth?.token}`
    };
};

export async function getAllClubs() {
    try {
        const res = await fetch(API_URL, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch clubs');
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function createClub(clubData) {
    try {
        const res = await fetch(`${API_URL}/create`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(clubData)
        });
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function updateClub(id, clubData) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(clubData)
        });
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function deleteClub(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}
