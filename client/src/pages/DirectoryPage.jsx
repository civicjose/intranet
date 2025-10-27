// client/src/pages/DirectoryPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import apiClient from "../services/api";
import { FaSpinner } from "react-icons/fa";
import { MdSearch, MdDeviceHub, MdMailOutline } from "react-icons/md";
import UserDetailModal from "../components/directory/UserDetailModal";
import OrgChart from "../components/directory/OrgChart";
import { motion, AnimatePresence } from "framer-motion";

// La tarjeta de usuario no necesita cambios
const UserCard = ({ user, onClick }) => {
  const getAvatarUrl = (path) =>
    path ? `${apiClient.defaults.baseURL.replace("/api", "")}${path}` : null;
  const avatarSrc = getAvatarUrl(user.avatar_url);
  const positionTitle = user.position_name || "Puesto no asignado";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(user)}
      className="bg-white rounded-xl shadow-md p-4 text-center cursor-pointer hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center"
    >
      <img
        src={
          avatarSrc ||
          `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=E5007E&color=fff&size=128&bold=true`
        }
        alt={`${user.first_name} ${user.last_name}`}
        className="w-20 h-20 rounded-full object-cover mb-3 shadow-sm"
      />
      <div className="overflow-hidden w-full">
        <p className="font-bold text-gray-800 truncate text-base">
          {user.first_name} {user.last_name}
        </p>
        <p className="text-sm text-macrosad-pink truncate font-medium">
          {positionTitle}
        </p>
        <a
          href={`mailto:${user.email}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-gray-400 mt-2 inline-flex items-center gap-1 hover:text-macrosad-purple transition-colors"
        >
          <MdMailOutline />
          Contactar
        </a>
      </div>
    </motion.div>
  );
};

const DirectoryPage = () => {
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [areas, setAreas] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [showOrgChart, setShowOrgChart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, divisionsRes, departmentsRes, areasRes, positionsRes] =
          await Promise.all([
            apiClient.get("/users"),
            apiClient.get("/divisions"),
            apiClient.get("/departments"),
            apiClient.get("/areas"),
            apiClient.get("/positions"),
          ]);
        setUsers(usersRes.data);
        setDivisions(divisionsRes.data);
        setDepartments(departmentsRes.data);
        setAreas(areasRes.data);
        setPositions(positionsRes.data);

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

  // --- LÓGICA DE AGRUPACIÓN SIMPLIFICADA ---
  const groupedUsers = useMemo(() => {
    const areaMap = new Map(areas.map((area) => [area.id, area]));
    const positionMap = new Map(positions.map((pos) => [pos.id, pos]));
    const groupedByDivision = {};

    const filteredUsers = searchTerm
      ? users.filter((user) =>
          `${user.first_name} ${user.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      : users;

    divisions.forEach((division) => {
      const groupedByArea = {};

      filteredUsers.forEach((user) => {
        const userArea = areaMap.get(user.area_id);

        // Si el usuario pertenece al área y el área a la división actual, lo agregamos.
        if (userArea && userArea.division_id === division.id) {
          const areaName = userArea.name;
          if (!groupedByArea[areaName]) {
            groupedByArea[areaName] = [];
          }
          groupedByArea[areaName].push(user);
        }
      });

      // Ordenamos los usuarios dentro de cada área por su jerarquía
      Object.values(groupedByArea).forEach((userArray) => {
        userArray.sort((a, b) => {
          const orderA = positionMap.get(a.position_id)?.order_index || 100;
          const orderB = positionMap.get(b.position_id)?.order_index || 100;
          if (orderA === orderB)
            return (a.order_index || 100) - (b.order_index || 100);
          return orderA - orderB;
        });
      });

      groupedByDivision[division.id] = groupedByArea;
    });

    return groupedByDivision;
  }, [users, divisions, areas, positions, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-macrosad-pink" />
      </div>
    );
  }

  const activeTabData = groupedUsers[activeTab] || {};
  const sortedAreaEntries = Object.entries(activeTabData).sort(
    ([areaNameA], [areaNameB]) => {
      const areaA = areas.find((a) => a.name === areaNameA);
      const areaB = areas.find((b) => b.name === areaNameB);
      if (!areaA) return 1;
      if (!areaB) return -1;
      return (areaA.order_index || 100) - (areaB.order_index || 100);
    }
  );

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Directorio de Empleados
        </h1>
        <p className="text-gray-500 mt-1">
          Encuentra a tus compañeros de trabajo por división y área.
        </p>
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="relative flex-grow max-w-lg">
            <MdSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={22}
            />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-macrosad-pink focus:border-macrosad-pink transition-colors"
            />
          </div>
          <button
            onClick={() => setShowOrgChart(!showOrgChart)}
            className="bg-macrosad-purple text-white font-bold py-3 px-5 rounded-lg hover:bg-opacity-90 flex items-center gap-2 transition-transform active:scale-95"
          >
            <MdDeviceHub />
            {showOrgChart ? "Ver Directorio" : "Ver Organigrama"}
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={showOrgChart ? "org-chart" : "directory"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {showOrgChart ? (
            <OrgChart
              users={users}
              departments={departments}
              areas={areas}
              divisions={divisions}
              positions={positions}
            />
          ) : (
            <>
              <div className="border-b border-gray-200 mb-8">
                <nav
                  className="-mb-px flex space-x-6 overflow-x-auto"
                  aria-label="Tabs"
                >
                  {divisions.map((division) => (
                    <button
                      key={division.id}
                      onClick={() => setActiveTab(division.id)}
                      className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-4 font-semibold text-sm outline-none transition-all duration-200 ${
                        activeTab === division.id
                          ? "border-macrosad-pink text-macrosad-purple"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {division.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* --- LÓGICA DE RENDERIZADO SIMPLIFICADA --- */}
              {sortedAreaEntries.length > 0 ? (
                <div className="space-y-12">
                  {sortedAreaEntries.map(([areaName, areaUsers]) => (
                    <section key={areaName}>
                      <h2 className="text-2xl font-bold text-gray-800 mb-5 border-l-4 border-macrosad-pink pl-4">
                        {areaName}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {areaUsers.map((user) => (
                          <UserCard
                            key={user.id}
                            user={user}
                            onClick={setSelectedUser}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 mt-16">
                  No se encontraron usuarios que coincidan con la búsqueda en esta división.
                </p>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default DirectoryPage;
