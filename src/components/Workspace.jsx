import React, { useState } from "react";
import { 
  Code2, 
  Tag, 
  Cpu, 
  HardDrive, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  ListFilter,
  FileCode,
  Layers
} from "lucide-react";
import CodeEditor from "./CodeEditor.jsx";
import TerminalOutput from "./TerminalOutput.jsx";

export default function Workspace({ problems, selectedProblem, setSelectedProblem, onSubmitCode, isEvaluating, submissionResult }) {
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  const filteredProblems = problems.filter((p) => {
    if (filterDifficulty === "All") return true;
    return p.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
  });

  return (
    <div id="bytejudge-workspace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Problem Selector & Detailed Description (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Problem Selector List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-slate-200">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Challenge Directory</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {filteredProblems.length} available
              </span>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-1 mb-3 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {["All", "Easy", "Medium", "Hard"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setFilterDifficulty(diff)}
                  className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer text-[11px] font-medium ${
                    filterDifficulty === diff
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Problem List Items */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredProblems.map((prob) => {
                const isSelected = selectedProblem?.id === prob.id;
                return (
                  <button
                    key={prob.id}
                    onClick={() => setSelectedProblem(prob)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      isSelected
                        ? "bg-indigo-950/70 border-indigo-600 text-white shadow-sm"
                        : "bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/60"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{prob.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{prob.category}</div>
                    </div>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                      prob.difficulty === "Easy"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : prob.difficulty === "Medium"
                        ? "bg-amber-950 text-amber-400 border border-amber-800"
                        : "bg-rose-950 text-rose-400 border border-rose-800"
                    }`}>
                      {prob.difficulty}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Problem Overview & Statement */}
          {selectedProblem && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-slate-300 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {selectedProblem.title}
                  </h3>
                  <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                    selectedProblem.difficulty === "Easy"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : selectedProblem.difficulty === "Medium"
                      ? "bg-amber-950 text-amber-400 border border-amber-800"
                      : "bg-rose-950 text-rose-400 border border-rose-800"
                  }`}>
                    {selectedProblem.difficulty}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedProblem.tags?.map((tag) => (
                    <span key={tag} className="bg-slate-950 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Execution Quota Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="p-1">
                  <span className="text-slate-500 block text-[10px]">CPU Quota</span>
                  <span className="text-cyan-400 font-semibold">{selectedProblem.cpuLimit}</span>
                </div>
                <div className="p-1 border-x border-slate-800">
                  <span className="text-slate-500 block text-[10px]">RAM Limit</span>
                  <span className="text-purple-400 font-semibold">{selectedProblem.memoryLimit}</span>
                </div>
                <div className="p-1">
                  <span className="text-slate-500 block text-[10px]">Timeout</span>
                  <span className="text-amber-400 font-semibold">{selectedProblem.timeLimitMs}ms</span>
                </div>
              </div>

              {/* Description Body */}
              <div className="space-y-3 text-xs leading-relaxed border-t border-slate-800 pt-3">
                <h4 className="font-semibold text-slate-200 uppercase text-[11px] tracking-wider font-mono">
                  Problem Description
                </h4>
                <p className="whitespace-pre-line text-slate-300 font-sans">
                  {selectedProblem.description}
                </p>

                {/* Examples */}
                {selectedProblem.examples?.map((ex, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1.5 font-mono text-[11px]">
                    <span className="text-indigo-400 font-sans font-semibold block text-xs">Example #{idx + 1}</span>
                    <div>
                      <span className="text-slate-500">Input: </span>
                      <span className="text-slate-200">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Output: </span>
                      <span className="text-emerald-400">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div className="text-slate-400 text-[10px] italic">
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Multi-Language Code Editor + Live Terminal Output (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <CodeEditor
            problem={selectedProblem}
            onSubmitCode={onSubmitCode}
            isEvaluating={isEvaluating}
          />

          <TerminalOutput
            submissionResult={submissionResult}
            isEvaluating={isEvaluating}
            problem={selectedProblem}
          />
        </div>
      </div>
    </div>
  );
}
