import React from 'react';
import { ProcessedCandidate } from '../types';
import { CheckCircle, XCircle, Lock } from 'lucide-react';

interface CandidateListProps {
  candidates: ProcessedCandidate[];
  generating: boolean;
  selectedTokenId: number | null;
}

export const CandidateList: React.FC<CandidateListProps> = ({ candidates, generating, selectedTokenId }) => {
  return (
    <div className="flex-1 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 p-6 shadow-xl overflow-hidden flex flex-col">
      <h3 className="text-xl font-bold text-white mb-6 flex justify-between items-center">
        <span>候选词池 (Token Pool)</span>
        <div className="text-xs font-normal flex gap-4">
           <span className="flex items-center gap-1 text-emerald-400"><CheckCircle size={14}/> 保留 (Active)</span>
           <span className="flex items-center gap-1 text-slate-500"><XCircle size={14}/> 过滤 (Filtered)</span>
        </div>
      </h3>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {candidates.map((c, index) => {
          const isKept = c.isKeptByTopK && c.isKeptByTopP;
          const isSelected = c.id === selectedTokenId;
          
          // Visual calculation for bar width
          const percent = Math.min(c.adjustedProb * 100, 100); 
          // Scale for better visibility of small probs? Let's keep it linear for truthfulness.

          let rowClass = "relative flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ";
          
          if (isSelected) {
            rowClass += "bg-emerald-500/20 border border-emerald-500 scale-[1.02] shadow-lg shadow-emerald-900/50";
          } else if (isKept) {
            rowClass += "bg-slate-700/40 border border-slate-600 hover:bg-slate-700/60";
          } else {
            rowClass += "bg-slate-900/30 border border-slate-800 opacity-40 grayscale";
          }

          return (
            <div key={c.id} className={rowClass}>
              {/* Token Rank */}
              <div className="w-6 text-xs font-mono text-slate-500">#{index + 1}</div>
              
              {/* Token Character */}
              <div className="w-12 h-12 flex items-center justify-center bg-slate-900 rounded-md border border-slate-700 text-xl font-bold text-white shadow-inner">
                {c.token}
              </div>

              {/* Probability Bars */}
              <div className="flex-1 flex flex-col justify-center h-full gap-1">
                <div className="flex justify-between text-xs mb-1">
                   <span className={`font-medium ${isKept ? 'text-white' : 'text-slate-500'}`}>
                     {c.adjustedProb < 0.001 ? '<0.1%' : `${(c.adjustedProb * 100).toFixed(1)}%`}
                   </span>
                   <span className="text-slate-500 font-mono text-[10px]">
                      {isKept ? '可被选中' : '已剔除'}
                   </span>
                </div>
                
                {/* Background Bar */}
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                   {/* Temperature Adjusted Bar */}
                   <div 
                      className={`h-full rounded-full transition-all duration-500 ${isKept ? 'bg-cyan-500' : 'bg-slate-600'}`}
                      style={{ width: `${percent}%` }}
                   />
                </div>

                {/* Visualizing Cutoffs */}
                <div className="flex gap-2 text-[10px] mt-1">
                   {!c.isKeptByTopK && <span className="text-purple-500 flex items-center gap-1"><XCircle size={10}/> Top-K Limit</span>}
                   {c.isKeptByTopK && !c.isKeptByTopP && <span className="text-pink-500 flex items-center gap-1"><XCircle size={10}/> Top-P Limit</span>}
                </div>
              </div>

              {/* Final Select Indicator */}
              {isSelected && (
                <div className="absolute right-4 animate-pulse text-emerald-400">
                  <CheckCircle size={24} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
