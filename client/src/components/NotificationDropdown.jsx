import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, CheckCircle2, XCircle, AlertCircle, CheckCheck } from 'lucide-react';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from '../services/notificationService';
import { subscribeToNotifications } from '../services/socketService';
import '../SuperAdmin/styles/NotificationDropdown.css';

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

function isToday(dateStr) {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
}
export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const loadNotifications = async () => {
        const data = await getNotifications();
        setItems(data);
        setUnreadCount(getUnreadCount(data));
    };

    useEffect(() => {
        loadNotifications();
        
        // Instant updates via Socket.IO
        subscribeToNotifications((newNotif) => {
            setItems(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        // Backup polling (less frequent, e.g. 30s)
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        await loadNotifications();
    };

    const handleNotifClick = async (notif) => {
        if (notif.status === 'PENDING') {
            await markAsRead(notif.id);
            setItems(prev => prev.map(n => n.id === notif.id ? { ...n, status: 'READ' } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setIsOpen(false);
        if (notif.event_id) {
            navigate(`/events/${notif.event_id}`);
        }
    };

    const { todayItems, earlierItems } = React.useMemo(() => ({
        todayItems: items.filter(n => isToday(n.created_at)),
        earlierItems: items.filter(n => !isToday(n.created_at))
    }), [items]);

    const getIcon = (type) => {
        switch (type) {
            case 'EVENT_APPROVED': return <CheckCircle2 size={16} className="text-success" />;
            case 'EVENT_REJECTED': return <XCircle size={16} className="text-danger" />;
            case 'EVENT_CREATED': return <AlertCircle size={16} className="text-info" />;
            default: return <Bell size={16} />;
        }
    };

    const renderItems = (list) => list.map((notif) => (
        <div 
            key={notif.id} 
            className={`notif-item ${notif.status === 'PENDING' ? 'unread' : ''}`}
            onClick={() => handleNotifClick(notif)}
        >
            <div className="notif-icon-box">
                {getIcon(notif.type)}
            </div>
            <div className="notif-body">
                <div className="notif-top-row">
                    <span className="notif-title">{notif.title || 'Notification'}</span>
                    <span className="notif-time">
                        <Clock size={10} /> {timeAgo(notif.created_at)}
                    </span>
                </div>
                <p className="notif-message">{notif.message}</p>
            </div>
        </div>
    ));

    return (
        <div className="notif-wrapper" ref={dropdownRef}>
            <button
                type="button"
                className="navbar-icon-btn notification-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            <div className={`notif-dropdown ${isOpen ? 'show' : ''}`}>
                <div className="notif-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && (
                        <button className="notif-mark-all" onClick={handleMarkAllRead}>
                            <CheckCheck size={14} /> Mark all read
                        </button>
                    )}
                </div>

                <div className="notif-list sa-scrollbar">
                    {items.length === 0 ? (
                        <div className="notif-empty">
                            <Bell size={32} />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <>
                            {todayItems.length > 0 && <div className="notif-section-label">Today</div>}
                            {renderItems(todayItems)}
                            {earlierItems.length > 0 && <div className="notif-section-label">Earlier</div>}
                            {renderItems(earlierItems)}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
