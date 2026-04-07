import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { createEvent, updateEvent, getEventById } from '../../services/eventService';
import { addEventApprovalNotification } from '../../services/notificationService';
import { useToast } from '../../components/ui/Toast';

const CreateEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const { addToast } = useToast();
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        organizer: '',
        registrationLimit: '',
        category: '',
        poster: null
    });

    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(''); // '' | 'loading' | 'success'

    useEffect(() => {
        if (isEdit) {
            const loadEvent = async () => {
                const event = await getEventById(id);
                if (event) {
                    setFormData({
                        title: event.title || '',
                        description: event.description || '',
                        date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
                        time: event.event_time || '',
                        venue: event.venue || '',
                        organizer: event.organizer || '',
                        registrationLimit: event.registration_limit || '',
                        category: event.category || '',
                        poster: event.poster_url || null
                    });
                }
            };
            loadEvent();
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, poster: file }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title?.trim()) newErrors.title = 'Event title is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';
        if (!formData.venue?.trim()) newErrors.venue = 'Venue is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.registrationLimit) newErrors.registrationLimit = 'Registration limit is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitStatus('loading');
        try {
            const eventPayload = {
                title: formData.title,
                description: formData.description,
                date: formData.date,
                time: formData.time,
                venue: formData.venue,
                organizer: formData.organizer,
                registrationLimit: Number(formData.registrationLimit),
                category: formData.category,
                poster: formData.poster
            };

            if (isEdit) {
                await updateEvent(id, eventPayload);
                addToast('Event updated successfully', 'success');
                setTimeout(() => navigate('/admin/events'), 1500);
            } else {
                const newEvent = await createEvent(eventPayload);
                await addEventApprovalNotification(newEvent);
                addToast('Event created successfully', 'success');
                setSubmitStatus('success');
                setFormData({
                    title: '', description: '', date: '', time: '',
                    venue: '', organizer: '', registrationLimit: '',
                    category: '', poster: null
                });
                setTimeout(() => setSubmitStatus(''), 4000);
            }
        } catch (err) {
            console.error('Failed to submit event:', err);
            addToast('Operation failed', 'error');
            setSubmitStatus('');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        background: 'var(--card-2)',
        color: 'var(--text)',
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.2s'
    };

    return (
        <div className="sa-dashboard-content">
            <div className="sa-card-header" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{isEdit ? 'Edit Event' : 'Create New Event'}</h2>
            </div>

            <div className="sa-card glass" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ padding: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--muted)' }}>Event Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter event title"
                                style={{ ...inputStyle, borderColor: errors.title ? '#ef4444' : 'var(--border)' }}
                            />
                            {errors.title && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.title}</span>}
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--muted)' }}>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter event description"
                                rows="3"
                                style={{ ...inputStyle, resize: 'vertical' }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--muted)' }}>Date *</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                style={{ ...inputStyle, borderColor: errors.date ? '#ef4444' : 'var(--border)' }}
                            />
                            {errors.date && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.date}</span>}
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--muted)' }}>Time *</label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                style={{ ...inputStyle, borderColor: errors.time ? '#ef4444' : 'var(--border)' }}
                            />
                            {errors.time && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.time}</span>}
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--muted)' }}>Venue *</label>
                            <input
                                type="text"
                                name="venue"
                                value={formData.venue}
                                onChange={handleChange}
                                placeholder="Enter venue"
                                style={{ ...inputStyle, borderColor: errors.venue ? '#ef4444' : 'var(--border)' }}
                            />
                            {errors.venue && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.venue}</span>}
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--muted)' }}>Organizer Name</label>
                            <input
                                type="text"
                                name="organizer"
                                value={formData.organizer}
                                onChange={handleChange}
                                placeholder="Enter organizer/club name"
                                style={inputStyle}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--muted)' }}>Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={{ ...inputStyle, borderColor: errors.category ? '#ef4444' : 'var(--border)', cursor: 'pointer' }}
                            >
                                <option value="">Select Category</option>
                                <option value="Technical">Technical</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Sports">Sports</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Seminar">Seminar</option>
                            </select>
                            {errors.category && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.category}</span>}
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--muted)' }}>Registration Limit *</label>
                            <input
                                type="number"
                                name="registrationLimit"
                                value={formData.registrationLimit}
                                onChange={handleChange}
                                placeholder="Max participants"
                                min="1"
                                style={{ ...inputStyle, borderColor: errors.registrationLimit ? '#ef4444' : 'var(--border)' }}
                            />
                            {errors.registrationLimit && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.registrationLimit}</span>}
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--muted)' }}>Event Poster</label>
                            <div className="file-upload-wrapper" style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="poster-upload"
                                    onChange={handleFileChange}
                                    hidden
                                />
                                <label htmlFor="poster-upload" className="file-upload-btn" style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    padding: '40px',
                                    border: '2px dashed var(--border)',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.02)',
                                    transition: 'all 0.2s'
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: '#e0e7ff',
                                        color: '#4f46e5',
                                        display: 'grid',
                                        placeItems: 'center'
                                    }}>
                                        <Upload size={24} />
                                    </div>
                                    <span style={{ fontWeight: '600', color: 'var(--text)' }}>
                                        {formData.poster ? formData.poster.name : 'Click to upload poster image'}
                                    </span>
                                    {!formData.poster && <span style={{ fontSize: '12px', color: 'var(--muted)' }}>SVG, PNG, JPG or GIF (MAX. 800x400px)</span>}
                                </label>
                            </div>
                        </div>
                    </div>

                    {submitStatus === 'success' && (
                        <div style={{
                            padding: '14px 20px', borderRadius: '12px', marginTop: '16px',
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1))',
                            border: '1px solid rgba(16,185,129,0.3)', color: '#059669',
                            fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            ✅ Event submitted for approval! SuperAdmin has been notified.
                        </div>
                    )}

                    <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                        <button type="button" className="ghost-btn" onClick={() => setFormData({
                            title: '', description: '', date: '', time: '',
                            venue: '', organizer: '', registrationLimit: '', category: '', poster: null
                        })}>
                            Reset
                        </button>
                        <button type="submit" className="primary-btn" disabled={submitStatus === 'loading'}>
                            {submitStatus === 'loading' ? 'Submitting...' : isEdit ? 'Save Changes' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;
