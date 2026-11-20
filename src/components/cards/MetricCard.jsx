const MetricCard = ({ title, value, color }) => {
  const colors = {
    green: '#10b981',
    red: '#ef4444',
    yellow: '#f59e0b',
    blue: '#4f46e5'
  };

  return (
    <div className="metric-card" style={{
      flex: 1,
      minWidth: '200px',
      backgroundColor: '#ffffff',
      borderLeft: `4px solid ${colors[color] || '#4f46e5'}`,
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'; }}
    >
      <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
        {title}
      </div>
      <div style={{
        fontSize: '36px',
        fontWeight: '700',
        color: colors[color] || '#0f172a',
        lineHeight: '1'
      }}>
        {value}
      </div>
    </div>
  );
};

export default MetricCard;
