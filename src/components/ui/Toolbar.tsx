import { useRef } from 'react';
import {
  Undo2,
  Redo2,
  Play,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  BarChart2,
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';

export default function Toolbar() {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    setSandboxOpen,
    setStatsOpen,
    exportWorkflow,
    importWorkflow,
    validationErrors,
    runValidation,
    nodes,
  } = useWorkflowStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hr-workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      importWorkflow(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const hasErrors = validationErrors.length > 0;
  const isValid = nodes.length > 0 && !hasErrors;

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <div className="toolbar-brand">
          <span className="toolbar-brand-icon">◈</span>
          <span className="toolbar-brand-text">HR Workflow Designer</span>
        </div>
      </div>

      <div className="toolbar-center">
        <button
          className="toolbar-btn"
          onClick={undo}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={15} />
        </button>
        <button
          className="toolbar-btn"
          onClick={redo}
          disabled={!canRedo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={15} />
        </button>

        <div className="toolbar-divider" />

        <button className="toolbar-btn" onClick={handleExport} title="Export workflow as JSON">
          <Download size={15} />
          <span>Export</span>
        </button>
        <button
          className="toolbar-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Import workflow from JSON"
        >
          <Upload size={15} />
          <span>Import</span>
        </button>
        <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />

        <div className="toolbar-divider" />

        <button
          className="toolbar-btn"
          onClick={() => setStatsOpen(true)}
          title="Workflow Analytics"
          disabled={nodes.length === 0}
        >
          <BarChart2 size={15} />
          <span>Analytics</span>
        </button>

        <div className="toolbar-divider" />

        <button
          className={`toolbar-btn ${hasErrors ? 'toolbar-btn--error' : isValid ? 'toolbar-btn--success' : ''}`}
          onClick={runValidation}
          title="Validate workflow"
        >
          {hasErrors ? (
            <>
              <AlertCircle size={15} />
              <span>{validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}</span>
            </>
          ) : isValid ? (
            <>
              <CheckCircle2 size={15} />
              <span>Valid</span>
            </>
          ) : (
            <>
              <AlertCircle size={15} />
              <span>Validate</span>
            </>
          )}
        </button>
      </div>

      <div className="toolbar-right">
        <button
          className="toolbar-btn toolbar-btn--primary"
          onClick={() => setSandboxOpen(true)}
        >
          <Play size={14} />
          Test Workflow
        </button>
      </div>
    </header>
  );
}
