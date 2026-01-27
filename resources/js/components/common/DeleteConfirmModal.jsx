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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* MODAL CONTENT */}
      <div className="w-[90%] max-w-[400px] animate-[modalSlideIn_0.3s_ease-out] rounded-2xl bg-white p-8 text-center shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
        {/* WARNING ICON */}
        <div className="mx-auto mb-5 flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-red-200 bg-red-50 text-[30px] text-red-500">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        {/* TITLE */}
        <h2 className="mb-2 text-2xl font-semibold text-neutral-900">
          Are you sure?
        </h2>

        {/* DESCRIPTION */}
        <p className="mb-1 leading-relaxed text-neutral-600">
          You are about to delete{" "}
          <span className="font-bold">{schoolName}</span>.
        </p>

        <p className="text-sm font-semibold text-red-500">
          This action cannot be undone.
        </p>

        {/* FOOTER */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-200"
          >
            Keep Record
          </button>

          <button
            onClick={onDelete}
            className="flex-1 rounded-lg bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 hover:shadow-[0_4px_12px_rgba(255,77,79,0.3)] cursor-pointer"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
