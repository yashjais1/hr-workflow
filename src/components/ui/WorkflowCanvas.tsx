import { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '@/store/workflowStore';
import { StartNode, TaskNode, ApprovalNode, AutomatedNode, EndNode } from '@/components/nodes';
import { generateId } from '@/utils/helpers';
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
  WorkflowNodeData,
} from '@/types';
import type { Node } from 'reactflow';

const nodeTypes = {
  startNode: StartNode,
  taskNode: TaskNode,
  approvalNode: ApprovalNode,
  automatedNode: AutomatedNode,
  endNode: EndNode,
};

function createNodeData(type: string): WorkflowNodeData {
  switch (type) {
    case 'startNode':
      return { type: 'startNode', label: 'Start', title: 'New Start', metadata: [] } as StartNodeData;
    case 'taskNode':
      return {
        type: 'taskNode',
        label: 'Task',
        title: 'New Task',
        description: '',
        assignee: '',
        dueDate: '',
        customFields: [],
      } as TaskNodeData;
    case 'approvalNode':
      return {
        type: 'approvalNode',
        label: 'Approval',
        title: 'New Approval',
        approverRole: 'Manager',
        autoApproveThreshold: 0,
      } as ApprovalNodeData;
    case 'automatedNode':
      return {
        type: 'automatedNode',
        label: 'Automated',
        title: 'Automated Step',
        actionId: '',
        actionParams: {},
      } as AutomatedNodeData;
    case 'endNode':
      return {
        type: 'endNode',
        label: 'End',
        endMessage: 'Workflow Complete',
        showSummary: false,
      } as EndNodeData;
    default:
      return { type: 'startNode', label: 'Node', title: 'Node', metadata: [] } as StartNodeData;
  }
}

export default function WorkflowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNodeId } =
    useWorkflowStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    rfInstanceRef.current = instance;
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !rfInstanceRef.current || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstanceRef.current.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node<WorkflowNodeData> = {
        id: generateId(type.replace('Node', '')),
        type,
        position,
        data: createNodeData(type),
      };

      addNode(newNode);
      setSelectedNodeId(newNode.id);
    },
    [addNode, setSelectedNodeId]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div ref={reactFlowWrapper} className="canvas-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode="Backspace"
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#ffffff0a"
        />
        <Controls
          style={{
            background: '#1a1d27',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
          }}
        />
        <MiniMap
          style={{
            background: '#0f1117',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
          }}
          nodeColor={(node) => {
            const colorMap: Record<string, string> = {
              startNode: '#22c55e',
              taskNode: '#6366f1',
              approvalNode: '#f59e0b',
              automatedNode: '#06b6d4',
              endNode: '#ec4899',
            };
            return colorMap[node.type as string] || '#6366f1';
          }}
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  );
}
