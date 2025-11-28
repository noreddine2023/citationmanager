import React from 'react';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { Document } from '../../types';

interface NotesListProps {
  documents: Document[];
  onSelect: (document: Document) => void;
  onDelete: (documentId: string) => void;
  onCreate: () => void;
}

export const NotesList: React.FC<NotesListProps> = ({
  documents,
  onSelect,
  onDelete,
  onCreate
}) => {
  const sortedDocuments = [...documents].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Notes</h2>
          <p className="text-sm text-slate-500">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Document
        </button>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto">
        {sortedDocuments.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No documents yet</p>
            <p className="text-sm">Create a new document to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sortedDocuments.map((doc) => (
              <article
                key={doc.id}
                className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div 
                    className="flex-1"
                    onClick={() => onSelect(doc)}
                  >
                    <h3 className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {doc.title || 'Untitled'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Updated {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this document?')) {
                        onDelete(doc.id);
                      }
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
