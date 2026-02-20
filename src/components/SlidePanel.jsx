export default function SlidePanel({ title, onClose, children }) {
    return (
        <div className="slide-panel">
            <div className="slide-panel-header">
                <h2>{title}</h2>
                <button className="btn-icon" onClick={onClose} style={{ fontSize: '1.2rem' }}>
                    ✕
                </button>
            </div>
            <div className="slide-panel-body">
                {children}
            </div>
        </div>
    );
}
