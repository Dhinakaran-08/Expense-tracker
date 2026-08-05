export default function Card({ children, className = '', hover = true, onClick }) {
  return (
    <div
      className={`p-6 ${hover ? 'cursor-default' : ''} ${className}`}
      onClick={onClick}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {children}
    </div>
  );
}
