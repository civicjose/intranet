// client/src/pages/admin/organization/LocationManagement.jsx
import React, { useState, useEffect } from "react";
import apiClient from "../../../services/api";
import { MdEdit, MdDelete } from "react-icons/md";
import ConfirmationModal from "../../../components/admin/ConfirmationModal";
import ErrorMessage from "../../../components/ErrorMessage";
import LocationModal from "../../../components/admin/organization/LocationModal";

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await apiClient.get("/locations");
      setLocations(data);
    } catch (err) {
      setError("No se pudo cargar la lista de ubicaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (item = null) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const handleSave = async (data) => {
    try {
      if (data.id) {
        await apiClient.put(`/locations/${data.id}`, data);
      } else {
        await apiClient.post("/locations", data);
      }
      handleCloseModal();
      fetchData();
    } catch (err) { throw err; }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsSaving(true);
    try {
      await apiClient.delete(`/locations/${selectedItem.id}`);
      handleCloseModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo borrar la ubicación.");
      handleCloseModal();
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) return <div>Cargando ubicaciones...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-700">Listado de Ubicaciones</h3>
        <button onClick={() => handleOpenModal()} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-transform active:scale-95 w-full sm:w-auto">
          + Añadir Ubicación
        </button>
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
      
      {/* --- VISTA DE TABLA PARA ESCRITORIO --- */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localidad</th>
              <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locations.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-semibold text-text-dark">{item.name}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                    item.type === 'sede' 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-teal-100 text-teal-800'
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.city}, {item.province}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button onClick={() => handleOpenModal(item)} className="text-indigo-600 hover:text-indigo-900"><MdEdit size={22} /></button>
                  <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-900"><MdDelete size={22} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- VISTA DE TARJETAS PARA MÓVIL --- */}
      <div className="md:hidden grid grid-cols-1 gap-4">
          {locations.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-text-dark break-all pr-4">{item.name}</span>
                      <div className="flex space-x-3 flex-shrink-0">
                          <button onClick={() => handleOpenModal(item)} className="text-indigo-600 hover:text-indigo-900"><MdEdit size={22} /></button>
                          <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-900"><MdDelete size={22} /></button>
                      </div>
                  </div>
                  <div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${ item.type === 'sede' ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800' }`}>
                          {item.type}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">{item.city}, {item.province}</p>
                  </div>
              </div>
          ))}
      </div>

      {isModalOpen && <LocationModal location={selectedItem} onSave={handleSave} onClose={handleCloseModal} />}
      {isDeleteModalOpen && <ConfirmationModal title="Confirmar Borrado" message={`¿Eliminar la ubicación "${selectedItem?.name}"?`} onConfirm={handleConfirmDelete} onClose={handleCloseModal} isLoading={isSaving} />}
    </div>
  );
};

export default LocationManagement;