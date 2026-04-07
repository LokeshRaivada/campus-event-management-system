/**
 * EmptyState — consistent empty-state component.
 */
import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
    icon: Icon = Inbox,
    title = 'No data found',
    message = 'There are no items to display at the moment.',
    action,
    actionLabel = 'Get Started',
}) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 24px',
                textAlign: 'center',
                borderRadius: '16px',
                border: '1px dashed var(--border, #e2e8f0)',
                background: 'var(--card, #fff)',
            }}
        >
            <div
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, var(--brand, #6366f1) 0%, var(--brand-secondary, #8b5cf6) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    opacity: 0.15,
                }}
            >
                <Icon size={32} style={{ color: 'var(--brand, #6366f1)', opacity: 1 }} />
            </div>
            <h3
                style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--text, #1e293b)',
                    marginBottom: '8px',
                }}
            >
                {title}
            </h3>
            <p
                style={{
                    fontSize: '14px',
                    color: 'var(--muted, #64748b)',
                    maxWidth: '360px',
                    lineHeight: 1.5,
                    marginBottom: action ? '20px' : '0',
                }}
            >
                {message}
            </p>
            {action && (
                <button className="primary-btn" onClick={action}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
