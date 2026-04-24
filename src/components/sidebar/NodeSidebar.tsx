import React from 'react';
import { Play, CheckSquare, ThumbsUp, Zap, Flag } from 'lucide-react';

interface NodePaletteItem {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const NODE_PALETTE: NodePaletteItem[] = [
  {
    type: 'startNode',
    label: 'Start',
    description: 'Workflow entry point',
    icon: <Play size={14} />,
    color: '#22c55e',
  },
  {
    type: 'taskNode',
    label: 'Task',
    description: 'Human task step',
    icon: <CheckSquare size={14} />,
    color: '#6366f1',
  },
  {
    type: 'approvalNode',
    label: 'Approval',
    description: 'Approval / sign-off',
    icon: <ThumbsUp size={14} />,
    color: '#f59e0b',
  },
  {
    type: 'automatedNode',
    label: 'Automated',
    description: 'System-triggered action',
    icon: <Zap size={14} />,
    color: '#06b6d4',
  },
  {
    type: 'endNode',
    label: 'End',
    description: 'Workflow completion',
    icon: <Flag size={14} />,
    color: '#ec4899',
  },
];

export default function NodeSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="node-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">T</span>
          <div>
            <p className="logo-title">Tredence</p>
            <p className="logo-sub">Workflow Designer</p>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-title">NODE PALETTE</p>
        <p className="sidebar-hint">Drag nodes onto the canvas</p>

        <div className="palette-list">
          {NODE_PALETTE.map((item) => (
            <div
              key={item.type}
              className="palette-item"
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
              style={{ '--accent': item.color } as React.CSSProperties}
            >
              <div className="palette-icon" style={{ color: item.color, background: `${item.color}15` }}>
                {item.icon}
              </div>
              <div className="palette-text">
                <p className="palette-label">{item.label}</p>
                <p className="palette-desc">{item.description}</p>
              </div>
              <div className="palette-drag-hint">⠿</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section sidebar-section--bottom">
        <p className="sidebar-section-title">TIPS</p>
        <ul className="tips-list">
          <li>Drag nodes to add them</li>
          <li>Click a node to edit it</li>
          <li>Connect nodes by dragging handles</li>
          <li>Delete: select + Backspace</li>
        </ul>
      </div>
    </aside>
  );
}
