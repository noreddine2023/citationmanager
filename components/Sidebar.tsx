import React from 'react';
import { Search, Library, GitBranch, FileText, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Project } from '../types';

interface SidebarProps {
  user: any;
  projects: Project[];
  view: string;
  activeProjectId: string | null;
  activeSubtopicId: string | null;
  onSetView: (view: string) => void;
  onSetActiveProject: (projectId: string | null) => void;
  onSetActiveSubtopic: (subtopicId: string | null) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenProjectModal: () => void;
  onOpenSubtopicModal: (projectId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  projects,
  view,
  activeProjectId,
  activeSubtopicId,
  onSetView,
  onSetActiveProject,
  onSetActiveSubtopic,
  onDeleteProject,
  onOpenProjectModal,
  onOpenSubtopicModal
}) => {
  const [expandedProjects, setExpandedProjects] = React.useState<Set<string>>(new Set());

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const navItems = [
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'library', icon: Library, label: 'Library' },
    { id: 'notes', icon: FileText, label: 'Notes' },
  ];

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">Citra</h1>
        <p className="text-xs text-slate-500">{user?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onSetView(item.id);
                onSetActiveProject(null);
                onSetActiveSubtopic(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === item.id && !activeProjectId
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Projects Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects</span>
            <button 
              onClick={onOpenProjectModal}
              className="p-1 hover:bg-slate-200 rounded"
            >
              <Plus className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div className="space-y-1">
            {projects.map(project => (
              <div key={project.id}>
                <div 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeProjectId === project.id ? 'bg-sky-100 text-sky-700' : 'hover:bg-slate-100'
                  }`}
                >
                  <button
                    onClick={() => toggleProject(project.id)}
                    className="p-0.5"
                  >
                    {expandedProjects.has(project.id) ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </button>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span 
                    className="text-sm font-medium flex-1 truncate"
                    onClick={() => {
                      onSetActiveProject(project.id);
                      onSetActiveSubtopic(null);
                      onSetView('library');
                    }}
                  >
                    {project.name}
                  </span>
                  <button
                    onClick={() => {
                      onSetActiveProject(project.id);
                      onSetView('flow');
                    }}
                    className="p-1 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100"
                    title="Flow Board"
                  >
                    <GitBranch className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(project.id);
                    }}
                    className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                
                {/* Subtopics */}
                {expandedProjects.has(project.id) && (
                  <div className="ml-6 space-y-1 mt-1">
                    {project.subtopics?.map(subtopic => (
                      <button
                        key={subtopic.id}
                        onClick={() => {
                          onSetActiveProject(project.id);
                          onSetActiveSubtopic(subtopic.id);
                          onSetView('library');
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded text-sm ${
                          activeSubtopicId === subtopic.id
                            ? 'bg-sky-50 text-sky-700'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {subtopic.name}
                      </button>
                    ))}
                    <button
                      onClick={() => onOpenSubtopicModal(project.id)}
                      className="w-full text-left px-3 py-1.5 rounded text-sm text-slate-400 hover:bg-slate-100 flex items-center gap-2"
                    >
                      <Plus className="w-3 h-3" />
                      Add subtopic
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};
