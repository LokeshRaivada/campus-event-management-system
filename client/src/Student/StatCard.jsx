const StatCard = ({ title, value, subtitle, accent }) => {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className={`stat-accent ${accent || ''}`}></div>
        <h4>{title}</h4>
      </div>
      <div className="stat-value">{value}</div>
      <p className="stat-sub">{subtitle}</p>
    </div>
  );
};

export default StatCard;
