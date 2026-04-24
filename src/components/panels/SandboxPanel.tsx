import { useState } from 'react';
import { X, Play, CheckCircle, AlertTriangle, XCircle, Clock, SkipForward } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { simulateWorkflow } from '@/api';
import { validateWorkflow } from '@/utils/validation';
import { formatDuration } from '@/utils/helpers';
import type { SimulationStep, SimulateResponse } from '@/types';

const STATUS_ICONS = {
  success: <CheckCircle size={14} color="#22c55e" />,
  warning: <AlertTriangle size={14} color="#f59e0b" />,
  error: <XCircle size={14} color="#ef4444" />,
  skipped: <SkipForward size={14} color="#6b7280" />,
};

const STATUS_COLORS = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  skipped: '#6b7280',
};

function StepRow({ step, index }: { step: SimulationStep; index: number }) {
  return (
    <div className="sim-step" style={{ borderColor: `${STATUS_COLORS[step.status]}20` }}>
      <div className="sim-step-index">{index + 1}</div>
      <div className="sim-step-icon">{STATUS_ICONS[step.status]}</div>
      <div className="sim-step-content">
        <p className="sim-step-label">{step.label}</p>
        <p className="sim-step-message">{step.message}</p>
      </div>
      <div className="sim-step-duration">
        <Clock size={10} />
        {formatDuration(step.duration)}
      </div>
    </div>
  );
}

export default function SandboxPanel() {
  const { nodes, edges, setSandboxOpen } = useWorkflowStore();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulateResponse | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleRun = async () => {
    setResult(null);

    const validation = validateWorkflow(nodes, edges);
    if (!validation.valid) {
      setValidationErrors(validation.errors.map((e) => e.message));
      return;
    }
    setValidationErrors([]);
    setRunning(true);

    try {
      const simNodes = nodes.map((n) => ({ id: n.id, type: n.type as string, data: n.data }));
      const simEdges = edges.map((e) => ({ id: e.id, source: e.source, target: e.target }));
      const res = await simulateWorkflow({ nodes: simNodes, edges: simEdges });
      setResult(res);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="sandbox-overlay">
      <div className="sandbox-panel">
        {/* Header */}
        <div className="sandbox-header">
          <div>
            <p className="sandbox-title">Workflow Sandbox</p>
            <p className="sandbox-subtitle">
              {nodes.length} nodes · {edges.length} connections
            </p>
          </div>
          <div className="sandbox-header-actions">
            <button
              className="btn-primary"
              onClick={handleRun}
              disabled={running}
            >
              {running ? (
                <>
                  <span className="spinner" /> Running...
                </>
              ) : (
                <>
                  <Play size={13} /> Run Simulation
                </>
              )}
            </button>
            <button className="icon-btn" onClick={() => setSandboxOpen(false)}>
              <X size={16} />
            </button>
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="sandbox-errors">
            <p className="sandbox-errors-title">⚠️ Validation Failed</p>
            {validationErrors.map((e, i) => (
              <p key={i} className="sandbox-error-item">• {e}</p>
            ))}
          </div>
        )}

        {!result && !running && validationErrors.length === 0 && (
          <div className="sandbox-empty">
            <div className="sandbox-empty-icon">▶</div>
            <p>Click "Run Simulation" to test your workflow</p>
          </div>
        )}

        {running && (
          <div className="sandbox-loading">
            <div className="loading-bar">
              <div className="loading-bar-fill" />
            </div>
            <p>Simulating workflow execution...</p>
          </div>
        )}

        {result && (
          <div className="sandbox-results">
            <div
              className="sandbox-summary"
              style={{ borderColor: result.success ? '#22c55e30' : '#ef444430' }}
            >
              <div className="sandbox-summary-icon">
                {result.success ? <CheckCircle size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
              </div>
              <div>
                <p className="sandbox-summary-text">{result.summary}</p>
                <p className="sandbox-summary-meta">
                  Total time: {formatDuration(result.totalDuration)} · {result.steps.length} steps executed
                </p>
              </div>
            </div>

            <div className="sandbox-steps-header">
              <p>Execution Log</p>
            </div>
            <div className="sandbox-steps">
              {result.steps.map((step, i) => (
                <StepRow key={step.nodeId} step={step} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
