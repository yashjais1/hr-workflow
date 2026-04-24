import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { getAutomations } from '@/api';
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
  AutomationAction,
  KeyValuePair,
} from '@/types';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      className="form-input"
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      className="form-textarea"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
    />
  );
}

function KVEditor({
  pairs,
  onChange,
}: {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
}) {
  const add = () => onChange([...pairs, { key: '', value: '' }]);
  const remove = (i: number) => onChange(pairs.filter((_, idx) => idx !== i));
  const update = (i: number, field: 'key' | 'value', val: string) => {
    const next = [...pairs];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div className="kv-editor">
      {pairs.map((p, i) => (
        <div key={i} className="kv-row">
          <input
            className="form-input kv-input"
            placeholder="key"
            value={p.key}
            onChange={(e) => update(i, 'key', e.target.value)}
          />
          <input
            className="form-input kv-input"
            placeholder="value"
            value={p.value}
            onChange={(e) => update(i, 'value', e.target.value)}
          />
          <button className="kv-delete" onClick={() => remove(i)}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button className="btn-ghost-sm" onClick={add}>
        <Plus size={12} /> Add field
      </button>
    </div>
  );
}

export function StartNodeForm({ nodeId }: { nodeId: string }) {
  const { nodes, updateNodeData } = useWorkflowStore();
  const node = nodes.find((n) => n.id === nodeId);
  const data = node?.data as StartNodeData | undefined;

  if (!data) return null;

  const update = (partial: Partial<StartNodeData>) => updateNodeData(nodeId, partial);

  return (
    <div className="node-form">
      <Field label="Start Title *">
        <Input value={data.title} onChange={(v) => update({ title: v })} placeholder="e.g. Employee Onboarding" />
      </Field>
      <Field label="Metadata">
        <KVEditor pairs={data.metadata || []} onChange={(metadata) => update({ metadata })} />
      </Field>
    </div>
  );
}

export function TaskNodeForm({ nodeId }: { nodeId: string }) {
  const { nodes, updateNodeData } = useWorkflowStore();
  const node = nodes.find((n) => n.id === nodeId);
  const data = node?.data as TaskNodeData | undefined;

  if (!data) return null;

  const update = (partial: Partial<TaskNodeData>) => updateNodeData(nodeId, partial);

  return (
    <div className="node-form">
      <Field label="Title *">
        <Input value={data.title} onChange={(v) => update({ title: v })} placeholder="e.g. Collect Documents" />
      </Field>
      <Field label="Description">
        <Textarea
          value={data.description}
          onChange={(v) => update({ description: v })}
          placeholder="Describe what needs to be done..."
        />
      </Field>
      <Field label="Assignee">
        <Input value={data.assignee} onChange={(v) => update({ assignee: v })} placeholder="e.g. HR Team / John Doe" />
      </Field>
      <Field label="Due Date">
        <Input value={data.dueDate} onChange={(v) => update({ dueDate: v })} type="date" />
      </Field>
      <Field label="Custom Fields">
        <KVEditor pairs={data.customFields || []} onChange={(customFields) => update({ customFields })} />
      </Field>
    </div>
  );
}

const APPROVER_ROLES = ['Manager', 'HRBP', 'Director', 'VP of HR', 'Department Head', 'CEO'];

export function ApprovalNodeForm({ nodeId }: { nodeId: string }) {
  const { nodes, updateNodeData } = useWorkflowStore();
  const node = nodes.find((n) => n.id === nodeId);
  const data = node?.data as ApprovalNodeData | undefined;

  if (!data) return null;

  const update = (partial: Partial<ApprovalNodeData>) => updateNodeData(nodeId, partial);

  return (
    <div className="node-form">
      <Field label="Title">
        <Input value={data.title} onChange={(v) => update({ title: v })} placeholder="e.g. Manager Approval" />
      </Field>
      <Field label="Approver Role">
        <select
          className="form-input"
          value={data.approverRole}
          onChange={(e) => update({ approverRole: e.target.value })}
        >
          <option value="">Select role...</option>
          {APPROVER_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Auto-Approve Threshold (0 = manual)">
        <input
          className="form-input"
          type="number"
          min={0}
          max={100}
          value={data.autoApproveThreshold}
          onChange={(e) => update({ autoApproveThreshold: Number(e.target.value) })}
        />
      </Field>
    </div>
  );
}

export function AutomatedNodeForm({ nodeId }: { nodeId: string }) {
  const { nodes, updateNodeData } = useWorkflowStore();
  const node = nodes.find((n) => n.id === nodeId);
  const data = node?.data as AutomatedNodeData | undefined;

  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAutomations().then((res) => {
      setActions(res);
      setLoading(false);
    });
  }, []);

  if (!data) return null;

  const update = (partial: Partial<AutomatedNodeData>) => updateNodeData(nodeId, partial);

  const selectedAction = actions.find((a) => a.id === data.actionId);

  const handleActionChange = (actionId: string) => {
    update({ actionId, actionParams: {} });
  };

  const updateParam = (param: string, value: string) => {
    update({ actionParams: { ...data.actionParams, [param]: value } });
  };

  return (
    <div className="node-form">
      <Field label="Step Title">
        <Input value={data.title} onChange={(v) => update({ title: v })} placeholder="e.g. Send Welcome Email" />
      </Field>
      <Field label="Action">
        {loading ? (
          <div className="form-loading">Loading actions...</div>
        ) : (
          <select
            className="form-input"
            value={data.actionId}
            onChange={(e) => handleActionChange(e.target.value)}
          >
            <option value="">Select an action...</option>
            {actions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        )}
      </Field>

      {selectedAction && selectedAction.params.length > 0 && (
        <div className="action-params">
          <p className="form-section-title">Action Parameters</p>
          {selectedAction.params.map((param) => (
            <Field key={param} label={param.charAt(0).toUpperCase() + param.slice(1)}>
              <Input
                value={data.actionParams?.[param] || ''}
                onChange={(v) => updateParam(param, v)}
                placeholder={`Enter ${param}...`}
              />
            </Field>
          ))}
        </div>
      )}
    </div>
  );
}

export function EndNodeForm({ nodeId }: { nodeId: string }) {
  const { nodes, updateNodeData } = useWorkflowStore();
  const node = nodes.find((n) => n.id === nodeId);
  const data = node?.data as EndNodeData | undefined;

  if (!data) return null;

  const update = (partial: Partial<EndNodeData>) => updateNodeData(nodeId, partial);

  return (
    <div className="node-form">
      <Field label="End Message">
        <Input
          value={data.endMessage}
          onChange={(v) => update({ endMessage: v })}
          placeholder="e.g. Onboarding complete!"
        />
      </Field>
      <Field label="Generate Summary Report">
        <div className="toggle-row">
          <button
            className={`toggle-btn ${data.showSummary ? 'active' : ''}`}
            onClick={() => update({ showSummary: !data.showSummary })}
          >
            <span className="toggle-thumb" />
          </button>
          <span className="toggle-label">{data.showSummary ? 'Enabled' : 'Disabled'}</span>
        </div>
      </Field>
    </div>
  );
}
