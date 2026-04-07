/**
 * ManageStudents — SuperAdmin page for student management.
 * View all students, create new students, suspend/activate, view registrations, delete.
 */
import React, { useState, useEffect } from 'react';
import { Search, Trash2, Eye, ShieldOff, ShieldCheck, Users, X, Plus } from 'lucide-react';
import { getAllStudents, createStudent, suspendStudent, deleteStudent, getStudentRegistrations } from '../../services/studentService';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import '../styles/SuperAdminPages.css';

export default function ManageStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingRegs, setViewingRegs] = useState(null);
    const [regs, setRegs] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', rollNo: '', password: '', department: '', year: '' });
    const { addToast } = useToast();

    const fetchStudentsBackground = async () => {
        try {
            const data = await getAllStudents();
            setStudents(data);
        } catch (err) {
            console.error('Failed to update student list:', err);
        }
    };

    const loadStudentsInitial = async () => {
        setLoading(true);
        await fetchStudentsBackground();
        setLoading(false);
    };

    useEffect(() => {
        loadStudentsInitial();

        // Polling every 5s for real-time updates
        const interval = setInterval(fetchStudentsBackground, 5000);

        return () => clearInterval(interval);
    }, []);

    const filtered = students.filter((s) => {
        const nameMatch = (s.name || '').toLowerCase().includes(search.toLowerCase());
        const rollMatch = (s.rollNo || '').toString().toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        return (nameMatch || rollMatch) && matchStatus;
    });

    const openCreateModal = () => {
        setFormData({ name: '', email: '', rollNo: '', password: '', department: '', year: '' });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await createStudent(formData);
        if (res && res.success) {
            addToast('Student created successfully', 'success');
            setModalOpen(false);
            fetchStudentsBackground();
        } else {
            addToast(res?.message || 'Failed to create student', 'error');
        }
    };

    const handleSuspend = async (id) => {
        const updated = await suspendStudent(id);
        addToast(`Student status updated`, 'info');
        fetchStudentsBackground();
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Delete student "${name}"? This cannot be undone.`)) {
            await deleteStudent(id);
            addToast(`Student "${name}" deleted`, 'success');
            fetchStudentsBackground();
        }
    };

    const handleViewRegs = async (student) => {
        const data = await getStudentRegistrations(student.id);
        setRegs(data);
        setViewingRegs(student);
    };

    if (loading) {
        return (
            <div className="sa-page-content">
                <div className="sa-page-header"><h1>Manage Students</h1></div>
                <LoadingSkeleton variant="table" count={6} />
            </div>
        );
    }

    return (
        <div className="sa-page-content">
            <div className="sa-page-header">
                <div>
                    <h1>Manage Students</h1>
                    <p className="sa-muted">{students.length} student{students.length !== 1 ? 's' : ''} total</p>
                </div>
                <button className="primary-btn" onClick={openCreateModal}>
                    <Plus size={18} /> Add Student
                </button>
            </div>

            {/* Filters */}
            <div className="sa-filters-bar">
                <div className="sa-search-box">
                    <Search size={18} />
                    <input type="text" placeholder="Search by name or roll number..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="sa-filter-pills">
                    {['all', 'active', 'suspended'].map((s) => (
                        <button key={s} className={`sa-filter-pill ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <EmptyState icon={Users} title="No students found" message="Try adjusting your search or filter criteria." />
            ) : (
                <div className="sa-card glass">
                    <div className="sa-table-wrapper">
                        <table className="sa-data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th className="sa-hide-sm">Roll No</th>
                                    <th className="sa-hide-md">Department</th>
                                    <th className="sa-hide-md">Year</th>
                                    <th>Status</th>
                                    <th className="sa-text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((student, idx) => (
                                    <tr key={student.id} className="hover-row animate-stagger" style={{ animationDelay: `${idx * 50}ms` }}>
                                        <td>
                                            <div className="sa-user-cell">
                                                <div className="sa-avatar">{student.name.charAt(0)}</div>
                                                <div>
                                                    <span>{student.name}</span>
                                                    <small className="sa-muted sa-show-sm-only">{student.rollNo}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="sa-hide-sm sa-muted">{student.rollNo}</td>
                                        <td className="sa-hide-md sa-muted">{student.department || '—'}</td>
                                        <td className="sa-hide-md sa-muted">{student.year || '—'}</td>
                                        <td>
                                            <span className={`sa-status-badge ${student.status}`}>
                                                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="sa-text-right">
                                            <div className="sa-table-actions">
                                                <button className="ghost-btn sa-compact sa-icon-btn" onClick={() => handleViewRegs(student)} title="View Registrations">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="ghost-btn sa-compact sa-icon-btn" onClick={() => handleSuspend(student.id)} title={student.status === 'active' ? 'Suspend' : 'Activate'}>
                                                    {student.status === 'active' ? <ShieldOff size={16} style={{ color: '#f59e0b' }} /> : <ShieldCheck size={16} style={{ color: '#10b981' }} />}
                                                </button>
                                                <button className="ghost-btn sa-compact sa-icon-btn sa-danger" onClick={() => handleDelete(student.id, student.name)} title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Student Modal */}
            {modalOpen && (
                <div className="sa-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-modal-header">
                            <h3>Create New Student</h3>
                            <button className="sa-modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="sa-modal-form">
                            <div className="sa-form-group">
                                <label>Full Name</label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter name" />
                            </div>
                            <div className="sa-form-row">
                                <div className="sa-form-group">
                                    <label>Email</label>
                                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email" />
                                </div>
                                <div className="sa-form-group">
                                    <label>Roll Number</label>
                                    <input type="text" required value={formData.rollNo} onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })} placeholder="e.g. CS21001" />
                                </div>
                            </div>
                            <div className="sa-form-group">
                                <label>Password</label>
                                <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Set password" />
                            </div>
                            <div className="sa-form-row">
                                <div className="sa-form-group">
                                    <label>Department</label>
                                    <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required>
                                        <option value="">Select Dept</option>
                                        <option value="CSE">CSE</option>
                                        <option value="ECE">ECE</option>
                                        <option value="MECH">MECH</option>
                                        <option value="IT">IT</option>
                                        <option value="CIVIL">CIVIL</option>
                                    </select>
                                </div>
                                <div className="sa-form-group">
                                    <label>Year</label>
                                    <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} required>
                                        <option value="">Select Year</option>
                                        <option value="1st">1st Year</option>
                                        <option value="2nd">2nd Year</option>
                                        <option value="3rd">3rd Year</option>
                                        <option value="4th">4th Year</option>
                                    </select>
                                </div>
                            </div>
                            <div className="sa-modal-actions">
                                <button type="button" className="ghost-btn" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Create Student</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Registrations Modal */}
            {viewingRegs && (
                <div className="sa-modal-overlay" onClick={() => setViewingRegs(null)}>
                    <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-modal-header">
                            <h3>{viewingRegs.name}'s Registrations</h3>
                            <button className="sa-modal-close" onClick={() => setViewingRegs(null)}><X size={20} /></button>
                        </div>
                        <div className="sa-modal-body">
                            {regs.length === 0 ? (
                                <p className="sa-muted" style={{ textAlign: 'center', padding: '24px' }}>No registrations found.</p>
                            ) : (
                                <div className="sa-table-wrapper">
                                    <table className="sa-data-table">
                                        <thead>
                                            <tr>
                                                <th>Event</th>
                                                <th>Registered On</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {regs.map((r) => (
                                                <tr key={r.id}>
                                                    <td>{r.eventTitle}</td>
                                                    <td className="sa-muted">{r.registeredOn}</td>
                                                    <td>
                                                        <span className={`sa-status-badge ${r.status === 'registered' ? 'active' : 'completed'}`}>
                                                            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
