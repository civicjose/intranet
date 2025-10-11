// client/src/components/admin/ConfirmationModal.jsx
import React from 'react';
import { MdWarning } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';

const ConfirmationModal = ({ title, message, onConfirm, onClose, isLoading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <MdWarning className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-5">{title}</h3>
          <p className="text-sm text-gray-500 mt-2">{message}</p>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-center space-x-4 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="bg-white border border-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 flex items-center disabled:opacity-50"
          >
            {isLoading && <FaSpinner className="animate-spin mr-2" />}
            {isLoading ? 'Borrando...' : 'Confirmar Borrado'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;