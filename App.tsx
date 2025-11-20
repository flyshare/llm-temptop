import React, { useState, useMemo, useEffect, useRef } from 'react';
import { INITIAL_CANDIDATES, SCENARIO_INPUT } from './constants';
import { SimulationState } from './types';
import { processCandidates, sampleToken } from './utils/math';
import { ControlPanel } from './components/ControlPanel';
import { CandidateList } from './components/CandidateList';
import { DistributionCurve } from './components/DistributionCurve';
import { Play, RefreshCw, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState>({
    temperature: 1.0,
    topK: INITIAL_CANDIDATES.length,
    topP: 1.0,
  });

  const [generatedHistory, setGeneratedHistory] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  // Core logic: Recalculate probabilities whenever parameters change
  const processedCandidates = useMemo(() => {
    return processCandidates(INITIAL_CANDIDATES, state.temperature, state.topK, state.topP);
  }, [state]);

  const handleParamChange = (key: keyof SimulationState, value: number) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setSelectedTokenId(null);

    // Animation: Rapidly cycle through valid candidates ("Roulette" effect)
    const validCandidates = processedCandidates.filter(c => c.finalProb > 0);
    
    if (validCandidates.length === 0) {
      setIsGenerating(false);
      return;
    }

    let steps = 0;
    const maxSteps = 15; // How many visual ticks before stopping
    const interval = setInterval(() => {
      steps++;
      const randomIndex = Math.floor(Math.random() * validCandidates.length);
      setSelectedTokenId(validCandidates[randomIndex].id);

      if (steps >= maxSteps) {
        clearInterval(interval);
        // Actual Selection Logic
        const finalToken = sampleToken(processedCandidates);
        const winner = processedCandidates.find(c => c.token === finalToken);
        
        if (winner) {
            setSelectedTokenId(winner.id);
            setGeneratedHistory(prev => [...prev, winner.token]);
        }
        setIsGenerating(false);
      }
    }, 80);
  };

  const handleReset = () => {
    setGeneratedHistory([]);
    setSelectedTokenId(null);
  };

  const lastTokenRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if(lastTokenRef.current) {
        lastTokenRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generatedHistory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-6xl mb-8 flex flex-col md:flex-row justify-between items-end border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
            LLM Parameter Playground
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Interactive visualization of how <strong>Temperature</strong>, <strong>Top-K</strong>, and <strong>Top-P</strong> affect Large Language Model token generation.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
             <a href="https://github.com/google/generative-ai-js" target="_blank" rel="noreferrer" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Powered by Math</a>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs & Controls */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Scenario Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 shadow-lg">
             <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BrainCircuit size={16}/> Input Context
             </h2>
             <div className="text-2xl font-medium text-white leading-relaxed">
                <span className="opacity-60">{SCENARIO_INPUT}</span>
                <span className="text-cyan-400 transition-all duration-300 border-b-2 border-cyan-500/50 pb-1 ml-1">
                    {generatedHistory.map((token, i) => (
                        <span key={i} ref={i === generatedHistory.length - 1 ? lastTokenRef : null} className="animate-in fade-in zoom-in duration-300 inline-block">{token}</span>
                    ))}
                    <span className="animate-pulse text-cyan-500 inline-block ml-0.5">|</span>
                </span>
             </div>
             <div className="mt-4 flex gap-3">
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all shadow-lg
                        ${isGenerating 
                            ? 'bg-slate-700 cursor-wait text-slate-400' 
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white hover:shadow-cyan-500/20'
                        }`}
                >
                    {isGenerating ? 'Generating...' : <><Play size={18} fill="currentColor"/> Generate Next</>}
                </button>
                <button 
                    onClick={handleReset}
                    className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 transition-colors"
                    title="Reset History"
                >
                    <RefreshCw size={18}/>
                </button>
             </div>
          </div>

          {/* Controls */}
          <ControlPanel 
            values={state} 
            onChange={handleParamChange} 
            maxK={INITIAL_CANDIDATES.length}
            disabled={isGenerating}
          />

          {/* Stats / Curve */}
          <div className="hidden lg:block">
            <DistributionCurve data={processedCandidates} />
          </div>
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-8 flex flex-col h-[600px] lg:h-auto">
            <CandidateList 
                candidates={processedCandidates} 
                generating={isGenerating}
                selectedTokenId={selectedTokenId}
            />
            <div className="lg:hidden">
                <DistributionCurve data={processedCandidates} />
            </div>
        </div>

      </main>
    </div>
  );
};

export default App;
