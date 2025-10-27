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

const OrgChart = ({ users, departments, areas, divisions, positions }) => {

    const orgData = useMemo(() => {
        const positionMap = new Map(positions.map(pos => [pos.id, pos]));
        
        const sortUsers = (userArray) => userArray.sort((a, b) => {
            const orderA = positionMap.get(a.position_id)?.order_index || 100;
            const orderB = positionMap.get(b.position_id)?.order_index || 100;
            if (orderA === orderB) return (a.order_index || 100) - (b.order_index || 100);
            return orderA - orderB;
        });

        const hierarchy = divisions.map(division => ({
            ...division,
            areas: areas.filter(area => area.division_id === division.id).map(area => ({
                ...area,
                directMembers: [], // Usuarios directamente en el área
                departments: departments.filter(dept => dept.area_id === area.id).map(dept => ({
                    ...dept,
                    members: [] // Usuarios en el departamento
                }))
            }))
        }));

        users.forEach(user => {
            const userArea = user.area_id ? hierarchy.flatMap(d => d.areas).find(a => a.id === user.area_id) : null;
            
            if (user.departments && user.departments.length > 0) {
                user.departments.forEach(userDept => {
                    for (const division of hierarchy) {
                        for (const area of division.areas) {
                            const dept = area.departments.find(d => d.id === userDept.id);
                            if (dept) {
                                dept.members.push(user);
                                break;
                            }
                        }
                    }
                });
            } else if (userArea) {
                userArea.directMembers.push(user);
            }
        });

        hierarchy.forEach(division => {
            division.areas.forEach(area => {
                sortUsers(area.directMembers);
                area.departments.forEach(dept => sortUsers(dept.members));
                area.departments.sort((a,b) => (a.order_index || 100) - (b.order_index || 100));
            });
            division.areas.sort((a,b) => (a.order_index || 100) - (b.order_index || 100));
        });

        hierarchy.sort((a,b) => (a.order_index || 100) - (b.order_index || 100));

        return hierarchy;
    }, [users, departments, areas, divisions, positions]);

    return (
        <div className="space-y-12">
            {orgData.map(division => (
                <section key={division.id} className="bg-gray-50 p-4 sm:p-8 rounded-xl">
                    <h1 className="text-3xl font-bold text-macrosad-purple text-center mb-8 pb-4 border-b-2 border-macrosad-purple/20">{division.name}</h1>
                    <div className="space-y-10">
                        {division.areas.map(area => (
                            (area.directMembers.length > 0 || area.departments.some(d => d.members.length > 0)) && (
                                <div key={area.id} className="bg-white p-6 rounded-lg shadow-md">
                                    <h2 className="text-xl font-semibold text-macrosad-pink mb-6">{area.name}</h2>
                                    
                                    {/* Miembros transversales del área */}
                                    {area.directMembers.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 mb-6">
                                            {area.directMembers.map(user => <OrgUserCard key={user.id} user={user} />)}
                                        </div>
                                    )}

                                    {/* Departamentos dentro del área */}
                                    {area.departments.length > 0 && (
                                        <div className="space-y-6">
                                            {area.departments.map(dept => (
                                                dept.members.length > 0 && (
                                                    <div key={dept.id} className="bg-slate-50 p-4 rounded-lg border-l-4 border-macrosad-pink">
                                                        <h3 className="font-bold text-gray-700 mb-4">{dept.name}</h3>
                                                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
                                                            {dept.members.map(user => <OrgUserCard key={`${user.id}-${dept.id}`} user={user} />)}
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default OrgChart;