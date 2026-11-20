// small colored label, used for status and severity
const Badge = ({ text, color = '#888' }) => {
  return (
    <span style={{
      padding: '4px 10px',
      background: color,
      color: 'white',
      borderRadius: '4px',
      fontSize: '12px',
      textTransform: 'capitalize'
    }}>
      {text}
    </span>
  );
};

export default Badge;
