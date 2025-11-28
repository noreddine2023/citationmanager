import React, { useState } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Document, JSONContent } from '../../types';

interface EditorViewProps {
  document: Document;
  onSave: (document: Document) => void;
  onBack: () => void;
  onDelete: () => void;
}

/**
 * Extract plain text from JSONContent (Tiptap format)
 */
const extractText = (content: JSONContent | null): string => {
  if (!content) return '';
  
  const getText = (node: JSONContent): string => {
    if (node.text) return node.text;
    if (node.content) {
      return node.content.map(getText).join('\n');
    }
    return '';
  };
  
  return getText(content);
};

/**
 * Convert plain text to JSONContent (Tiptap format)
 */
const textToJSONContent = (text: string): JSONContent => {
  const paragraphs = text.split('\n');
  return {
    type: 'doc',
    content: paragraphs.map(p => ({
      type: 'paragraph',
      content: p ? [{ type: 'text', text: p }] : []
    }))
  };
};

export const EditorView: React.FC<EditorViewProps> = ({
  document,
  onSave,
  onBack,
  onDelete
}) => {
  const [title, setTitle] = useState(document.title);
  const [body, setBody] = useState(() => extractText(document.content));
  const [hasChanges, setHasChanges] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    setHasChanges(true);
  };

  const handleSave = () => {
    const updatedDoc: Document = {
      ...document,
      title: title || 'Untitled',
      content: textToJSONContent(body),
      updatedAt: new Date().toISOString()
    };
    onSave(updatedDoc);
    setHasChanges(false);
  };

  const handleBack = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Save before leaving?')) {
        handleSave();
      }
    }
    onBack();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      onDelete();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            title="Back to notes"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Document"
            className="text-xl font-bold bg-transparent border-none outline-none text-slate-900 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-amber-600 mr-2">Unsaved changes</span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"
            title="Delete document"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-6 overflow-y-auto">
        <textarea
          value={body}
          onChange={handleBodyChange}
          placeholder="Start writing..."
          className="w-full h-full min-h-[400px] p-4 text-slate-700 leading-relaxed resize-none border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between">
        <span>
          Created: {new Date(document.createdAt).toLocaleString()}
        </span>
        <span>
          Last updated: {new Date(document.updatedAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
};
