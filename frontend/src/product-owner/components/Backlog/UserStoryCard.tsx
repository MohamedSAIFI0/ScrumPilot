import React from 'react';
import { Edit, Trash2, GripVertical, User, Calendar, MessageCircle } from 'lucide-react';
import { UserStory } from '../../contexts/ScrumContext';
import { useScrum } from '../../contexts/ScrumContext';

interface UserStoryCardProps {
  story: UserStory;
  onEdit: () => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

export default function UserStoryCard({ story, onEdit, onDelete, dragHandleProps }: UserStoryCardProps) {
  const { state } = useScrum();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'haute': return 'bg-red-100 text-red-800 border-red-200';
      case 'moyenne': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'basse': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'To Do': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`rounded-xl p-6 shadow-sm border transition-all ${
      state.darkMode 
        ? 'bg-dark-card border-gray-700 hover:bg-gray-700' 
        : 'bg-white border-gray-100 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div {...dragHandleProps} className="mt-1 cursor-grab active:cursor-grabbing">
            <GripVertical className={`w-5 h-5 ${state.darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className={`text-lg font-semibold font-poppins ${
                state.darkMode ? 'text-dark-text' : 'text-secondary-2'
              }`}>
                {story.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(story.priority)}`}>
                {story.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(story.status)}`}>
                {story.status}
              </span>
            </div>
            
            <p className={`mb-4 font-open-sans ${
              state.darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {story.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-1 text-sm ${
                  state.darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span className="font-medium">Points:</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {story.points}
                  </span>
                </div>
                
                <div className={`flex items-center space-x-1 text-sm ${
                  state.darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                    {story.tag}
                  </span>
                </div>
                
                {story.assignee && (
                  <div className={`flex items-center space-x-1 text-sm ${
                    state.darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <User className="w-4 h-4" />
                    <span>{story.assignee}</span>
                  </div>
                )}
                
                {story.comments.length > 0 && (
                  <div className={`flex items-center space-x-1 text-sm ${
                    state.darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <MessageCircle className="w-4 h-4" />
                    <span>{story.comments.length}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={onEdit}
                  className={`p-2 transition-colors ${
                    state.darkMode 
                      ? 'text-gray-400 hover:text-blue-400' 
                      : 'text-gray-400 hover:text-blue-600'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={onDelete}
                  className={`p-2 transition-colors ${
                    state.darkMode 
                      ? 'text-gray-400 hover:text-red-400' 
                      : 'text-gray-400 hover:text-red-600'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}