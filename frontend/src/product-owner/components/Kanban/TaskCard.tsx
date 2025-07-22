import React from 'react';
import { User, MessageCircle, Clock } from 'lucide-react';
import { UserStory } from '../../contexts/ScrumContext';
import { useScrum } from '../../contexts/ScrumContext';

interface TaskCardProps {
  story: UserStory;
}

export default function TaskCard({ story }: TaskCardProps) {
  const { state } = useScrum();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'haute': return 'border-l-red-500';
      case 'moyenne': return 'border-l-yellow-500';
      case 'basse': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className={`rounded-lg p-4 shadow-sm border-l-4 ${getPriorityColor(story.priority)} transition-all cursor-grab active:cursor-grabbing ${
      state.darkMode 
        ? 'bg-dark-bg hover:bg-gray-700' 
        : 'bg-white hover:shadow-md'
    }`}>
      <div className="space-y-3">
        <div>
          <h4 className={`font-medium text-sm font-poppins ${
            state.darkMode ? 'text-dark-text' : 'text-secondary-2'
          }`}>
            {story.title}
          </h4>
          <p className={`text-xs mt-1 line-clamp-2 font-open-sans ${
            state.darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {story.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
              {story.tag}
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              {story.points}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {story.comments.length > 0 && (
              <div className={`flex items-center space-x-1 text-xs ${
                state.darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <MessageCircle className="w-3 h-3" />
                <span>{story.comments.length}</span>
              </div>
            )}
            
            {story.assignee && (
              <div className={`flex items-center space-x-1 text-xs ${
                state.darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <User className="w-3 h-3" />
                <span className="truncate max-w-[60px]">{story.assignee.split(' ')[0]}</span>
              </div>
            )}
          </div>
        </div>

        <div className={`flex items-center justify-between text-xs ${
          state.darkMode ? 'text-gray-500' : 'text-gray-500'
        }`}>
          <span className="capitalize">{story.priority}</span>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(story.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}