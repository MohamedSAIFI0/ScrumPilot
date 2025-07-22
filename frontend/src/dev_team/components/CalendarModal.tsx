import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Users,
  MapPin,
  Plus,
  Filter
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'daily' | 'planning' | 'review' | 'retrospective' | 'meeting' | 'deadline';
  date: Date;
  time: string;
  duration: string;
  participants?: string[];
  location?: string;
  description?: string;
  color: string;
}

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Mock events data
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Daily Standup',
      type: 'daily',
      date: new Date(),
      time: '09:00',
      duration: '15 min',
      participants: ['Équipe Dev'],
      location: 'Salle de réunion A',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      title: 'Sprint Planning',
      type: 'planning',
      date: new Date(Date.now() + 86400000), // Tomorrow
      time: '14:00',
      duration: '2h',
      participants: ['Équipe complète'],
      location: 'Salle de conférence',
      description: 'Planification du Sprint 4',
      color: 'bg-purple-500'
    },
    {
      id: '3',
      title: 'Sprint Review',
      type: 'review',
      date: new Date(Date.now() + 86400000 * 7), // Next week
      time: '15:00',
      duration: '1h30',
      participants: ['Équipe + Stakeholders'],
      location: 'Auditorium',
      color: 'bg-green-500'
    },
    {
      id: '4',
      title: 'Rétrospective Sprint 3',
      type: 'retrospective',
      date: new Date(Date.now() + 86400000 * 7), // Next week
      time: '16:45',
      duration: '45 min',
      participants: ['Équipe Dev'],
      location: 'Salle créative',
      color: 'bg-orange-500'
    },
    {
      id: '5',
      title: 'Deadline - API Authentication',
      type: 'deadline',
      date: new Date(Date.now() + 86400000 * 3), // In 3 days
      time: '18:00',
      duration: '',
      color: 'bg-red-500'
    }
  ];

  if (!isOpen) return null;

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return '🔄';
      case 'planning': return '📋';
      case 'review': return '👥';
      case 'retrospective': return '🔍';
      case 'meeting': return '💼';
      case 'deadline': return '⏰';
      default: return '📅';
    }
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden shadow-2xl transition-colors">
        {/* Calendar Main View */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <CalendarIcon className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-poppins font-semibold text-gray-900 dark:text-white">
                  Calendrier Scrum
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {['month', 'week', 'day'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode as 'month' | 'week' | 'day')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        viewMode === mode
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {mode === 'month' ? 'Mois' : mode === 'week' ? 'Semaine' : 'Jour'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <h3 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="flex items-center px-3 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel Événement
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 flex-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2 h-24"></div>;
                }

                const dayEvents = getEventsForDate(day);
                const isToday = day.toDateString() === today.toDateString();
                const isSelected = selectedDate?.toDateString() === day.toDateString();

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`p-2 h-24 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''
                    } ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded text-white truncate ${event.color}`}
                          title={`${event.title} - ${event.time}`}
                        >
                          {getEventTypeIcon(event.type)} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{dayEvents.length - 2} autres
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event Details Sidebar */}
        <div className="w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-2">
              {selectedDate ? `Événements du ${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}` : 'Événements à venir'}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {selectedDate ? (
              <div className="space-y-4">
                {getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate).map((event) => (
                    <div key={event.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                          <h4 className="font-poppins font-semibold text-gray-900 dark:text-white">
                            {event.title}
                          </h4>
                        </div>
                        <span className={`w-3 h-3 rounded-full ${event.color}`}></span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {event.time} {event.duration && `(${event.duration})`}
                        </div>
                        
                        {event.participants && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {event.participants.join(', ')}
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.location}
                          </div>
                        )}
                        
                        {event.description && (
                          <p className="mt-2 text-gray-700 dark:text-gray-300">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Aucun événement prévu pour cette date
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-poppins font-medium text-gray-900 dark:text-white mb-4">
                  Prochains événements
                </h4>
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getEventTypeIcon(event.type)} {event.title}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${event.color}`}></span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {event.date.toLocaleDateString('fr-FR')} à {event.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-poppins font-medium text-gray-900 dark:text-white mb-3">
              Légende
            </h4>
            <div className="space-y-2 text-sm">
              {[
                { type: 'daily', label: 'Daily Standup', color: 'bg-blue-500' },
                { type: 'planning', label: 'Sprint Planning', color: 'bg-purple-500' },
                { type: 'review', label: 'Sprint Review', color: 'bg-green-500' },
                { type: 'retrospective', label: 'Rétrospective', color: 'bg-orange-500' },
                { type: 'deadline', label: 'Deadline', color: 'bg-red-500' }
              ].map((item) => (
                <div key={item.type} className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                  <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;