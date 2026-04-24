export type NodeType =
  | 'startNode'
  | 'taskNode'
  | 'approvalNode'
  | 'automatedNode'
  | 'endNode';

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface StartNodeData {
  type: 'startNode';
  label: string;
  title: string;
  metadata: KeyValuePair[];
  hasError?: boolean;
  errorMessage?: string;
}

export interface TaskNodeData {
  type: 'taskNode';
  label: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
  hasError?: boolean;
  errorMessage?: string;
}

export interface ApprovalNodeData {
  type: 'approvalNode';
  label: string;
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
  hasError?: boolean;
  errorMessage?: string;
}

export interface AutomatedNodeData {
  type: 'automatedNode';
  label: string;
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
  hasError?: boolean;
  errorMessage?: string;
}

export interface EndNodeData {
  type: 'endNode';
  label: string;
  endMessage: string;
  showSummary: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulateRequest {
  nodes: SimulateNode[];
  edges: SimulateEdge[];
}

export interface SimulateNode {
  id: string;
  type: string;
  data: WorkflowNodeData;
}

export interface SimulateEdge {
  id: string;
  source: string;
  target: string;
}

export interface SimulationStep {
  nodeId: string;
  nodeType: string;
  label: string;
  status: 'success' | 'warning' | 'error' | 'skipped';
  message: string;
  duration: number;
}

export interface SimulateResponse {
  success: boolean;
  steps: SimulationStep[];
  summary: string;
  totalDuration: number;
}

export interface ValidationError {
  nodeId: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
