import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl';
  disableContentPadding?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg', disableContentPadding = false }) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (modal) {
      if (isOpen) {
        modal.showModal();
      } else {
        modal.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const modal = modalRef.current;
    if (modal) {
      const handleCancel = (e: Event) => {
        e.preventDefault();
        onClose();
      };
      modal.addEventListener('cancel', handleCancel);
      return () => modal.removeEventListener('cancel', handleCancel);
    }
  }, [onClose]);


  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl'
  };

  return (
    <dialog ref={modalRef} className="modal">
      <div className={`modal-box ${sizeClasses[size]}`}>
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>✕</button>
        </form>
        <h3 className="font-bold text-lg">{title}</h3>
        <div className={`overflow-y-auto ${disableContentPadding ? 'mt-4' : 'py-4'}`}>
          {children}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default Modal;