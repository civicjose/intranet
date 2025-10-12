// client/src/components/reports/ReportModal.jsx
import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import apiClient from '../../services/api';
import { FaSpinner } from 'react-icons/fa';

const ReportModal = ({ report, onClose }) => {
  const [embedUrl, setEmbedUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (report?.id) {
      setLoadingUrl(true);
      apiClient.get(`/reports/${report.id}/embed-url`)
        .then(res => setEmbedUrl(res.data.url))
        .catch(err => setError(err.response?.data?.message || 'No se pudo cargar el informe.'))
        .finally(() => setLoadingUrl(false));
    }
  }, [report]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-text-dark">{report.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><MdClose size={24} /></button>
        </header>
        <div className="flex-grow bg-gray-100 flex justify-center items-center">
          {loadingUrl && <FaSpinner className="animate-spin text-macrosad-pink text-4xl" />}
          {error && <p className="text-red-500">{error}</p>}
          {embedUrl && !loadingUrl && (
            <iframe
              title={report.title}
              src={embedUrl}
              frameBorder="0"
              allowFullScreen={true}
              className="w-full h-full"
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );
};
export default ReportModal;