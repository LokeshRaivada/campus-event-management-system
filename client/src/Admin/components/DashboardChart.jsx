import React from 'react';

const DashboardChart = () => {
    const data = [
        { label: 'Jan', value: 0 },
        { label: 'Feb', value: 0 },
        { label: 'Mar', value: 0 },
        { label: 'Apr', value: 0 },
        { label: 'May', value: 0 },
        { label: 'Jun', value: 0 },
    ];

    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div style={{ padding: '20px', display: 'flex', alignItems: 'flex-end', gap: '20px', height: '250px' }}>
            {data.map((item, index) => (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, var(--brand), var(--brand-2))',
                            borderRadius: '8px',
                            height: `${(item.value / maxValue) * 100}%`,
                            minHeight: '4px',
                            opacity: 0.85,
                            transition: 'all 0.3s ease'
                        }}
                        title={`${item.value} Events`}
                    ></div>
                    <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '600' }}>{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default DashboardChart;
