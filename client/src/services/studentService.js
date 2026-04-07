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

export async function getAllStudents() {
    try {
        const res = await fetch(`${API_URL}/students`, { headers: getHeaders() });

        if (res.status === 401 || res.status === 403) {
            throw new Error('Your session has expired. Please log out and login again.');
        }

        if (!res.ok) throw new Error('Failed to fetch students from server.');

        const data = await res.json();
        return data.map(s => ({
            ...s,
            id: s.id || s.student_id,
            name: s.name || 'Unknown Student',
            rollNo: s.roll_no ? s.roll_no.toString() : 'N/A',
            department: s.department || '—',
            year: s.year || '—',
            status: s.status || 'active',
            joinedOn: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'
        }));
    } catch (err) {
        console.error('Error in getAllStudents:', err);
        throw err; // Throw error to be handled by component
    }
}

export async function createStudent(data) {
    try {
        const res = await fetch(`${API_URL}/create-student`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                roll_no: data.rollNo,
                password: data.password,
                department: data.department,
                year: data.year
            }),
        });
        const result = await res.json();
        return result;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function suspendStudent(id) {
    // Currently backend doesn't have suspend route, returning mock success for UI stability
    return { status: 'suspended' };
}

export async function deleteStudent(id) {
    try {
        const res = await fetch(`${API_URL}/students/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete student');
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function getStudentRegistrations(studentId) {
    // Placeholder for student registrations
    return [];
}

export async function getStudentStats() {
    try {
        const students = await getAllStudents();
        return {
            total: students.length,
            active: students.filter(s => s.status === 'active').length,
            suspended: students.filter(s => s.status === 'suspended').length,
            totalRegistrations: students.reduce((acc, curr) => acc + (curr.registrations || 0), 0)
        };
    } catch (err) {
        console.error('Error fetching student stats:', err);
        return { total: 0, active: 0, suspended: 0, totalRegistrations: 0 };
    }
}
