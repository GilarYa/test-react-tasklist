export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-actions">
                    <button className="btn btn-ghost" onClick={onCancel}>
                        Batal
                    </button>
                    <button className="btn btn-danger" onClick={onConfirm}>
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}
