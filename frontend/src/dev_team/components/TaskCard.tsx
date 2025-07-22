import React from 'react';
import { Task } from '../types';
import { Clock, MessageCircle, Paperclip, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Critique';
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-poppins font-medium text-secondary-2 text-sm leading-tight">
          {task.title}
        </h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2 font-open-sans">
        {task.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {task.tags.map((tag, index) => (
          <span 
            key={index}
            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-gray-500">
          <div className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            <span className="text-xs">{task.comments.length}</span>
          </div>
          <div className="flex items-center">
            <Paperclip className="w-4 h-4 mr-1" />
            <span className="text-xs">{task.attachments.length}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-xs">{task.sprint}</span>
          </div>
        </div>

        <div className="flex items-center">
          <img 
            src={task.assignee.avatar}
            alt={task.assignee.name}
            className="w-6 h-6 rounded-full border-2 border-gray-200"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;