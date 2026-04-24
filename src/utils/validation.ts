import type { Node, Edge } from 'reactflow';
import type { WorkflowNodeData, ValidationResult, ValidationError } from '@/types';

export function validateWorkflow(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): ValidationResult {
  const errors: ValidationError[] = [];

  if (nodes.length === 0) {
    return { valid: true, errors: [] };
  }

  const startNodes = nodes.filter((n) => n.type === 'startNode');
  if (startNodes.length === 0) {
    errors.push({ nodeId: '__global__', message: 'Workflow must have a Start Node' });
  } else if (startNodes.length > 1) {
    startNodes.slice(1).forEach((n) => {
      errors.push({ nodeId: n.id, message: 'Only one Start Node is allowed' });
    });
  }

  const endNodes = nodes.filter((n) => n.type === 'endNode');
  if (endNodes.length === 0 && nodes.length > 1) {
    errors.push({ nodeId: '__global__', message: 'Workflow must have an End Node' });
  }

  const connectedIds = new Set<string>();
  edges.forEach((e) => {
    connectedIds.add(e.source);
    connectedIds.add(e.target);
  });

  nodes.forEach((n) => {
    if (nodes.length > 1 && !connectedIds.has(n.id)) {
      errors.push({ nodeId: n.id, message: 'Node is disconnected from the workflow' });
    }
  });

  startNodes.forEach((sn) => {
    const incomingToStart = edges.filter((e) => e.target === sn.id);
    if (incomingToStart.length > 0) {
      errors.push({ nodeId: sn.id, message: 'Start Node should not have incoming connections' });
    }
  });

  endNodes.forEach((en) => {
    const outgoingFromEnd = edges.filter((e) => e.source === en.id);
    if (outgoingFromEnd.length > 0) {
      errors.push({ nodeId: en.id, message: 'End Node should not have outgoing connections' });
    }
  });

  nodes
    .filter((n) => n.type === 'taskNode')
    .forEach((n) => {
      const d = n.data as { title?: string };
      if (!d.title || d.title.trim() === '') {
        errors.push({ nodeId: n.id, message: 'Task Node requires a title' });
      }
    });

  const adjList = new Map<string, string[]>();
  nodes.forEach((n) => adjList.set(n.id, []));
  edges.forEach((e) => {
    if (adjList.has(e.source)) adjList.get(e.source)!.push(e.target);
  });

  const visited = new Set<string>();
  const recStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    visited.add(nodeId);
    recStack.add(nodeId);
    for (const neighbor of adjList.get(nodeId) || []) {
      if (!visited.has(neighbor) && hasCycle(neighbor)) return true;
      if (recStack.has(neighbor)) return true;
    }
    recStack.delete(nodeId);
    return false;
  }

  let cycleDetected = false;
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycle(node.id)) {
        cycleDetected = true;
        break;
      }
    }
  }

  if (cycleDetected) {
    errors.push({ nodeId: '__global__', message: 'Workflow contains a cycle — loops are not allowed' });
  }

  return { valid: errors.length === 0, errors };
}
