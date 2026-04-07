/**
 * ManageClubs — SuperAdmin page for club management.
 */
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Users } from 'lucide-react';
import { getAllClubs, createClub, updateClub, deleteClub } from '../../services/clubService';
import { getAllAdmins } from '../../services/adminService';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import '../styles/SuperAdminPages.css';

export default function ManageClubs() {
    const [clubs, setClubs] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClub, setEditingClub] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', admin_id: '', category: 'Club' });
    const { addToast } = useToast();

    const fetchClubsBackground = async () => {
        const [clubsData, adminsData] = await Promise.all([getAllClubs(), getAllAdmins()]);
        setClubs(clubsData);
        setAdmins(adminsData);
    };

    const loadDataInitial = async () => {
        setLoading(true);
        await fetchClubsBackground();
        setLoading(false);
    };

    useEffect(() => {
        loadDataInitial();
        
        // Polling every 5s for real-time
        const interval = setInterval(fetchClubsBackground, 5000);

        return () => clearInterval(interval);
    }, []);

    const filtered = clubs.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.admin_name || '').toLowerCase().includes(search.toLowerCase())
    );
    const openCreateModal = () => {
        setEditingClub(null);
        setFormData({ name: '', description: '', admin_id: '', category: 'Club' });
        setModalOpen(true);
    };

    const openEditModal = (club) => {
        setEditingClub(club);
        setFormData({ name: club.name, description: club.description || '', admin_id: club.admin_id || '', category: club.category || 'Club' });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClub) {
                await updateClub(editingClub.id, formData);
                addToast('Club updated successfully', 'success');
            } else {
                await createClub(formData);
                addToast('Club created successfully', 'success');
            }
            setModalOpen(false);
            fetchClubsBackground();
        } catch (err) {
            addToast('Operation failed', 'error');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Delete club "${name}"?`)) {
            await deleteClub(id);
            addToast(`Club "${name}" deleted`, 'success');
            fetchClubsBackground();
        }
    };

    if (loading) {
        return (
            <div className="sa-page-content">
                <div className="sa-page-header"><h1>Manage Clubs</h1></div>
                <LoadingSkeleton variant="table" count={5} />
            </div>
        );
    }

    return (
        <div className="sa-page-content">
            <div className="sa-page-header">
                <div>
                    <h1>Manage Clubs</h1>
                    <p className="sa-muted">{clubs.length} clubs total</p>
                </div>
                <button className="primary-btn" onClick={openCreateModal}>
                    <Plus size={18} /> Add Club
                </button>
            </div>

            <div className="sa-filters-bar">
                <div className="sa-search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search clubs or admins..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No clubs found"
                    message={search ? 'Try adjusting your search.' : 'Start by adding your first club.'}
                    action={!search ? openCreateModal : undefined}
                    actionLabel="Add Club"
                />
            ) : (
                <div className="sa-card glass">
                    <div className="sa-table-wrapper">
                        <table className="sa-data-table">
                            <thead>
                                <tr>
                                    <th>Club Name</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Assigned Admin</th>
                                    <th className="sa-text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((club, idx) => (
                                    <tr key={club.id} className="hover-row animate-stagger" style={{ animationDelay: `${idx * 50}ms` }}>
                                        <td><strong>{club.name}</strong></td>
                                        <td><span className={`sa-pill ${club.category?.includes('Body') ? 'sa-pill-info' : 'sa-pill-primary'}`}>{club.category}</span></td>
                                        <td className="sa-muted">{club.description || 'No description'}</td>
                                        <td>
                                            {club.admin_name ? (
                                                <span className="sa-pill sa-pill-soft">{club.admin_name}</span>
                                            ) : (
                                                <span className="sa-muted">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="sa-text-right">
                                            <div className="sa-table-actions">
                                                <button className="ghost-btn sa-compact sa-icon-btn" onClick={() => openEditModal(club)} title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="ghost-btn sa-compact sa-icon-btn sa-danger" onClick={() => handleDelete(club.id, club.name)} title="Delete">
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

            {modalOpen && (
                <div className="sa-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-modal-header">
                            <h3>{editingClub ? 'Edit Club' : 'Create Club'}</h3>
                            <button className="sa-modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="sa-modal-form">
                            <div className="sa-form-row">
                                <div className="sa-form-group">
                                    <label>Club Name</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter club name" />
                                </div>
                                <div className="sa-form-group">
                                    <label>Category</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                        <option value="Club">Club</option>
                                        <option value="Professional Body">Professional Body</option>
                                    </select>
                                </div>
                            </div>
                            <div className="sa-form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter club description"
                                    rows="3"
                                />
                            </div>
                            <div className="sa-form-group">
                                <label>Assign Admin</label>
                                <select value={formData.admin_id} onChange={(e) => setFormData({ ...formData, admin_id: e.target.value })}>
                                    <option value="">Select an admin</option>
                                    {admins.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sa-modal-actions">
                                <button type="button" className="ghost-btn" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">{editingClub ? 'Save Changes' : 'Create Club'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
