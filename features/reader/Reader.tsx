import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, FileText, MessageSquare, Link, Loader2 } from 'lucide-react';
import { Paper, SearchResult, Note } from '../../types';

interface ReaderViewProps {
  paper: Paper;
  user: any;
  onUpdatePaper: (paper: Paper) => void;
  onImportReference: (ref: SearchResult) => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  paper,
  user,
  onUpdatePaper,
  onImportReference
}) => {
  const [activeTab, setActiveTab] = useState<'abstract' | 'notes' | 'references'>('abstract');
  const [noteContent, setNoteContent] = useState('');
  const [references, setReferences] = useState<SearchResult[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    
    const newNote: Note = {
      id: Date.now().toString(),
      content: noteContent,
      createdAt: new Date().toISOString()
    };
    
    onUpdatePaper({
      ...paper,
      notes: [...(paper.notes || []), newNote]
    });
    
    setNoteContent('');
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdatePaper({
      ...paper,
      notes: paper.notes?.filter(n => n.id !== noteId) || []
    });
  };

  const loadReferences = async () => {
    if (references.length > 0) return;
    
    setLoadingRefs(true);
    try {
      const response = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/${paper.id}/references?limit=10&fields=paperId,title,authors,year,abstract,venue,url,citationCount,isOpenAccess`
      );
      
      if (response.ok) {
        const data = await response.json();
        const refs: SearchResult[] = (data.data || [])
          .filter((item: any) => item.citedPaper)
          .map((item: any) => ({
            paperId: item.citedPaper.paperId,
            title: item.citedPaper.title,
            authors: item.citedPaper.authors?.map((a: any) => ({ authorId: a.authorId || '', name: a.name })) || [],
            year: item.citedPaper.year,
            abstract: item.citedPaper.abstract,
            venue: item.citedPaper.venue,
            url: item.citedPaper.url,
            citationCount: item.citedPaper.citationCount || 0,
            isOpenAccess: item.citedPaper.isOpenAccess || false,
            source: 'SemanticScholar' as const
          }));
        setReferences(refs);
      }
    } catch (error) {
      console.error('Error loading references:', error);
    } finally {
      setLoadingRefs(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <h2 className="text-xl font-bold text-slate-900 line-clamp-2">
          {paper.title}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {paper.authors.map(a => a.name).join(', ')}
          {paper.year && ` • ${paper.year}`}
        </p>
        <div className="flex items-center gap-4 mt-2">
          {paper.venue && (
            <span className="text-xs text-slate-400">{paper.venue}</span>
          )}
          <span className="text-xs text-slate-400">
            {paper.citationCount} citations
          </span>
          {paper.isOpenAccess && (
            <span className="text-xs text-green-600 font-medium">Open Access</span>
          )}
          {paper.url && (
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sky-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              View Online
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="flex gap-4 px-4">
          {[
            { id: 'abstract', label: 'Abstract', icon: FileText },
            { id: 'notes', label: 'Notes', icon: MessageSquare },
            { id: 'references', label: 'References', icon: Link }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'references') loadReferences();
              }}
              className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'notes' && paper.notes?.length > 0 && (
                <span className="text-xs bg-slate-100 rounded-full px-2">
                  {paper.notes.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'abstract' && (
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed">
              {paper.abstract || 'No abstract available for this paper.'}
            </p>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* Add Note */}
            <div className="flex gap-2">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 p-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
                rows={3}
              />
              <button
                onClick={handleAddNote}
                disabled={!noteContent.trim()}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 self-end"
              >
                Add
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
              {(!paper.notes || paper.notes.length === 0) && (
                <p className="text-slate-500 text-center py-8">No notes yet</p>
              )}
              {paper.notes?.map(note => (
                <div
                  key={note.id}
                  className="p-4 bg-amber-50 border border-amber-100 rounded-lg"
                >
                  <p className="text-slate-700">{note.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-400">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'references' && (
          <div className="space-y-3">
            {loadingRefs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : references.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No references found</p>
            ) : (
              references.map(ref => (
                <div
                  key={ref.paperId}
                  className="p-4 border border-slate-200 rounded-lg hover:border-slate-300"
                >
                  <h4 className="font-medium text-slate-900">{ref.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    {ref.authors.map(a => a.name).join(', ')}
                    {ref.year && ` • ${ref.year}`}
                  </p>
                  <button
                    onClick={() => onImportReference(ref)}
                    className="mt-2 text-xs text-sky-600 hover:underline"
                  >
                    Import to library
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
