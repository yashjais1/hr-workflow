import type {
  AutomationAction,
  SimulateRequest,
  SimulateResponse,
  SimulationStep,
} from '@/types';

const MOCK_AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'send_slack', label: 'Send Slack Message', params: ['channel', 'message'] },
  { id: 'create_ticket', label: 'Create JIRA Ticket', params: ['project', 'summary', 'assignee'] },
  { id: 'update_hrms', label: 'Update HRMS Record', params: ['employeeId', 'field', 'value'] },
  { id: 'schedule_meeting', label: 'Schedule Meeting', params: ['title', 'attendees', 'duration'] },
  { id: 'generate_badge', label: 'Generate Access Badge', params: ['employeeId', 'accessLevel'] },
  { id: 'send_sms', label: 'Send SMS Notification', params: ['phone', 'message'] },
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(300);
  return MOCK_AUTOMATIONS;
}

export async function simulateWorkflow(request: SimulateRequest): Promise<SimulateResponse> {
  await delay(800);

  const steps: SimulationStep[] = [];
  let totalDuration = 0;

  const adjacency = new Map<string, string[]>();
  for (const edge of request.edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    adjacency.get(edge.source)!.push(edge.target);
  }

  const startNode = request.nodes.find((n) => n.type === 'startNode');
  if (!startNode) {
    return {
      success: false,
      steps: [],
      summary: 'No Start Node found. Workflow cannot be executed.',
      totalDuration: 0,
    };
  }

  const visited = new Set<string>();
  const queue: string[] = [startNode.id];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = request.nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    const duration = Math.floor(Math.random() * 800) + 200;
    totalDuration += duration;

    let status: SimulationStep['status'] = 'success';
    let message = '';

    switch (node.type) {
      case 'startNode': {
        const d = node.data as { title?: string };
        message = `Workflow initialized: "${d.title || 'Untitled'}"`;
        break;
      }
      case 'taskNode': {
        const d = node.data as { title?: string; assignee?: string; dueDate?: string };
        if (!d.assignee) {
          status = 'warning';
          message = `Task "${d.title}" has no assignee — will be unassigned`;
        } else {
          message = `Task "${d.title}" assigned to ${d.assignee}${d.dueDate ? ` · Due: ${d.dueDate}` : ''}`;
        }
        break;
      }
      case 'approvalNode': {
        const d = node.data as { title?: string; approverRole?: string; autoApproveThreshold?: number };
        const threshold = d.autoApproveThreshold ?? 0;
        if (threshold > 0) {
          message = `Approval "${d.title}" sent to ${d.approverRole || 'Manager'} · Auto-approves if score > ${threshold}`;
        } else {
          message = `Approval "${d.title}" sent to ${d.approverRole || 'Manager'} · Manual review required`;
        }
        break;
      }
      case 'automatedNode': {
        const d = node.data as { title?: string; actionId?: string };
        const action = MOCK_AUTOMATIONS.find((a) => a.id === d.actionId);
        if (!action) {
          status = 'warning';
          message = `Automated step "${d.title}" — No action configured`;
        } else {
          message = `Executing: ${action.label} for step "${d.title}"`;
        }
        break;
      }
      case 'endNode': {
        const d = node.data as { endMessage?: string; showSummary?: boolean };
        message = `Workflow completed${d.endMessage ? `: ${d.endMessage}` : ''}${d.showSummary ? ' · Summary report generated' : ''}`;
        break;
      }
      default:
        message = `Processing node: ${node.type}`;
    }

    steps.push({
      nodeId,
      nodeType: node.type,
      label: (node.data as { title?: string; label?: string }).title || (node.data as { label?: string }).label || node.type,
      status,
      message,
      duration,
    });

    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) queue.push(neighbor);
    }
  }

  const warnings = steps.filter((s) => s.status === 'warning').length;
  const summary =
    warnings > 0
      ? `Workflow completed with ${warnings} warning(s). Review highlighted steps.`
      : `Workflow executed successfully across ${steps.length} step(s).`;

  return { success: true, steps, summary, totalDuration };
}
