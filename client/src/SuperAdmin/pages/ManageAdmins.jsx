/**
 * ManageAdmins — SuperAdmin page for admin user management.
 * Full CRUD with search, filter, modal forms, and status toggle.
 */
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, UserCog } from 'lucide-react';
import { getAllAdmins, createAdmin, updateAdmin, deleteAdmin, toggleAdminStatus } from '../../services/adminService';
import { getAllClubs } from '../../services/clubService';

import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import '../styles/SuperAdminPages.css';

export default function ManageAdmins() {
    const [admins, setAdmins] = useState([]);
    const [clubs, setClubs] = useState([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '', department: '', clubName: '' });
    const { addToast } = useToast();

    const fetchAdminsBackground = async () => {
        const [adminsData, clubsData] = await Promise.all([getAllAdmins(), getAllClubs()]);
        setAdmins(adminsData);
        setClubs(clubsData);
    };

    const loadDataInitial = async () => {
        setLoading(true);
        await fetchAdminsBackground();
        setLoading(false);
    };

    useEffect(() => {
        loadDataInitial();
        
        // Polling every 5s for real-time
        const interval = setInterval(fetchAdminsBackground, 5000);

        return () => clearInterval(interval);
    }, []);

    const filtered = admins.filter((a) => {
        const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const openCreateModal = () => {
        setEditingAdmin(null);
        setFormData({ name: '', email: '', password: '', role: '', department: '', clubName: '' });
        setModalOpen(true);
    };

    const openEditModal = (admin) => {
        setEditingAdmin(admin);
        setFormData({ name: admin.name, email: admin.email, password: '', role: admin.role, department: admin.department, clubName: admin.clubName || '' });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingAdmin) {
            await updateAdmin(editingAdmin.id, formData);
            addToast('Admin updated successfully', 'success');
        } else {
            await createAdmin(formData);
            addToast('Admin created successfully', 'success');
        }
        setModalOpen(false);
        fetchAdminsBackground();
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Delete admin "${name}"? This cannot be undone.`)) {
            await deleteAdmin(id);
            addToast(`Admin "${name}" deleted`, 'success');
            fetchAdminsBackground();
        }
    };

    const handleToggleStatus = async (id) => {
        const updated = await toggleAdminStatus(id);
        addToast(`Admin ${updated.status === 'active' ? 'activated' : 'deactivated'}`, 'info');
        fetchAdminsBackground();
    };

    if (loading) {
        return (
            <div className="sa-page-content">
                <div className="sa-page-header"><h1>Manage Admins</h1></div>
                <LoadingSkeleton variant="table" count={5} />
            </div>
        );
    }

    return (
        <div className="sa-page-content">
            <div className="sa-page-header">
                <div>
                    <h1>Manage Admins</h1>
                    <p className="sa-muted">{admins.length} admin{admins.length !== 1 ? 's' : ''} total</p>
                </div>
                <button className="primary-btn" onClick={openCreateModal}>
                    <Plus size={18} /> Add Admin
                </button>
            </div>

            {/* Filters */}
            <div className="sa-filters-bar">
                <div className="sa-search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="sa-filter-pills">
                    {['all', 'active', 'inactive'].map((s) => (
                        <button
                            key={s}
                            className={`sa-filter-pill ${statusFilter === s ? 'active' : ''}`}
                            onClick={() => setStatusFilter(s)}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <EmptyState
                    icon={UserCog}
                    title="No admins found"
                    message={search ? 'Try adjusting your search or filter criteria.' : 'Start by adding your first admin.'}
                    action={!search ? openCreateModal : undefined}
                    actionLabel="Add Admin"
                />
            ) : (
                <div className="sa-card glass">
                    <div className="sa-table-wrapper">
                        <table className="sa-data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th className="sa-hide-sm">Email</th>
                                    <th className="sa-hide-md">Role</th>
                                    <th className="sa-hide-md">Department</th>
                                    <th className="sa-hide-sm">Club / Body</th>
                                    <th>Status</th>
                                    <th className="sa-text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((admin, idx) => (
                                    <tr key={admin.id} className="hover-row animate-stagger" style={{ animationDelay: `${idx * 50}ms` }}>
                                        <td>
                                            <div className="sa-user-cell">
                                                <div className="sa-avatar">{admin.name.charAt(0)}</div>
                                                <span>{admin.name}</span>
                                            </div>
                                        </td>
                                        <td className="sa-hide-sm sa-muted">{admin.email}</td>
                                        <td className="sa-hide-md"><span className="sa-pill sa-pill-soft">{admin.role}</span></td>
                                        <td className="sa-hide-md sa-muted">{admin.department}</td>
                                        <td className="sa-hide-sm"><span className="sa-pill sa-pill-soft">{admin.clubName || '—'}</span></td>
                                        <td>
                                            <span className={`sa-status-badge ${admin.status}`}>
                                                {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="sa-text-right">
                                            <div className="sa-table-actions">
                                                <button className="ghost-btn sa-compact sa-icon-btn" onClick={() => openEditModal(admin)} title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="ghost-btn sa-compact sa-icon-btn" onClick={() => handleToggleStatus(admin.id)} title={admin.status === 'active' ? 'Deactivate' : 'Activate'}>
                                                    {admin.status === 'active' ? <ToggleRight size={16} style={{ color: '#10b981' }} /> : <ToggleLeft size={16} />}
                                                </button>
                                                <button className="ghost-btn sa-compact sa-icon-btn sa-danger" onClick={() => handleDelete(admin.id, admin.name)} title="Delete">
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

            {/* Modal */}
            {modalOpen && (
                <div className="sa-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-modal-header">
                            <h3>{editingAdmin ? 'Edit Admin' : 'Create Admin'}</h3>
                            <button className="sa-modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="sa-modal-form">
                            <div className="sa-form-group">
                                <label>Full Name</label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter full name" />
                            </div>
                            <div className="sa-form-group">
                                <label>Email</label>
                                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email address" />
                            </div>
                            {!editingAdmin && (
                                <div className="sa-form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Enter password"
                                        autoComplete="new-password"
                                    />
                                </div>
                            )}
                            <div className="sa-form-row">
                                <div className="sa-form-group">
                                    <label>Role</label>
                                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required>
                                        <option value="">Select role</option>
                                        <option value="Lead Admin">Lead Admin</option>
                                        <option value="Event Manager">Event Manager</option>
                                        <option value="Coordinator">Coordinator</option>
                                        <option value="Finance">Finance</option>
                                    </select>
                                </div>
                                <div className="sa-form-group">
                                    <label>Department</label>
                                    <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required>
                                        <option value="">Select dept</option>
                                        <option value="CSE">CSE</option>
                                        <option value="ECE">ECE</option>
                                        <option value="MECH">MECH</option>
                                        <option value="IT">IT</option>
                                        <option value="CIVIL">CIVIL</option>
                                    </select>
                                </div>
                            </div>
                            <div className="sa-form-group">
                                <label>Club / Professional Body</label>
                                <select value={formData.clubName} onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}>
                                    <option value="">None / General Admin</option>
                                    {clubs.map(club => (
                                        <option key={club.id} value={club.name}>{club.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="sa-modal-actions">
                                <button type="button" className="ghost-btn" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">{editingAdmin ? 'Save Changes' : 'Create Admin'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
