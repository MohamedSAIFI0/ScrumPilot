import React from 'react';
import { Users, Mail, Phone, Calendar } from 'lucide-react';

const Team: React.FC = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Mehdi Alaoui',
      role: 'Scrum Master',
      email: 'mehdi.alaoui@dxc.com',
      phone: '+212 6 12 34 56 78',
      avatar: null,
      projects: ['E-Commerce Platform', 'Mobile App Redesign'],
      availability: 'Disponible',
      joinDate: '2023-06-15'
    },
    {
      id: 2,
      name: 'Sarah Benali',
      role: 'Product Owner',
      email: 'sarah.benali@dxc.com',
      phone: '+212 6 23 45 67 89',
      avatar: null,
      projects: ['E-Commerce Platform'],
      availability: 'En réunion',
      joinDate: '2023-03-10'
    },
    {
      id: 3,
      name: 'Ahmed Tazi',
      role: 'Développeur Senior',
      email: 'ahmed.tazi@dxc.com',
      phone: '+212 6 34 56 78 90',
      avatar: null,
      projects: ['Data Analytics Dashboard', 'Mobile App Redesign'],
      availability: 'Disponible',
      joinDate: '2022-11-20'
    },
    {
      id: 4,
      name: 'Fatima Bennani',
      role: 'Développeur Full Stack',
      email: 'fatima.bennani@dxc.com',
      phone: '+212 6 45 67 89 01',
      avatar: null,
      projects: ['E-Commerce Platform'],
      availability: 'Disponible',
      joinDate: '2023-08-05'
    },
    {
      id: 5,
      name: 'Youssef El Amrani',
      role: 'UX/UI Designer',
      email: 'youssef.elamrani@dxc.com',
      phone: '+212 6 56 78 90 12',
      avatar: null,
      projects: ['Mobile App Redesign'],
      availability: 'En congé',
      joinDate: '2023-01-15'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Scrum Master': return 'bg-primary/10 text-primary';
      case 'Product Owner': return 'bg-button/10 text-button';
      case 'Développeur Senior': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Développeur Full Stack': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'UX/UI Designer': return 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Disponible': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'En réunion': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'En congé': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-title font-poppins text-secondary-2 dark:text-dark-text">Gestion de l'Équipe</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>{teamMembers.length} membres actifs</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map(member => (
          <div key={member.id} className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary-2 dark:text-dark-text">{member.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(member.role)}`}>
                  {member.role}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getAvailabilityColor(member.availability)}`}>
                {member.availability}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Depuis le {new Date(member.joinDate).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-secondary-2 dark:text-dark-text mb-2">Projets assignés</h4>
              <div className="space-y-1">
                {member.projects.map((project, index) => (
                  <span key={index} className="text-xs bg-cards dark:bg-dark-card text-secondary-2 dark:text-dark-text px-2 py-1 rounded block">
                    {project}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-secondary-2 dark:text-dark-text font-poppins mb-4">Statistiques de l'équipe</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">5</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Membres actifs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-button">3</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Projets en cours</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">28</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Vélocité moyenne</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">2</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Membres en formation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;