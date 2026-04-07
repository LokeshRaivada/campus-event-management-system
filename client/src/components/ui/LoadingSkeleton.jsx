/**
 * LoadingSkeleton — reusable loading placeholder component.
 * Variants: 'card', 'table', 'stat', 'text'
 */
import React from 'react';

const shimmerStyle = {
    background: 'linear-gradient(90deg, var(--skeleton-base, #e2e8f0) 25%, var(--skeleton-shine, #f1f5f9) 50%, var(--skeleton-base, #e2e8f0) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
    borderRadius: '8px',
};

function SkeletonBlock({ width = '100%', height = '16px', style = {} }) {
    return <div style={{ ...shimmerStyle, width, height, ...style }} />;
}

export default function LoadingSkeleton({ variant = 'card', count = 1 }) {
    const items = Array.from({ length: count }, (_, i) => i);

    if (variant === 'stat') {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {items.map((i) => (
                    <div key={i} style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border, #e2e8f0)', background: 'var(--card, #fff)' }}>
                        <SkeletonBlock width="40px" height="40px" style={{ borderRadius: '12px', marginBottom: '12px' }} />
                        <SkeletonBlock width="60%" height="12px" style={{ marginBottom: '8px' }} />
                        <SkeletonBlock width="40%" height="24px" style={{ marginBottom: '8px' }} />
                        <SkeletonBlock width="50%" height="10px" />
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'table') {
        return (
            <div style={{ borderRadius: '12px', border: '1px solid var(--border, #e2e8f0)', overflow: 'hidden' }}>
                <div style={{ padding: '16px', display: 'flex', gap: '16px', background: 'var(--hover, rgba(0,0,0,0.02))' }}>
                    {[20, 30, 20, 15, 15].map((w, i) => (
                        <SkeletonBlock key={i} width={`${w}%`} height="14px" />
                    ))}
                </div>
                {items.map((i) => (
                    <div key={i} style={{ padding: '16px', display: 'flex', gap: '16px', borderTop: '1px solid var(--border, #e2e8f0)' }}>
                        {[20, 30, 20, 15, 15].map((w, j) => (
                            <SkeletonBlock key={j} width={`${w}%`} height="14px" />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'text') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((i) => (
                    <SkeletonBlock key={i} width={`${70 + Math.random() * 30}%`} height="14px" />
                ))}
            </div>
        );
    }

    /* card variant (default) */
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {items.map((i) => (
                <div key={i} style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border, #e2e8f0)', background: 'var(--card, #fff)' }}>
                    <SkeletonBlock width="100%" height="140px" style={{ marginBottom: '16px', borderRadius: '12px' }} />
                    <SkeletonBlock width="70%" height="16px" style={{ marginBottom: '10px' }} />
                    <SkeletonBlock width="100%" height="12px" style={{ marginBottom: '6px' }} />
                    <SkeletonBlock width="60%" height="12px" />
                </div>
            ))}
        </div>
    );
}

/* Inject shimmer keyframe once */
if (typeof document !== 'undefined' && !document.getElementById('skeleton-styles')) {
    const style = document.createElement('style');
    style.id = 'skeleton-styles';
    style.textContent = `
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .theme-dark {
      --skeleton-base: #2d3748;
      --skeleton-shine: #4a5568;
    }
  `;
    document.head.appendChild(style);
}
