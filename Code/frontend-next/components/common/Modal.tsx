import type { ReactNode } from 'react';

type ModalProps = {
    open: boolean;
    title: ReactNode;
    children: ReactNode;
    onClose: () => void;
};

export default function Modal({ open, title, children, onClose }: ModalProps) {
    if (!open) return null;
    return <div className="modal-backdrop"><div className="modal"><div className="section-title"><h2>{title}</h2><button className="secondary compact-button" onClick={onClose}>Đóng</button></div>{children}</div></div>;
}