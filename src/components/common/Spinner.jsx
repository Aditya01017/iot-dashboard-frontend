// little loading spinner
const Spinner = ({ text = 'Loading...' }) => {
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
      <div style={{
        width: '28px',
        height: '28px',
        margin: '0 auto 12px',
        border: '3px solid #e0e0e0',
        borderTopColor: '#4f46e5',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      {text}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Spinner;
