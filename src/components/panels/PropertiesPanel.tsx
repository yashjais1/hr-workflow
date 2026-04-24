import { X, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import {
  StartNodeForm,
  TaskNodeForm,
  ApprovalNodeForm,
  AutomatedNodeForm,
  EndNodeForm,
} from '@/components/forms/NodeForms';
import type { WorkflowNodeData } from '@/types';

const NODE_TYPE_LABELS: Record<string, string> = {
  startNode: 'Start Node',
  taskNode: 'Task Node',
  approvalNode: 'Approval Node',
  automatedNode: 'Automated Step',
  endNode: 'End Node',
};

const NODE_TYPE_COLORS: Record<string, string> = {
  startNode: '#22c55e',
  taskNode: '#6366f1',
  approvalNode: '#f59e0b',
  automatedNode: '#06b6d4',
  endNode: '#ec4899',
};

export default function PropertiesPanel() {
  const { nodes, selectedNodeId, setSelectedNodeId, deleteNode } = useWorkflowStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside className="properties-panel properties-panel--empty">
        <div className="empty-state">
          <div className="empty-icon">⚙️</div>
          <p className="empty-title">No node selected</p>
          <p className="empty-sub">Click any node on the canvas to edit its properties</p>
        </div>
      </aside>
    );
  }

  const nodeType = selectedNode.type as string;
  const data = selectedNode.data as WorkflowNodeData;
  const accentColor = NODE_TYPE_COLORS[nodeType] || '#6366f1';

  return (
    <aside className="properties-panel">
      <div className="panel-header" style={{ borderColor: `${accentColor}30` }}>
        <div className="panel-header-left">
          <div className="panel-accent-dot" style={{ background: accentColor }} />
          <div>
            <p className="panel-node-type" style={{ color: accentColor }}>
              {NODE_TYPE_LABELS[nodeType] || nodeType}
            </p>
            <p className="panel-node-id">ID: {selectedNode.id}</p>
          </div>
        </div>
        <div className="panel-header-actions">
          {nodeType !== 'startNode' && (
            <button
              className="icon-btn icon-btn--danger"
              onClick={() => deleteNode(selectedNode.id)}
              title="Delete node"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            className="icon-btn"
            onClick={() => setSelectedNodeId(null)}
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {data.hasError && (
        <div className="error-banner">
          ⚠️ {data.errorMessage}
        </div>
      )}

      <div className="panel-body">
        {nodeType === 'startNode' && <StartNodeForm nodeId={selectedNode.id} />}
        {nodeType === 'taskNode' && <TaskNodeForm nodeId={selectedNode.id} />}
        {nodeType === 'approvalNode' && <ApprovalNodeForm nodeId={selectedNode.id} />}
        {nodeType === 'automatedNode' && <AutomatedNodeForm nodeId={selectedNode.id} />}
        {nodeType === 'endNode' && <EndNodeForm nodeId={selectedNode.id} />}
      </div>
    </aside>
  );
}
