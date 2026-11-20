// reusable button so i dont repeat the same styles everywhere
const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled, style }) => {
  const colors = {
    primary: '#4f46e5',
    danger: '#ef4444',
    success: '#10b981',
    secondary: '#e5e7eb'
  };

  const bg = colors[variant] || colors.primary;
  const textColor = variant === 'secondary' ? '#333' : 'white';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 16px',
        background: bg,
        color: textColor,
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style
      }}
    >
      {children}
    </button>
  );
};

export default Button;
