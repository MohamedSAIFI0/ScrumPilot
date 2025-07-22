import React, { useState } from 'react';
import { Task, Comment } from '../types';
import { 
  X, 
  Clock, 
  AlertTriangle, 
  MessageCircle, 
  Paperclip, 
  Send,
  Plus,
  History
} from 'lucide-react';
import CommentSection from './CommentSection';
import ImpedimentModal from './ImpedimentModal';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSave }) => {
  const [status, setStatus] = useState(task.status);
  const [statusComment, setStatusComment] = useState('');
  const [showImpedimentModal, setShowImpedimentModal] = useState(false);

  if (!isOpen) return null;

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as 'todo' | 'inprogress' | 'done');
    if (statusComment.trim()) {
      onSave(task.id, {
        status: newStatus as 'todo' | 'inprogress' | 'done',
        statusHistory: [
          ...task.statusHistory,
          {
            id: Date.now().toString(),
            fromStatus: task.status,
            toStatus: newStatus,
            changedBy: task.assignee,
            changedAt: new Date(),
            comment: statusComment
          }
        ]
      });
      setStatusComment('');
    } else {
      onSave(task.id, { status: newStatus as 'todo' | 'inprogress' | 'done' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'À Faire';
      case 'inprogress': return 'En Cours';
      case 'done': return 'Terminé';
      default: return status;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-poppins font-semibold text-secondary-2">
                    {task.title}
                  </h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {task.sprint}
                  </span>
                  <span>Assigné à {task.assignee.name}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-poppins font-medium mb-2">Description</h3>
              <p className="text-gray-700 font-open-sans">{task.description}</p>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-poppins font-medium mb-2">Étiquettes</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Status Update */}
            <div className="bg-cards p-4 rounded-lg">
              <h3 className="font-poppins font-medium mb-3">Mise à jour du statut</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange('todo')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      status === 'todo' 
                        ? 'bg-gray-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    À Faire
                  </button>
                  <button
                    onClick={() => handleStatusChange('inprogress')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      status === 'inprogress' 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    En Cours
                  </button>
                  <button
                    onClick={() => handleStatusChange('done')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      status === 'done' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Terminé
                  </button>
                </div>
                <textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Commentaire optionnel sur le changement de statut..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowImpedimentModal(true)}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Signaler un blocage
              </button>
            </div>

            {/* Status History */}
            {task.statusHistory.length > 0 && (
              <div>
                <h3 className="font-poppins font-medium mb-3 flex items-center">
                  <History className="w-4 h-4 mr-2" />
                  Historique des changements
                </h3>
                <div className="space-y-2">
                  {task.statusHistory.map((change) => (
                    <div key={change.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          <strong>{getStatusLabel(change.fromStatus)}</strong> → <strong>{getStatusLabel(change.toStatus)}</strong>
                        </span>
                        <span className="text-gray-500">
                          {change.changedAt.toLocaleDateString()} par {change.changedBy.name}
                        </span>
                      </div>
                      {change.comment && (
                        <p className="text-sm text-gray-600 mt-1">{change.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {task.attachments.length > 0 && (
              <div>
                <h3 className="font-poppins font-medium mb-3 flex items-center">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Pièces jointes ({task.attachments.length})
                </h3>
                <div className="space-y-2">
                  {task.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Paperclip className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">{attachment.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({(attachment.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Ajouté par {attachment.uploadedBy.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <CommentSection 
              comments={task.comments}
              onAddComment={(content) => {
                const newComment: Comment = {
                  id: Date.now().toString(),
                  content,
                  author: task.assignee,
                  createdAt: new Date(),
                  mentions: content.match(/@\w+/g) || []
                };
                onSave(task.id, {
                  comments: [...task.comments, newComment]
                });
              }}
            />
          </div>
        </div>
      </div>

      {showImpedimentModal && (
        <ImpedimentModal
          taskId={task.id}
          taskTitle={task.title}
          isOpen={showImpedimentModal}
          onClose={() => setShowImpedimentModal(false)}
          onSubmit={(impediment) => {
            console.log('Impediment reporté:', impediment);
            setShowImpedimentModal(false);
          }}
        />
      )}
    </>
  );
};

export default TaskModal;