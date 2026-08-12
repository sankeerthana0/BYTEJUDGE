import React, { useState, useEffect } from "react";
import { 
  Play, 
  RotateCcw, 
  Sliders, 
  Cpu, 
  HardDrive, 
  Clock, 
  ShieldAlert, 
  Zap,
  Code
} from "lucide-react";

export default function CodeEditor({ problem, onSubmitCode, isEvaluating }) {
  const [selectedLang, setSelectedLang] = useState("java");
  const [code, setCode] = useState("");
  const [showResourceSettings, setShowResourceSettings] = useState(false);
  const [cpuLimit, setCpuLimit] = useState("0.5 vCPU");
  const [memoryLimit, setMemoryLimit] = useState(128);
  const [timeoutMs, setTimeoutMs] = useState(2000);

  useEffect(() => {
    if (problem && problem.starterCode) {
      setCode(problem.starterCode[selectedLang] || problem.starterCode.java || "");
    }
  }, [problem, selectedLang]);

  const handleResetCode = () => {
    if (problem && problem.starterCode) {
      setCode(problem.starterCode[selectedLang] || "");
    }
  };

  const handleLanguageChange = (lang) => {
    setSelectedLang(lang);
    if (problem && problem.starterCode) {
      setCode(problem.starterCode[lang] || "");
    }
  };

  const handleTriggerTLE = () => {
    const tleSnippet = selectedLang === "java" 
      ? `class Solution {\n    public void twoSum() {\n        while (true) { /* Infinite Loop TLE Trigger */ }\n    }\n}`
      : `while True:\n    pass # TLE trigger`;
    setCode(tleSnippet);
  };

  const handleTriggerOOM = () => {
    const oomSnippet = selectedLang === "java" 
      ? `class Solution {\n    public void testOOM() {\n        byte[] heapDrain = new byte[999999999]; // Deliberate OOM\n    }\n}`
      : `heap_drain = [0] * (10 ** 8) # Deliberate OOM`;
    setCode(oomSnippet);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSubmitCode({
      problemId: problem.id,
      language: selectedLang,
      code,
      customCpuLimit: cpuLimit,
      customMemoryLimit: memoryLimit,
      customTimeoutMs: timeoutMs
    });
  };

  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 16) }, (_, i) => i + 1);

  return (
    <div id="code-editor-panel" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Editor Top Toolbar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Language Selection Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {[
            { id: "java", label: "Java 17" },
            { id: "python", label: "Python 3.11" },
            { id: "cpp", label: "C++20" },
            { id: "go", label: "Go 1.21" },
            { id: "javascript", label: "JavaScript (Node 20)" }
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                selectedLang === lang.id
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Resource Controls & Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowResourceSettings(!showResourceSettings)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
              showResourceSettings
                ? "bg-indigo-950 text-indigo-300 border-indigo-700"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
            }`}
            title="Configure CGroup CPU/Memory Limits"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sandbox Limits</span>
          </button>

          <button
            onClick={handleResetCode}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset starter template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Expanded Resource Limit Settings Drawer */}
      {showResourceSettings && (
        <div className="bg-slate-950/90 border-b border-slate-800 p-3.5 text-xs grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn">
          <div>
            <label className="text-slate-400 block mb-1 font-mono flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>CPU Quota (CGroups):</span>
            </label>
            <select
              value={cpuLimit}
              onChange={(e) => setCpuLimit(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="0.25 vCPU">0.25 vCPU (Light Sandbox)</option>
              <option value="0.5 vCPU">0.5 vCPU (Standard)</option>
              <option value="1.0 vCPU">1.0 vCPU (High Priority)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-mono flex items-center space-x-1">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              <span>RAM Quota (MB):</span>
            </label>
            <select
              value={memoryLimit}
              onChange={(e) => setMemoryLimit(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value={64}>64 MB (Strict Limit)</option>
              <option value={128}>128 MB (Default)</option>
              <option value={256}>256 MB (Extended Memory)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-mono flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Timeout Limit (Ms):</span>
            </label>
            <select
              value={timeoutMs}
              onChange={(e) => setTimeoutMs(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value={1000}>1000 ms (1.0 sec)</option>
              <option value={2000}>2000 ms (2.0 sec)</option>
              <option value={5000}>5000 ms (5.0 sec)</option>
            </select>
          </div>
        </div>
      )}

      {/* Code Textarea with Line Numbers */}
      <div className="relative flex-1 bg-slate-950 font-mono text-xs overflow-hidden min-h-[340px] flex">
        {/* Line Numbers Sidebar */}
        <div className="w-10 bg-slate-900/60 border-r border-slate-800/80 text-slate-600 select-none py-3 text-right pr-2.5 font-mono leading-relaxed">
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Code Input */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full h-full p-3 bg-transparent text-emerald-300 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-0 selection:bg-indigo-950 selection:text-white"
          placeholder="// Type or paste code here..."
        />
      </div>

      {/* Action Footer */}
      <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Abuse Testing Shortcut Buttons */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-mono hidden sm:inline">Inject Fault:</span>
          <button
            onClick={handleTriggerTLE}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/80 transition-colors cursor-pointer text-[11px]"
            title="Inject infinite loop to test TLE handling"
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Infinite Loop (TLE)</span>
          </button>
          <button
            onClick={handleTriggerOOM}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/80 transition-colors cursor-pointer text-[11px]"
            title="Inject array overflow to test OOM handling"
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>OOM Overflow (MLE)</span>
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isEvaluating}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-md shadow-emerald-900/30 hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isEvaluating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Routing to Kafka Worker...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run & Evaluate Test Cases</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
