import React from 'react';
import '@/styles/modal-common.css';

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = '600px',
    className = ''
}) {
    if (!isOpen) return null;

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div
                className="modalContent"
                style={{ maxWidth }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modalHeader">
                    <h3>{title}</h3>
                    <button className="modalClose" onClick={onClose}>×</button>
                </div>
                <div className={`modalBody ${className}`}>
                    {children}
                </div>
                {footer && (
                    <div className="modalFooter">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
