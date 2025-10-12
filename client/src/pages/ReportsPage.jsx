// client/src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { MdAssessment } from 'react-icons/md';
import ReportModal from '../components/reports/ReportModal';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    apiClient.get('/reports/my')
      .then(res => setReports(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando informes...</div>;

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Informes Power BI</h1>
        <p className="text-gray-500 mt-2">Haz clic en un informe para visualizarlo.</p>
      </div>

      {reports.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map(report => (
            <div key={report.id} onClick={() => setSelectedReport(report)} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl cursor-pointer transition-shadow">
              <MdAssessment className="text-4xl text-macrosad-pink mb-4" />
              <h3 className="font-bold text-lg text-text-dark">{report.title}</h3>
              <p className="text-sm text-text-light mt-2">{report.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-center text-text-light">No tienes informes asignados.</p>
      )}

      {selectedReport && <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </>
  );
};
export default ReportsPage;