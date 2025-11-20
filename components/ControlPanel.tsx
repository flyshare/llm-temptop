import React from 'react';
import { SimulationState } from '../types';
import { Info, Thermometer, Filter, Target } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ControlPanelProps {
  values: SimulationState;
  onChange: (key: keyof SimulationState, value: number) => void;
  maxK: number;
  disabled?: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ values, onChange, maxK, disabled }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700 space-y-8 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>参数控制</span>
        <span className="text-slate-500 text-sm font-normal">(Parameters)</span>
      </h3>

      {/* Temperature */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-cyan-400 font-medium">
            <Thermometer size={18} />
            Temperature (温度)
            <Tooltip text="控制概率分布的'平滑度'。值越高，选择越随机；值越低，越倾向于高概率词。">
              <Info size={14} className="text-slate-500 cursor-help" />
            </Tooltip>
          </div>
          <span className="text-white font-mono bg-slate-900 px-2 py-1 rounded">{values.temperature.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="2.0"
          step="0.1"
          value={values.temperature}
          disabled={disabled}
          onChange={(e) => onChange('temperature', parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>0.1 (保守/确定)</span>
          <span>2.0 (创意/疯狂)</span>
        </div>
      </div>

      {/* Top K */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-purple-400 font-medium">
            <Filter size={18} />
            Top-K
            <Tooltip text="硬截断：只保留概率最高的前 K 个候选项。其余的全部淘汰。">
              <Info size={14} className="text-slate-500 cursor-help" />
            </Tooltip>
          </div>
          <span className="text-white font-mono bg-slate-900 px-2 py-1 rounded">{values.topK}</span>
        </div>
        <input
          type="range"
          min="1"
          max={maxK}
          step="1"
          value={values.topK}
          disabled={disabled}
          onChange={(e) => onChange('topK', parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>1 (仅最强)</span>
          <span>{maxK} (所有词)</span>
        </div>
      </div>

      {/* Top P */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-pink-400 font-medium">
            <Target size={18} />
            Top-P (Nucleus)
            <Tooltip text="累积概率截断：保留加起来概率达到 P 的最小集合。动态调整候选数量。">
              <Info size={14} className="text-slate-500 cursor-help" />
            </Tooltip>
          </div>
          <span className="text-white font-mono bg-slate-900 px-2 py-1 rounded">{values.topP.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.05"
          max="1.0"
          step="0.05"
          value={values.topP}
          disabled={disabled}
          onChange={(e) => onChange('topP', parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>0.1 (极少数)</span>
          <span>1.0 (全部)</span>
        </div>
      </div>
    </div>
  );
};
