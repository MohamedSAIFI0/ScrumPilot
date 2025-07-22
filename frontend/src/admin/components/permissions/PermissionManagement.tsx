import React, { useState } from 'react';
import { Shield, Users, Check, X } from 'lucide-react';
import { mockPermissions, mockRolePermissions } from '../../data/mockData';
import { Permission, RolePermission } from '../../types';

export const PermissionManagement: React.FC = () => {
  const [permissions] = useState<Permission[]>(mockPermissions);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(mockRolePermissions);
  const [selectedRole, setSelectedRole] = useState<'PO' | 'Scrum Master' | 'Dev' | 'Client'>('PO');

  const togglePermission = (permissionId: string) => {
    setRolePermissions(prev => prev.map(rp => {
      if (rp.role === selectedRole) {
        const hasPermission = rp.permissions.includes(permissionId);
        return {
          ...rp,
          permissions: hasPermission 
            ? rp.permissions.filter(p => p !== permissionId)
            : [...rp.permissions, permissionId]
        };
      }
      return rp;
    }));
  };

  const currentRolePermissions = rolePermissions.find(rp => rp.role === selectedRole)?.permissions || [];
  
  const groupedPermissions = permissions.reduce((groups, permission) => {
    const category = permission.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>);

  const roleColors = {
    'PO': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    'Scrum Master': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    'Dev': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    'Client': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins font-semibold text-title text-secondary-2 dark:text-white">
            Gestion des droits d'accès
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-open-sans text-paragraph mt-1">
            Définissez les permissions pour chaque rôle
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white mb-4 flex items-center">
            <Users size={20} className="mr-2" />
            Rôles
          </h3>
          <div className="space-y-3">
            {(['PO', 'Scrum Master', 'Dev', 'Client'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full p-3 rounded-lg border-2 transition-all ${
                  selectedRole === role 
                    ? roleColors[role] 
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="font-open-sans font-medium">{role}</div>
                <div className="text-sm mt-1">
                  {currentRolePermissions.length} permission{currentRolePermissions.length > 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white flex items-center">
                <Shield size={20} className="mr-2" />
                Permissions pour {selectedRole}
              </h3>
              <button
                onClick={() => {
                  // Save permissions logic
                  alert('Permissions sauvegardées !');
                }}
                className="px-4 py-2 bg-button text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Sauvegarder
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="font-poppins font-medium text-lg text-secondary-2 dark:text-white mb-4">
                    {category}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryPermissions.map((permission) => {
                      const hasPermission = currentRolePermissions.includes(permission.id);
                      return (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-open-sans font-medium text-secondary-2 dark:text-white">
                              {permission.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {permission.description}
                            </div>
                          </div>
                          <button
                            onClick={() => togglePermission(permission.id)}
                            className={`p-2 rounded-full transition-colors ${
                              hasPermission
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                            }`}
                          >
                            {hasPermission ? <Check size={16} /> : <X size={16} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};