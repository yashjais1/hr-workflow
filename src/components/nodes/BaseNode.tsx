import React from 'react';
import { Handle, Position } from 'reactflow';
import { AlertTriangle } from 'lucide-react';

interface BaseNodeProps {
  children: React.ReactNode;
  hasError?: boolean;
  errorMessage?: string;
  accentColor: string;
  icon: React.ReactNode;
  label: string;
  showTarget?: boolean;
  showSource?: boolean;
  selected?: boolean;
}

export default function BaseNode({
  children,
  hasError,
  errorMessage,
  accentColor,
  icon,
  label,
  showTarget = true,
  showSource = true,
  selected,
}: BaseNodeProps) {
  return (
    <div
      style={{
        borderColor: hasError ? '#ef4444' : selected ? accentColor : 'rgba(255,255,255,0.08)',
        boxShadow: selected
          ? `0 0 0 2px ${accentColor}40, 0 8px 32px rgba(0,0,0,0.4)`
          : hasError
          ? '0 0 0 2px #ef444440, 0 4px 16px rgba(0,0,0,0.3)'
          : '0 4px 16px rgba(0,0,0,0.3)',
      }}
      className="base-node"
    >
      {showTarget && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: accentColor, border: '2px solid #0f1117', width: 10, height: 10 }}
        />
      )}

      <div className="node-header" style={{ background: `${accentColor}20`, borderColor: `${accentColor}30` }}>
        <span className="node-icon" style={{ color: accentColor }}>
          {icon}
        </span>
        <span className="node-type-label" style={{ color: accentColor }}>
          {label}
        </span>
      </div>

      <div className="node-body">{children}</div>

      {hasError && (
        <div className="node-error-badge">
          <AlertTriangle size={10} />
          <span>{errorMessage}</span>
        </div>
      )}

      {showSource && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: accentColor, border: '2px solid #0f1117', width: 10, height: 10 }}
        />
      )}
    </div>
  );
}
