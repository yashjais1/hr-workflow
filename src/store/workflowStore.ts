import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from 'reactflow';
import type { WorkflowNodeData, ValidationError } from '@/types';
import { validateWorkflow } from '@/utils/validation';

interface HistoryEntry {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

interface WorkflowStore {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];

  selectedNodeId: string | null;

  validationErrors: ValidationError[];

  history: HistoryEntry[];
  historyIndex: number;

  sandboxOpen: boolean;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node<WorkflowNodeData>) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  runValidation: () => void;
  clearValidationErrors: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setSandboxOpen: (open: boolean) => void;
  statsOpen: boolean;
  setStatsOpen: (open: boolean) => void;
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;
  pushHistory: () => void;
}

const initialNodes: Node<WorkflowNodeData>[] = [
  {
    id: 'start-1',
    type: 'startNode',
    position: { x: 320, y: 80 },
    data: {
      type: 'startNode',
      label: 'Start',
      title: 'Employee Onboarding',
      metadata: [{ key: 'department', value: 'Engineering' }],
    },
  },
];

const initialEdges: Edge[] = [];

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  validationErrors: [],
  history: [{ nodes: initialNodes, edges: initialEdges }],
  historyIndex: 0,
  sandboxOpen: false,
  statsOpen: false,

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as Node<WorkflowNodeData>[],
    }));
  },

  onEdgesChange: (changes) => {
    const hasDelete = changes.some((c) => c.type === 'remove');
    if (hasDelete) get().pushHistory();
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    get().pushHistory();
    set((state) => ({
      edges: addEdge({ ...connection, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, state.edges),
    }));
    setTimeout(() => get().runValidation(), 50);
  },

  addNode: (node) => {
    get().pushHistory();
    set((state) => ({ nodes: [...state.nodes, node] }));
    setTimeout(() => get().runValidation(), 50);
  },

  updateNodeData: (nodeId, data) => {
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } as WorkflowNodeData } : n
      ),
    }));
    setTimeout(() => get().runValidation(), 50);
  },

  deleteNode: (nodeId) => {
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }));
    setTimeout(() => get().runValidation(), 50);
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  runValidation: () => {
    const { nodes, edges } = get();
    const result = validateWorkflow(nodes, edges);
    const errorMap = new Map(result.errors.map((e) => [e.nodeId, e.message]));

    set((state) => ({
      validationErrors: result.errors,
      nodes: state.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          hasError: errorMap.has(n.id),
          errorMessage: errorMap.get(n.id),
        } as WorkflowNodeData,
      })),
    }));
  },

  clearValidationErrors: () => {
    set((state) => ({
      validationErrors: [],
      nodes: state.nodes.map((n) => ({
        ...n,
        data: { ...n.data, hasError: false, errorMessage: undefined } as WorkflowNodeData,
      })),
    }));
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    set({
      nodes: JSON.parse(JSON.stringify(prev.nodes)),
      edges: JSON.parse(JSON.stringify(prev.edges)),
      historyIndex: historyIndex - 1,
    });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    set({
      nodes: JSON.parse(JSON.stringify(next.nodes)),
      edges: JSON.parse(JSON.stringify(next.edges)),
      historyIndex: historyIndex + 1,
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  setSandboxOpen: (open) => set({ sandboxOpen: open }),
  setStatsOpen: (open) => set({ statsOpen: open }),

  exportWorkflow: () => {
    const { nodes, edges } = get();
    return JSON.stringify({ nodes, edges }, null, 2);
  },

  importWorkflow: (json) => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed.nodes || !parsed.edges) throw new Error('Invalid format');
      get().pushHistory();
      set({ nodes: parsed.nodes, edges: parsed.edges, selectedNodeId: null });
      setTimeout(() => get().runValidation(), 50);
    } catch {
      alert('Invalid workflow JSON. Please check the format.');
    }
  },
}));
