/**
 * Toast Notification System
 * Usage: Wrap app in <ToastProvider>, then use const { addToast } = useToast()
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);

const ICONS = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

const TITLES = {
    success: 'Success',
    error: 'Error',
    info: 'Info',
    warning: 'Warning',
};

function ToastItem({ toast, onRemove }) {
    const [exiting, setExiting] = React.useState(false);
    const Icon = ICONS[toast.type] || Info;

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setExiting(true);
            setTimeout(() => onRemove(toast.id), 300);
        }, toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast, onRemove]);

    const handleClose = () => {
        setExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
    };

    return (
        <div className={`toast ${toast.type} ${exiting ? 'exiting' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
            <Icon className="toast-icon" size={22} />
            <div className="toast-body">
                <p className="toast-title">{toast.title || TITLES[toast.type]}</p>
                <p className="toast-message">{toast.message}</p>
            </div>
            <button className="toast-close" onClick={handleClose} aria-label="Close">
                <X size={16} />
            </button>
            <div className="toast-progress" style={{ animationDuration: `${toast.duration || 4000}ms` }} />
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', options = {}) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type, ...options }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
