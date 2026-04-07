/**
 * NotificationDropdown — SuperAdmin notification panel.
 * Shows pending event approval requests with approve/reject actions.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X as XIcon, Clock, Calendar, MapPin, Tag, User, CheckCheck } from 'lucide-react';
import {
    getNotifications,
    getUnreadCount,
    markAllAsRead,
    setNotificationAction,
    subscribeNotifications,
} from '../../services/notificationService';
import { approveEvent, rejectEvent, notifyEventListeners } from '../../services/eventService';
import '../styles/NotificationDropdown.css';

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function getCategoryColor(category) {
    const map = {
        technical: '#6366f1',
        workshop: '#f59e0b',
        cultural: '#ec4899',
        sports: '#10b981',
        seminar: '#8b5cf6',
    };
    return map[(category || '').toLowerCase()] || '#6366f1';
}

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [actionLoading, setActionLoading] = useState(null);
    const dropdownRef = useRef(null);

    // Load notifications
    const loadNotifications = async () => {
        const data = await getNotifications();
        setItems(data);
        setUnreadCount(getUnreadCount(data));
    };

    useEffect(() => {
        loadNotifications();
        const unsub = subscribeNotifications(() => loadNotifications());

        // Polling fallback
        const interval = setInterval(loadNotifications, 30000);

        return () => {
            unsub();
            clearInterval(interval);
        }
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleApprove = async (notif) => {
        setActionLoading(notif.id);
        try {
            const res = await approveEvent(notif.event_id || notif.eventId);
            if (res && res.success !== false) {
                await setNotificationAction(notif.id, 'approved');
                notifyEventListeners();
                await loadNotifications();
            } else {
                console.error('approveEvent failed:', res);
            }
        } catch (err) {
            console.error('Failed to approve:', err);
        }
        setActionLoading(null);
    };

    const handleReject = async (notif) => {
        setActionLoading(notif.id);
        try {
            const res = await rejectEvent(notif.event_id || notif.eventId);
            if (res && res.success !== false) {
                await setNotificationAction(notif.id, 'rejected');
                notifyEventListeners();
                await loadNotifications();
            } else {
                console.error('rejectEvent failed:', res);
            }
        } catch (err) {
            console.error('Failed to reject:', err);
        }
        setActionLoading(null);
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        await loadNotifications();
    };

    return (
        <div className="notif-wrapper" ref={dropdownRef}>
            <button
                type="button"
                className="navbar-icon-btn notification-btn"
                aria-label="Notifications"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            <div className={`notif-dropdown ${isOpen ? 'show' : ''}`}>
                {/* Header */}
                <div className="notif-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && (
                        <button className="notif-mark-all" onClick={handleMarkAllRead}>
                            <CheckCheck size={14} />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="notif-list">
                    {items.length === 0 ? (
                        <div className="notif-empty">
                            <Bell size={32} />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        items.map((notif) => (
                            <div
                                key={notif.id}
                                className={`notif-item ${notif.status === 'unread' && !notif.action_taken ? 'unread' : ''} ${notif.action_taken ? 'actioned' : ''}`}
                            >
                                {/* Category indicator */}
                                <div
                                    className="notif-indicator"
                                    style={{ background: getCategoryColor(notif.category) }}
                                />

                                <div className="notif-body">
                                    <div className="notif-top-row">
                                        <span className="notif-event-title">{notif.event_title || notif.title}</span>
                                        <span className="notif-time">
                                            <Clock size={12} />
                                            {timeAgo(notif.created_at || notif.createdAt || new Date())}
                                        </span>
                                    </div>

                                    <div className="notif-details">
                                        <span className="notif-detail">
                                            <User size={13} />
                                            {notif.organizer}
                                        </span>
                                        <span className="notif-detail">
                                            <Tag size={13} />
                                            {notif.category}
                                        </span>
                                        <span className="notif-detail">
                                            <Calendar size={13} />
                                            {notif.event_date ? new Date(notif.event_date).toLocaleDateString() : 'TBD'}
                                        </span>
                                        <span className="notif-detail">
                                            <MapPin size={13} />
                                            {notif.venue}
                                        </span>
                                    </div>

                                    {/* Actions or status badge */}
                                    {notif.action_taken ? (
                                        <div className={`notif-action-badge ${notif.action_taken}`}>
                                            {notif.action_taken === 'approved' ? (
                                                <><Check size={14} /> Approved</>
                                            ) : (
                                                <><XIcon size={14} /> Rejected</>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="notif-actions">
                                            <button
                                                className="notif-approve-btn"
                                                onClick={() => handleApprove(notif)}
                                                disabled={actionLoading === notif.id}
                                            >
                                                <Check size={14} />
                                                Approve
                                            </button>
                                            <button
                                                className="notif-reject-btn"
                                                onClick={() => handleReject(notif)}
                                                disabled={actionLoading === notif.id}
                                            >
                                                <XIcon size={14} />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
