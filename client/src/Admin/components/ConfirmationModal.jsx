import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="sa-modal-overlay">
            <div className="sa-modal-container">
                <div className="sa-modal-header">
                    <h3 className="sa-modal-title">
                        <AlertTriangle className={`sa-modal-icon ${type}`} size={20} />
                        {title}
                    </h3>
                    <button className="sa-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="sa-modal-body">
                    <p>{message}</p>
                </div>
                <div className="sa-modal-footer">
                    <button className="ghost-btn" onClick={onClose}>Cancel</button>
                    <button
                        className={`primary-btn ${type === 'danger' ? 'danger' : ''}`}
                        style={type === 'danger' ? { background: '#ef4444', boxShadow: 'none' } : {}}
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
