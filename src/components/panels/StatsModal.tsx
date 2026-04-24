import { useMemo } from 'react';
import { X, BarChart2 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useWorkflowStore } from '@/store/workflowStore';

const NODE_CONFIG: Record<string, { label: string; color: string }> = {
  startNode:     { label: 'Start',     color: '#22c55e' },
  taskNode:      { label: 'Task',      color: '#6366f1' },
  approvalNode:  { label: 'Approval',  color: '#f59e0b' },
  automatedNode: { label: 'Automated', color: '#06b6d4' },
  endNode:       { label: 'End',       color: '#ec4899' },
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="stats-tooltip">
      <span className="stats-tooltip-dot" style={{ background: item.payload.color }} />
      <span className="stats-tooltip-label">{item.name}</span>
      <span className="stats-tooltip-value">{item.value}</span>
    </div>
  );
}

function renderPieLabel({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: {
  cx?: number; cy?: number; midAngle?: number;
  innerRadius?: number; outerRadius?: number; percent?: number;
}) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function StatsModal() {
  const { nodes, edges, setStatsOpen } = useWorkflowStore();

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const node of nodes) {
      const type = node.type ?? 'unknown';
      counts[type] = (counts[type] ?? 0) + 1;
    }
    return Object.entries(counts).map(([type, count]) => ({
      type,
      name: NODE_CONFIG[type]?.label ?? type,
      value: count,
      color: NODE_CONFIG[type]?.color ?? '#6366f1',
    }));
  }, [nodes]);

  const totalNodes = nodes.length;
  const totalEdges = edges.length;
  const hasData = totalNodes > 0;

  return (
    <div className="stats-overlay" onClick={() => setStatsOpen(false)}>
      <div className="stats-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="stats-header">
          <div className="stats-header-left">
            <div className="stats-header-icon">
              <BarChart2 size={16} />
            </div>
            <div>
              <p className="stats-title">Workflow Analytics</p>
              <p className="stats-subtitle">{totalNodes} nodes · {totalEdges} connections</p>
            </div>
          </div>
          <button className="icon-btn" onClick={() => setStatsOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* ── Summary pills ──────────────────────────────────────────────── */}
        <div className="stats-pills">
          {Object.entries(NODE_CONFIG).map(([type, cfg]) => {
            const count = nodes.filter((n) => n.type === type).length;
            return (
              <div key={type} className="stats-pill" style={{ borderColor: `${cfg.color}30`, background: `${cfg.color}10` }}>
                <span className="stats-pill-dot" style={{ background: cfg.color }} />
                <span className="stats-pill-label">{cfg.label}</span>
                <span className="stats-pill-count" style={{ color: cfg.color }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* ── Charts ─────────────────────────────────────────────────────── */}
        {!hasData ? (
          <div className="stats-empty">
            <div className="stats-empty-icon">📊</div>
            <p className="stats-empty-title">No nodes yet</p>
            <p className="stats-empty-sub">Add some nodes to the canvas to see analytics</p>
          </div>
        ) : (
          <div className="stats-charts">

            {/* Donut / Pie */}
            <div className="stats-chart-card">
              <p className="stats-chart-title">Distribution</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={renderPieLabel}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.type} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: 11, color: '#9ea3b8' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar chart */}
            <div className="stats-chart-card">
              <p className="stats-chart-title">Count by Type</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={28} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#9ea3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#5c6178', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.type} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="stats-footer">
          <span>Avg connections per node: {totalNodes > 0 ? (totalEdges / totalNodes).toFixed(1) : '—'}</span>
          <span>Node types used: {chartData.length} / {Object.keys(NODE_CONFIG).length}</span>
        </div>

      </div>
    </div>
  );
}
