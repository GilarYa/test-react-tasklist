export default function Toast({ type, message }) {
    return (
        <div className="toast-container">
            <div className={`toast toast-${type}`}>
                {type === 'success' ? '✅' : '❌'} {message}
            </div>
        </div>
    );
}
