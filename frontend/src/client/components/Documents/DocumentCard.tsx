import React from 'react';
import { Download, FileText, Image, Code, File } from 'lucide-react';
import { Document } from '../../types';

interface DocumentCardProps {
  document: Document;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'report': return <FileText className="text-blue-500" size={24} />;
      case 'doc': return <File className="text-green-500" size={24} />;
      case 'image': return <Image className="text-purple-500" size={24} />;
      case 'prototype': return <Code className="text-orange-500" size={24} />;
      default: return <File className="text-gray-500" size={24} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'report': return 'Rapport';
      case 'doc': return 'Document';
      case 'image': return 'Image';
      case 'prototype': return 'Prototype';
      default: return 'Fichier';
    }
  };

  const handleDownload = () => {
    if (document.downloadUrl.startsWith('http')) {
      window.open(document.downloadUrl, '_blank');
    } else {
      // Simulate download for local files
      const link = window.document.createElement('a');
      link.href = document.downloadUrl;
      link.download = document.name;
      link.click();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {getTypeIcon(document.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-poppins font-medium text-secondary-2 truncate">
            {document.name}
          </h3>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span className="font-open-sans">{getTypeLabel(document.type)}</span>
            <span>•</span>
            <span>{document.size}</span>
            {document.sprint && (
              <>
                <span>•</span>
                <span>{document.sprint}</span>
              </>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            Uploadé le {new Date(document.uploadDate).toLocaleDateString('fr-FR')}
          </p>
        </div>
        
        <button
          onClick={handleDownload}
          className="flex items-center space-x-2 px-3 py-2 text-button hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          <Download size={16} />
          <span className="font-open-sans">Télécharger</span>
        </button>
      </div>
    </div>
  );
};