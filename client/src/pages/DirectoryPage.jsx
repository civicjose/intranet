// client/src/pages/DirectoryPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../services/api';
import { FaSpinner } from 'react-icons/fa';
import { MdSearch, MdDeviceHub } from 'react-icons/md';
import UserDetailModal from '../components/directory/UserDetailModal';
import OrgChart from '../components/directory/OrgChart';

const UserCard = ({ user, onClick }) => {
    const getAvatarUrl = (path) => path ? `${apiClient.defaults.baseURL.replace('/api', '')}${path}` : null;
    const avatarSrc = getAvatarUrl(user.avatar_url);
    const positionTitle = user.position_name || 'Puesto no asignado';

    return (
        <div 
            onClick={() => onClick(user)}
            className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
        >
            <img
                src={avatarSrc || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=E5007E&color=fff`}
                alt={`${user.first_name} ${user.last_name}`}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
            <div className="overflow-hidden">
                <p className="font-bold text-gray-800 truncate">{user.first_name} {user.last_name}</p>
                <p className="text-sm text-gray-500 truncate">{positionTitle}</p>
            </div>
        </div>
    );
};

const DirectoryPage = () => {
    const [users, setUsers] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [areas, setAreas] = useState([]);
    const [positions, setPositions] = useState([]); // Cargar Puestos
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeTab, setActiveTab] = useState(null);
    const [showOrgChart, setShowOrgChart] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [usersRes, divisionsRes, departmentsRes, areasRes, positionsRes] = await Promise.all([
                    apiClient.get('/users'),
                    apiClient.get('/divisions'),
                    apiClient.get('/departments'),
                    apiClient.get('/areas'),
                    apiClient.get('/positions'), // Cargar Puestos
                ]);
                setUsers(usersRes.data);
                setDivisions(divisionsRes.data);
                setDepartments(departmentsRes.data);
                setAreas(areasRes.data);
                setPositions(positionsRes.data); // Guardar Puestos

                if (divisionsRes.data.length > 0) {
                    setActiveTab(divisionsRes.data[0].id);
                }
            } catch (err) {
                console.error("Error al cargar los datos del directorio:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const groupedUsers = useMemo(() => {
        const departmentMap = new Map(departments.map(dept => [dept.id, dept]));
        const areaMap = new Map(areas.map(area => [area.id, area]));
        const positionMap = new Map(positions.map(pos => [pos.id, pos]));
        const groupedByDivision = {};

        const enrichedUsers = users.map(user => {
            let finalAreaId = user.area_id;
            if (!finalAreaId && user.departments?.length > 0) {
                const department = departmentMap.get(user.departments[0].id);
                if (department) finalAreaId = department.area_id;
            }
            let finalDivisionId = null;
            if (finalAreaId) {
                const area = areaMap.get(finalAreaId);
                if (area) finalDivisionId = area.division_id;
            }
            return { ...user, finalAreaId, finalDivisionId };
        });

        const filteredUsers = searchTerm
            ? enrichedUsers.filter(user => 
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
              )
            : enrichedUsers;
        
        divisions.forEach(division => {
            const usersInDivision = filteredUsers.filter(u => u.finalDivisionId === division.id);
            const groupedByArea = usersInDivision.reduce((acc, user) => {
                const area = areaMap.get(user.finalAreaId);
                const areaName = area ? area.name : 'Sin Área Asignada';
                if (!acc[areaName]) acc[areaName] = [];
                acc[areaName].push(user);
                return acc;
            }, {});

            // Ordenar a los usuarios dentro de cada área según la jerarquía de su puesto
            for (const areaName in groupedByArea) {
                groupedByArea[areaName].sort((a, b) => {
                    const posA = positionMap.get(a.position_id);
                    const posB = positionMap.get(b.position_id);
                    const orderA = posA ? posA.order_index : 100;
                    const orderB = posB ? posB.order_index : 100;

                    if (orderA === orderB) {
                        return (a.order_index || 100) - (b.order_index || 100);
                    }
                    return orderA - orderB;
                });
            }

            groupedByDivision[division.id] = groupedByArea;
        });

        return groupedByDivision;
    }, [users, divisions, departments, areas, positions, searchTerm]);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-macrosad-pink" /></div>;
    }

    const activeTabData = groupedUsers[activeTab] || {};
    const sortedAreaEntries = Object.entries(activeTabData).sort(([areaNameA], [areaNameB]) => {
        const areaA = areas.find(a => a.name === areaNameA);
        const areaB = areas.find(b => b.name === areaNameB);
        if (!areaA) return 1; 
        if (!areaB) return -1;
        return (areaA.order_index || 100) - (areaB.order_index || 100);
    });

    return (
        <>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Directorio de Empleados</h1>
                <p className="text-gray-500 mt-1">Encuentra a tus compañeros de trabajo por división y área.</p>
                <div className="flex flex-wrap gap-4 mt-4">
                    <div className="relative flex-grow max-w-md">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <button
                        onClick={() => setShowOrgChart(!showOrgChart)}
                        className="bg-macrosad-purple text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 flex items-center gap-2"
                    >
                        <MdDeviceHub />
                        {showOrgChart ? 'Ver Directorio' : 'Ver Organigrama'}
                    </button>
                </div>
            </header>

            {showOrgChart ? (
                <OrgChart users={users} departments={departments} areas={areas} divisions={divisions} positions={positions} />
            ) : (
                <>
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                            {divisions.map((division) => (
                                <button
                                    key={division.id}
                                    onClick={() => setActiveTab(division.id)}
                                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm outline-none transition-colors ${
                                    activeTab === division.id
                                        ? 'border-macrosad-pink text-macrosad-pink'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {division.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {sortedAreaEntries.length > 0 ? (
                        sortedAreaEntries.map(([areaName, areaUsers]) => (
                            <section key={areaName} className="mb-10">
                                <h2 className="text-xl font-bold text-gray-700 mb-4 border-l-4 border-macrosad-pink pl-3">{areaName}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {areaUsers.map(user => (
                                        <UserCard key={user.id} user={user} onClick={setSelectedUser} />
                                    ))}
                                </div>
                            </section>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 mt-10">No se encontraron usuarios que coincidan con la búsqueda en esta división.</p>
                    )}
                </>
            )}
            
            {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
        </>
    );
};

export default DirectoryPage;