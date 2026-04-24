import { useEffect } from 'react';
import Toolbar from '@/components/ui/Toolbar';
import NodeSidebar from '@/components/sidebar/NodeSidebar';
import WorkflowCanvas from '@/components/ui/WorkflowCanvas';
import PropertiesPanel from '@/components/panels/PropertiesPanel';
import SandboxPanel from '@/components/panels/SandboxPanel';
import StatsModal from '@/components/panels/StatsModal';
import { useWorkflowStore } from '@/store/workflowStore';

export default function App() {
  const { sandboxOpen, statsOpen, undo, redo, canUndo, canRedo, runValidation } = useWorkflowStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      }
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        if (canRedo()) redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, canUndo, canRedo]);

  useEffect(() => {
    runValidation();
  }, []);

  return (
    <div className="app-layout">
      <Toolbar />
      <div className="app-body">
        <NodeSidebar />
        <WorkflowCanvas />
        <PropertiesPanel />
      </div>
      {sandboxOpen && <SandboxPanel />}
      {statsOpen && <StatsModal />}
    </div>
  );
}
