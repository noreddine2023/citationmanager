
import React, { useState, useEffect, useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import { X, Loader2 } from 'lucide-react';
import { Paper, SearchResult, CitationStyle, Project, Subtopic, Document } from './types';
import { generateCitations } from './services/geminiService';
import { 
    auth,
    subscribeToPapers, 
    subscribeToProjects, 
    subscribeToDocuments,
    addPaperToDb, 
    updatePaperInDb, 
    deletePaperFromDb, 
    addProjectToDb, 
    updateProjectInDb, 
    deleteProjectFromDb,
    addDocumentToDb,
    updateDocumentInDb,
    deleteDocumentFromDb
} from './services/firebase';

// Components
import { Sidebar } from './components/Sidebar';
import { SearchView } from './features/search/Search';
import { LibraryView } from './features/library/Library';
import { FlowView } from './features/flow/FlowBoard';
import { ReaderView } from './features/reader/Reader';
import { EditorView } from './features/editor/Editor';
import { NotesList } from './features/notes/NotesList';

// --- Modals ---

const CitationModal = ({ isOpen, onClose, papers }: { isOpen: boolean, onClose: () => void, papers: Paper[] }) => {
    const [style, setStyle] = useState<CitationStyle>('APA');
    const [citations, setCitations] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && papers.length > 0) {
            setLoading(true);
            generateCitations(papers, style).then(c => {
                setCitations(c);
                setLoading(false);
            });
        }
    }, [isOpen, papers, style]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">Generate Bibliography</h3>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <div className="p-4 border-b bg-slate-50 flex gap-2">
                    {(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE', 'BibTeX'] as CitationStyle[]).map(s => (
                        <button 
                            key={s} 
                            onClick={() => setStyle(s)}
                            className={`px-3 py-1 rounded text-sm font-medium ${style === s ? 'bg-sky-600 text-white' : 'bg-white border text-slate-600 hover:bg-slate-100'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <div className="p-6 overflow-y-auto flex-1 font-mono text-sm bg-slate-50">
                    {loading ? (
                        <div className="flex justify-center items-center h-full gap-2 text-slate-500">
                            <Loader2 className="animate-spin w-5 h-5" /> Generating...
                        </div>
                    ) : (
                        <pre className="whitespace-pre-wrap">{citations}</pre>
                    )}
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                    <button onClick={() => navigator.clipboard.writeText(citations)} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Copy to Clipboard</button>
                </div>
            </div>
        </div>
    );
};

const CreateProjectModal = ({ isOpen, onClose, onCreate }: { isOpen: boolean, onClose: () => void, onCreate: (name: string, color: string) => void }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#0ea5e9'); // sky-500

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-4">New Project</h3>
                <input 
                    className="w-full p-2 border rounded mb-4" 
                    placeholder="Project Name" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                />
                <div className="flex gap-2 mb-6">
                    {['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#8b5cf6', '#ec4899', '#64748b'].map(c => (
                        <button 
                            key={c} 
                            className={`w-6 h-6 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                    <button 
                        onClick={() => { onCreate(name, color); onClose(); setName(''); }} 
                        disabled={!name.trim()}
                        className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-50"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

const CreateSubtopicModal = ({ isOpen, onClose, onCreate, parentName }: { isOpen: boolean, onClose: () => void, onCreate: (name: string) => void, parentName: string }) => {
    const [name, setName] = useState('');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-1">New Subtopic</h3>
                <p className="text-sm text-slate-500 mb-4">In project: {parentName}</p>
                <input 
                    className="w-full p-2 border rounded mb-4" 
                    placeholder="Subtopic Name (e.g. Methodology)" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                    <button 
                        onClick={() => { onCreate(name); onClose(); setName(''); }} 
                        disabled={!name.trim()}
                        className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-50"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- App Root ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'library' | 'search' | 'reader' | 'flow' | 'notes' | 'editor'>('library');
  const [activePaperId, setActivePaperId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeSubtopicId, setActiveSubtopicId] = useState<string | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  
  const [papers, setPapers] = useState<Paper[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSubtopicModalOpen, setIsSubtopicModalOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string | null>(null);

  useEffect(() => {
      setUser(auth.currentUser);
      const unsubPapers = subscribeToPapers(auth.currentUser!.uid, setPapers);
      const unsubProjects = subscribeToProjects(auth.currentUser!.uid, setProjects);
      const unsubDocuments = subscribeToDocuments(auth.currentUser!.uid, setDocuments);
      return () => {
          unsubPapers();
          unsubProjects();
          unsubDocuments();
      };
  }, []);

  const handleAddPaper = (result: SearchResult) => {
      const newPaper: Paper = {
          id: result.paperId,
          title: result.title,
          authors: result.authors,
          year: result.year,
          abstract: result.abstract,
          venue: result.venue,
          url: result.url,
          citationCount: result.citationCount,
          isOpenAccess: result.isOpenAccess,
          addedAt: new Date().toISOString(),
          tags: [],
          notes: [],
          projectIds: activeProjectId ? [activeProjectId] : [],
          subtopicIds: activeSubtopicId ? [activeSubtopicId] : [],
          pdfUrl: result.openAccessPdf?.url,
          source: result.source,
          doi: result.doi || null
      };
      addPaperToDb(user.uid, newPaper);
      alert("Paper added to library!");
  };
  
  const handleCreateProject = (name: string, color: string) => {
      const newProject: Project = {
          id: Date.now().toString(),
          name,
          color,
          createdAt: new Date().toISOString(),
          subtopics: []
      };
      addProjectToDb(user.uid, newProject);
  };

  const handleCreateSubtopic = (name: string) => {
      if (!targetProjectId) return;
      const project = projects.find(p => p.id === targetProjectId);
      if (!project) return;
      
      const newSubtopic: Subtopic = {
          id: Date.now().toString(),
          name,
          projectId: targetProjectId
      };
      updateProjectInDb({
          ...project,
          subtopics: [...(project.subtopics || []), newSubtopic]
      });
  };

  const handleUpdatePaperProject = (paperId: string, projectId: string, add: boolean) => {
      const paper = papers.find(p => p.id === paperId);
      if(!paper) return;
      
      const currentIds = paper.projectIds || [];
      const newIds = add 
        ? [...new Set([...currentIds, projectId])]
        : currentIds.filter(id => id !== projectId);
      
      updatePaperInDb({ ...paper, projectIds: newIds });
  };

  const handleUpdatePaperSubtopic = (paperId: string, projectId: string, subtopicId: string, add: boolean) => {
      const paper = papers.find(p => p.id === paperId);
      if(!paper) return;
      
      let currentProjIds = paper.projectIds || [];
      if (add && !currentProjIds.includes(projectId)) {
          currentProjIds = [...currentProjIds, projectId];
      }

      const currentSubIds = paper.subtopicIds || [];
      const newSubIds = add
        ? [...new Set([...currentSubIds, subtopicId])]
        : currentSubIds.filter(id => id !== subtopicId);
        
      updatePaperInDb({ ...paper, subtopicIds: newSubIds, projectIds: currentProjIds });
  };

  const handleSaveFlow = (nodes: Node[], edges: Edge[]) => {
      if (!activeProjectId) return;
      const project = projects.find(p => p.id === activeProjectId);
      if (!project) return;

      updateProjectInDb({
          ...project,
          flowData: {
              nodes: nodes.map(n => ({...n, data: { ...n.data, onRead: undefined, onAddNote: undefined, onChangeColor: undefined, onChangeLabel: undefined, onChangeBoxMode: undefined }})),
              edges: edges.map(e => ({ ...e, data: { label: e.data?.label } }))
          }
      });
  };

  const handleCreateDocument = () => {
      const newDoc: Document = {
          id: Date.now().toString(),
          title: '',
          content: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      };
      addDocumentToDb(newDoc);
      setActiveDocumentId(newDoc.id);
      setView('editor');
  };

  const activePaper = useMemo(() => papers.find(p => p.id === activePaperId), [papers, activePaperId]);
  const currentProject = useMemo(() => projects.find(p => p.id === activeProjectId), [projects, activeProjectId]);
  const currentDocument = useMemo(() => documents.find(d => d.id === activeDocumentId), [documents, activeDocumentId]);

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans">
      <Sidebar 
         user={user}
         projects={projects}
         view={view}
         activeProjectId={activeProjectId}
         activeSubtopicId={activeSubtopicId}
         onSetView={(v: string) => setView(v as any)}
         onSetActiveProject={setActiveProjectId}
         onSetActiveSubtopic={setActiveSubtopicId}
         onDeleteProject={deleteProjectFromDb}
         onOpenProjectModal={() => setIsProjectModalOpen(true)}
         onOpenSubtopicModal={(pid) => { setTargetProjectId(pid); setIsSubtopicModalOpen(true); }}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-white">
          {view === 'search' && (
              <div className="h-full overflow-y-auto">
                 <SearchView onAddPaper={handleAddPaper} />
              </div>
          )}

          {view === 'library' && (
              <LibraryView 
                 papers={papers}
                 projects={projects}
                 activeProjectId={activeProjectId}
                 activeSubtopicId={activeSubtopicId}
                 onSelectPaper={(p) => { setActivePaperId(p.id); setView('reader'); }}
                 onDeletePaper={(id) => deletePaperFromDb(id)}
                 onExport={() => setIsCitationModalOpen(true)}
                 onUpdatePaperProject={handleUpdatePaperProject}
                 onUpdatePaperSubtopic={handleUpdatePaperSubtopic}
              />
          )}

          {view === 'flow' && currentProject && (
              <FlowView 
                project={currentProject}
                papers={papers}
                onSave={handleSaveFlow}
                onReadPaper={(id) => { setActivePaperId(id); setView('reader'); }}
                onUpdatePaper={updatePaperInDb}
              />
          )}

          {view === 'notes' && (
              <NotesList 
                  documents={documents}
                  onSelect={(doc) => { setActiveDocumentId(doc.id); setView('editor'); }}
                  onDelete={deleteDocumentFromDb}
                  onCreate={handleCreateDocument}
              />
          )}

          {view === 'editor' && currentDocument && (
              <EditorView
                  key={currentDocument.id}
                  document={currentDocument}
                  onSave={updateDocumentInDb}
                  onBack={() => setView('notes')}
                  onDelete={() => { deleteDocumentFromDb(currentDocument.id); setView('notes'); }}
              />
          )}

          {view === 'reader' && activePaper && (
              <ReaderView 
                 paper={activePaper}
                 user={user}
                 onUpdatePaper={updatePaperInDb}
                 onImportReference={(ref) => handleAddPaper(ref)}
              />
          )}
      </div>
      
      {/* Modals */}
      <CitationModal 
         isOpen={isCitationModalOpen} 
         onClose={() => setIsCitationModalOpen(false)} 
         papers={activeProjectId ? papers.filter(p => p.projectIds.includes(activeProjectId)) : papers} 
      />
      <CreateProjectModal
         isOpen={isProjectModalOpen}
         onClose={() => setIsProjectModalOpen(false)}
         onCreate={handleCreateProject}
      />
      <CreateSubtopicModal
         isOpen={isSubtopicModalOpen}
         onClose={() => setIsSubtopicModalOpen(false)}
         onCreate={handleCreateSubtopic}
         parentName={projects.find(p => p.id === targetProjectId)?.name || 'Project'}
      />
    </div>
  );
}
