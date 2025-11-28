import React, { useMemo } from 'react';
import { Trash2, ExternalLink, FileText, FolderPlus } from 'lucide-react';
import { Paper, Project } from '../../types';

interface LibraryViewProps {
  papers: Paper[];
  projects: Project[];
  activeProjectId: string | null;
  activeSubtopicId: string | null;
  onSelectPaper: (paper: Paper) => void;
  onDeletePaper: (paperId: string) => void;
  onExport: () => void;
  onUpdatePaperProject: (paperId: string, projectId: string, add: boolean) => void;
  onUpdatePaperSubtopic: (paperId: string, projectId: string, subtopicId: string, add: boolean) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  papers,
  projects,
  activeProjectId,
  activeSubtopicId,
  onSelectPaper,
  onDeletePaper,
  onExport,
  onUpdatePaperProject,
  onUpdatePaperSubtopic
}) => {
  const filteredPapers = useMemo(() => {
    let filtered = papers;
    
    if (activeSubtopicId) {
      filtered = filtered.filter(p => p.subtopicIds?.includes(activeSubtopicId));
    } else if (activeProjectId) {
      filtered = filtered.filter(p => p.projectIds?.includes(activeProjectId));
    }
    
    return filtered.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }, [papers, activeProjectId, activeSubtopicId]);

  const currentProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {currentProject ? currentProject.name : 'All Papers'}
          </h2>
          <p className="text-sm text-slate-500">
            {filteredPapers.length} paper{filteredPapers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onExport}
          disabled={filteredPapers.length === 0}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 text-sm"
        >
          Export Citations
        </button>
      </div>

      {/* Papers List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredPapers.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No papers in this collection</p>
            <p className="text-sm">Search and add papers to get started</p>
          </div>
        ) : (
          filteredPapers.map((paper) => (
            <article
              key={paper.id}
              className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group"
            >
              <div className="flex justify-between gap-4">
                <div className="flex-1 cursor-pointer" onClick={() => onSelectPaper(paper)}>
                  <h3 className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {paper.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {paper.authors.map(a => a.name).join(', ')}
                    {paper.year && ` • ${paper.year}`}
                  </p>
                  {paper.venue && (
                    <p className="text-xs text-slate-400 mt-1">{paper.venue}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {paper.projectIds?.map(pid => {
                      const project = projects.find(p => p.id === pid);
                      if (!project) return null;
                      return (
                        <span
                          key={pid}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: `${project.color}20`,
                            color: project.color 
                          }}
                        >
                          {project.name}
                        </span>
                      );
                    })}
                    {paper.tags?.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  {paper.url && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                      title="Open external link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePaper(paper.id);
                    }}
                    className="p-2 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"
                    title="Delete paper"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
