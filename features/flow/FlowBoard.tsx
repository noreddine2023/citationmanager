import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Paper, Project } from '../../types';
import { Save, Plus } from 'lucide-react';

interface FlowViewProps {
  project: Project;
  papers: Paper[];
  onSave: (nodes: Node[], edges: Edge[]) => void;
  onReadPaper: (paperId: string) => void;
  onUpdatePaper: (paper: Paper) => void;
}

// Custom node component for papers
const PaperNode = ({ data }: { data: any }) => {
  return (
    <div 
      className="px-4 py-3 rounded-lg shadow-md border-2 min-w-[200px] max-w-[300px]"
      style={{ 
        backgroundColor: data.color || '#f8fafc',
        borderColor: data.borderColor || '#94a3b8'
      }}
    >
      <div className="font-semibold text-sm text-slate-900 line-clamp-2">
        {data.label}
      </div>
      {data.authors && (
        <div className="text-xs text-slate-500 mt-1 line-clamp-1">
          {data.authors}
        </div>
      )}
      {data.year && (
        <div className="text-xs text-slate-400 mt-1">
          {data.year}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  paper: PaperNode,
};

export const FlowView: React.FC<FlowViewProps> = ({
  project,
  papers,
  onSave,
  onReadPaper,
  onUpdatePaper
}) => {
  const projectPapers = useMemo(
    () => papers.filter(p => p.projectIds?.includes(project.id)),
    [papers, project.id]
  );

  const initialNodes: Node[] = useMemo(() => {
    if (project.flowData?.nodes) {
      return project.flowData.nodes;
    }
    // Generate initial nodes from papers
    return projectPapers.map((paper, index) => ({
      id: paper.id,
      type: 'paper',
      position: { x: (index % 3) * 350, y: Math.floor(index / 3) * 150 },
      data: {
        label: paper.title,
        authors: paper.authors.map(a => a.name).join(', '),
        year: paper.year,
        color: '#f8fafc',
        borderColor: '#94a3b8'
      }
    }));
  }, [project.flowData?.nodes, projectPapers]);

  const initialEdges: Edge[] = useMemo(() => {
    return project.flowData?.edges || [];
  }, [project.flowData?.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = () => {
    onSave(nodes, edges);
  };

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onReadPaper(node.id);
    },
    [onReadPaper]
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            {project.name} - Flow Board
          </h2>
          <p className="text-sm text-slate-500">
            {projectPapers.length} papers • Double-click to read
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Layout
        </button>
      </div>

      {/* Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50"
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};
