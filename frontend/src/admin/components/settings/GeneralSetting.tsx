import React, { useState } from 'react';
import { Settings, Globe, AlertTriangle } from 'lucide-react';
import { mockPlatformSettings } from '../../data/mockData';
import { PlatformSettings } from '../../types';

export const GeneralSettings: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings>(mockPlatformSettings);

  const handleInputChange = (key: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };



  const handleSave = () => {
    // Save settings logic
    alert('Paramètres sauvegardés avec succès !');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins font-semibold text-title text-secondary-2 dark:text-white">
            Paramètres généraux
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-open-sans text-paragraph mt-1">
            Configurez les paramètres de votre plateforme
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-button text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Sauvegarder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white mb-6 flex items-center">
            <Settings size={20} className="mr-2" />
            Informations de la plateforme
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du projet
              </label>
              <input
                type="text"
                value={settings.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Nom de votre plateforme"
              />
            </div>
            
           
          </div>
        </div>

        {/* Localization */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white mb-6 flex items-center">
            <Globe size={20} className="mr-2" />
            Langue
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Langue par défaut
              </label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => handleInputChange('defaultLanguage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            
            
          </div>
        </div>

        {/* Modules */}
        

        {/* Maintenance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white mb-6 flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            Maintenance
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-open-sans font-medium text-secondary-2 dark:text-white">
                  Mode maintenance
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Active le mode maintenance pour tous les utilisateurs
                </p>
              </div>
              <button
                onClick={() => handleInputChange('maintenanceMode', !settings.maintenanceMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {settings.maintenanceMode && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle size={16} className="text-red-600 dark:text-red-400 mr-2" />
                  <span className="text-sm text-red-800 dark:text-red-300 font-medium">
                    Mode maintenance activé
                  </span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  Les utilisateurs ne peuvent pas accéder à la plateforme.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

     
    
    </div>
  );
};