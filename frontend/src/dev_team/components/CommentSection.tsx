import React, { useState } from 'react';
import { Comment } from '../types';
import { MessageCircle, Send, AtSign } from 'lucide-react';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const formatCommentContent = (content: string) => {
    return content.replace(/@(\w+)/g, '<span class="text-primary font-medium">@$1</span>');
  };

  return (
    <div>
      <h3 className="font-poppins font-medium mb-4 flex items-center">
        <MessageCircle className="w-4 h-4 mr-2" />
        Commentaires ({comments.length})
      </h3>

      {/* Comments List */}
      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <img 
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{comment.author.name}</span>
                  <span className="text-xs text-gray-500">
                    {comment.createdAt.toLocaleDateString()} à {comment.createdAt.toLocaleTimeString()}
                  </span>
                </div>
                <div 
                  className="text-sm text-gray-700 font-open-sans"
                  dangerouslySetInnerHTML={{ __html: formatCommentContent(comment.content) }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire... Utilisez @username pour mentionner quelqu'un"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent font-open-sans"
            rows={3}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            <AtSign className="w-3 h-3 inline mr-1" />
            Mentions supportées
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Appuyez sur Entrée pour envoyer
          </div>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="flex items-center px-4 py-2 bg-button text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 mr-2" />
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;