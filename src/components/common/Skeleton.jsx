import './skeleton.css';

const Skeleton = ({ width, height, borderRadius, style, variant = 'text' }) => {
  // variants can be 'text', 'circular', or 'rectangular'
  let baseRadius = borderRadius || '4px';
  if (variant === 'circular') baseRadius = '50%';
  if (variant === 'rectangular') baseRadius = '8px';

  return (
    <div
      className="skeleton-loader"
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius: baseRadius,
        ...style,
      }}
    />
  );
};

export default Skeleton;
