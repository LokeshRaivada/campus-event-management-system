import React from 'react';
// import '../styles/StatCard.css'; // Deprecated

const StatCard = ({ title, value, icon, tone = "primary", subtitle = "Overview" }) => {
    return (
        <div className={`sa-stat-card ${tone} hover-gradient-border`}>
            <div className="sa-stat-icon">
                {/* 
                   SuperAdmin uses <i> with font-awesome classes. 
                   Admin uses lucide-react components passed as 'icon' prop.
                   We can just render the icon component directly.
                   sa-stat-icon styles (grid place-items center) should center it correctly.
                */}
                {icon}
            </div>
            <div>
                <p className="sa-stat-title">{title}</p>
                <h3 className="sa-stat-value">{value}</h3>
                <p className="sa-stat-subtitle">{subtitle}</p>
            </div>
        </div>
    );
};

export default StatCard;
