import { type NodeProps } from 'reactflow';
import { Play, CheckSquare, ThumbsUp, Zap, Flag } from 'lucide-react';
import BaseNode from './BaseNode';
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '@/types';

export function StartNode({ data, selected }: NodeProps<StartNodeData>) {
  return (
    <BaseNode
      accentColor="#22c55e"
      icon={<Play size={12} />}
      label="Start"
      showTarget={false}
      hasError={data.hasError}
      errorMessage={data.errorMessage}
      selected={selected}
    >
      <p className="node-title">{data.title || 'Untitled Start'}</p>
      {data.metadata?.length > 0 && (
        <div className="node-tags">
          {data.metadata.slice(0, 2).map((m, i) => (
            <span key={i} className="node-tag">
              {m.key}: {m.value}
            </span>
          ))}
        </div>
      )}
    </BaseNode>
  );
}

export function TaskNode({ data, selected }: NodeProps<TaskNodeData>) {
  return (
    <BaseNode
      accentColor="#6366f1"
      icon={<CheckSquare size={12} />}
      label="Task"
      hasError={data.hasError}
      errorMessage={data.errorMessage}
      selected={selected}
    >
      <p className="node-title">{data.title || 'Untitled Task'}</p>
      {data.assignee && (
        <p className="node-meta">👤 {data.assignee}</p>
      )}
      {data.dueDate && (
        <p className="node-meta">📅 {data.dueDate}</p>
      )}
    </BaseNode>
  );
}

export function ApprovalNode({ data, selected }: NodeProps<ApprovalNodeData>) {
  return (
    <BaseNode
      accentColor="#f59e0b"
      icon={<ThumbsUp size={12} />}
      label="Approval"
      hasError={data.hasError}
      errorMessage={data.errorMessage}
      selected={selected}
    >
      <p className="node-title">{data.title || 'Untitled Approval'}</p>
      {data.approverRole && (
        <p className="node-meta">🏷 {data.approverRole}</p>
      )}
      {data.autoApproveThreshold > 0 && (
        <p className="node-meta">⚡ Auto ≥ {data.autoApproveThreshold}</p>
      )}
    </BaseNode>
  );
}

export function AutomatedNode({ data, selected }: NodeProps<AutomatedNodeData>) {
  return (
    <BaseNode
      accentColor="#06b6d4"
      icon={<Zap size={12} />}
      label="Automated"
      hasError={data.hasError}
      errorMessage={data.errorMessage}
      selected={selected}
    >
      <p className="node-title">{data.title || 'Automated Step'}</p>
      {data.actionId && (
        <p className="node-meta">⚙ {data.actionId.replace(/_/g, ' ')}</p>
      )}
    </BaseNode>
  );
}

export function EndNode({ data, selected }: NodeProps<EndNodeData>) {
  return (
    <BaseNode
      accentColor="#ec4899"
      icon={<Flag size={12} />}
      label="End"
      showSource={false}
      hasError={data.hasError}
      errorMessage={data.errorMessage}
      selected={selected}
    >
      <p className="node-title">{data.endMessage || 'Workflow Complete'}</p>
      {data.showSummary && (
        <p className="node-meta">📋 Summary enabled</p>
      )}
    </BaseNode>
  );
}
