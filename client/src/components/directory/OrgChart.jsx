// client/src/components/directory/OrgChart.jsx
import React, { useMemo } from 'react';
import apiClient from '../../services/api';

const OrgUserCard = ({ user }) => {
    const getAvatarUrl = (path) => path ? `${apiClient.defaults.baseURL.replace('/api', '')}${path}` : null;
    const avatarSrc = getAvatarUrl(user.avatar_url);
    const positionTitle = user.position_name || 'Puesto no asignado';

    return (
        <div className="flex flex-col items-center text-center w-36">
            <img
                src={avatarSrc || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=6c3b5d&color=fff`}
                alt={user.first_name}
                className="w-16 h-16 rounded-full object-cover mb-2 shadow-lg"
            />
            <p className="font-bold text-sm text-gray-800">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-gray-500">{positionTitle}</p>
        </div>
    );
};

const OrgChart = ({ users, departments, areas, divisions, positions }) => { // <-- Recibe `positions`

    const orgData = useMemo(() => {
        const departmentMap = new Map(departments.map(dept => [dept.id, dept]));
        const areaMap = new Map(areas.map(area => [area.id, area]));
        const divisionMap = new Map(divisions.map(div => [div.id, div]));
        const positionMap = new Map(positions.map(pos => [pos.id, pos])); // <-- Mapa de Puestos
        const data = {};

        // 1. Agrupación inicial (sin ordenar)
        users.forEach(user => {
            let finalAreaId = user.area_id;
            if (!finalAreaId && user.departments?.length > 0) {
                const department = departmentMap.get(user.departments[0].id);
                if (department) finalAreaId = department.area_id;
            }
            
            let finalDivisionId = null;
            let areaName = 'Sin Área Asignada';
            if (finalAreaId) {
                const area = areaMap.get(finalAreaId);
                if (area) {
                    areaName = area.name;
                    finalDivisionId = area.division_id;
                }
            }
            const division = divisionMap.get(finalDivisionId);
            const divisionName = division ? division.name : 'Sin División';

            if (!data[divisionName]) data[divisionName] = {};
            if (!data[divisionName][areaName]) data[divisionName][areaName] = { users: [], departments: {} };

            if (!user.departments || user.departments.length === 0) {
                data[divisionName][areaName].users.push(user);
            } else {
                user.departments.forEach(dept => {
                    if (!data[divisionName][areaName].departments[dept.name]) {
                        data[divisionName][areaName].departments[dept.name] = [];
                    }
                    data[divisionName][areaName].departments[dept.name].push(user);
                });
            }
        });
        
        // 2. Ordenación jerárquica final
        const sortedData = {};
        const sortUsers = (userArray) => {
            userArray.sort((a, b) => {
                const posA = positionMap.get(a.position_id);
                const posB = positionMap.get(b.position_id);
                const orderA = posA ? posA.order_index : 100;
                const orderB = posB ? posB.order_index : 100;
                if (orderA === orderB) {
                    return (a.order_index || 100) - (b.order_index || 100);
                }
                return orderA - orderB;
            });
        };

        Object.keys(data).sort((a, b) => {
            const divA = divisions.find(d => d.name === a);
            const divB = divisions.find(d => d.name === b);
            return (divA?.order_index || 100) - (divB?.order_index || 100);
        }).forEach(divisionName => {
            sortedData[divisionName] = {};
            const areasData = data[divisionName];
            Object.keys(areasData).sort((a, b) => {
                const areaA = areas.find(ar => ar.name === a);
                const areaB = areas.find(ar => ar.name === b);
                return (areaA?.order_index || 100) - (areaB?.order_index || 100);
            }).forEach(areaName => {
                const areaContent = areasData[areaName];
                
                sortUsers(areaContent.users);

                const sortedDepts = {};
                Object.keys(areaContent.departments).sort((a, b) => {
                    const deptA = departments.find(d => d.name === a);
                    const deptB = departments.find(d => d.name === b);
                    return (deptA?.order_index || 100) - (deptB?.order_index || 100);
                }).forEach(deptName => {
                    const deptUsers = areaContent.departments[deptName];
                    sortUsers(deptUsers);
                    sortedDepts[deptName] = deptUsers;
                });
                
                sortedData[divisionName][areaName] = {
                    users: areaContent.users,
                    departments: sortedDepts
                };
            });
        });
        
        return sortedData;
    }, [users, departments, areas, divisions, positions]);

    return (
        <div className="space-y-12">
            {Object.entries(orgData).map(([divisionName, areasData]) => (
                <section key={divisionName} className="bg-gray-50 p-4 sm:p-8 rounded-xl">
                    <h1 className="text-3xl font-bold text-macrosad-purple text-center mb-8 pb-4 border-b-2 border-macrosad-purple/20">{divisionName}</h1>
                    <div className="space-y-10">
                        {Object.entries(areasData).map(([areaName, areaContent]) => (
                            <div key={areaName} className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold text-macrosad-pink mb-6">{areaName}</h2>
                                {areaContent.users.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 mb-6">
                                        {areaContent.users.map(user => <OrgUserCard key={user.id} user={user} />)}
                                    </div>
                                )}
                                {Object.keys(areaContent.departments).length > 0 && (
                                    <div className="space-y-6">
                                        {Object.entries(areaContent.departments).map(([deptName, deptUsers]) => (
                                            <div key={deptName} className="bg-slate-50 p-4 rounded-lg border-l-4 border-macrosad-pink">
                                                <h3 className="font-bold text-gray-700 mb-4">{deptName}</h3>
                                                <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
                                                    {deptUsers.map(user => <OrgUserCard key={user.id} user={user} />)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default OrgChart;