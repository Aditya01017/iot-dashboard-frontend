import { createElement } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

// A generic SVG icon for empty states (a box/archive icon)
const DefaultIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: '#94a3b8', marginBottom: '16px' }}
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const EmptyState = ({
  icon: Icon = DefaultIcon,
  title = "No data available",
  description = "There is currently no data to display here.",
  actionText,
  actionLink,
  onAction,
}) => {
  const navigate = useNavigate();
  const iconElement = createElement(Icon);

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionLink) {
      navigate(actionLink);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px dashed #cbd5e1',
        margin: '20px 0',
      }}
    >
      {iconElement}
      <h3 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '18px', fontWeight: '600' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px', maxWidth: '400px' }}>
        {description}
      </p>
      {actionText && (
        <Button onClick={handleAction} style={{ minWidth: '150px' }}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
