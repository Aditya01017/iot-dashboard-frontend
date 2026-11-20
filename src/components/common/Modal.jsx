// reusable popup box. clicking the dark background closes it.
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100
      }}
    >
      {/* stopPropagation so clicking inside the box doesnt close it */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'white', padding: '30px', borderRadius: '8px', minWidth: '400px', maxWidth: '90%' }}
      >
        {title && <h2 style={{ marginTop: 0 }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
