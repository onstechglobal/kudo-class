import React from "react";
import { AlertTriangle } from "lucide-react";

const DeleteConfirmModal = ({
  isOpen,
  schoolName = "Test School (S001)",
  onClose,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[1000] flex items-start justify-center bg-black/40 backdrop-blur-sm">
      
      {/* MODAL CONTENT */}
      {/* Using 'sticky' or 'mt-20' here helps keep it visible if the content is long */}
      <div className="sticky top-20 w-[90%] max-w-[400px] animate-[modalSlideIn_0.3s_ease-out] rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-5 flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-red-200 bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        <h2 className="mb-2 text-2xl font-semibold text-neutral-900">Are you sure?</h2>
        <p className="mb-1 text-neutral-600">
          Deleting <span className="font-bold">{schoolName}</span>
        </p>
        
        <div className="mt-8 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-lg bg-neutral-100 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-200">
            Keep Record
          </button>
          <button onClick={onDelete} className="flex-1 rounded-lg bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-600">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
