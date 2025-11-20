import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { ProcessedCandidate } from '../types';

interface DistributionCurveProps {
  data: ProcessedCandidate[];
}

export const DistributionCurve: React.FC<DistributionCurveProps> = ({ data }) => {
  // Transform data for Recharts
  const chartData = data.map(item => ({
    name: item.token,
    prob: item.adjustedProb,
    isActive: item.isKeptByTopK && item.isKeptByTopP,
  }));

  return (
    <div className="h-48 w-full mt-4 bg-slate-900/50 rounded-lg p-2 border border-slate-800">
      <h4 className="text-xs font-semibold text-slate-400 mb-2 ml-2">概率分布曲线 (Probability Curve)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 0,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
          <RechartsTooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9', fontSize: '12px' }}
            itemStyle={{ color: '#22d3ee' }}
            cursor={{ stroke: '#64748b', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="prob" 
            stroke="#22d3ee" 
            fill="#06b6d4" 
            fillOpacity={0.2} 
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
