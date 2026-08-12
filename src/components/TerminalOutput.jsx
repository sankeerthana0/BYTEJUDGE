import React, { useState } from "react";
import { 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  HardDrive, 
  Box, 
  Send, 
  AlertTriangle,
  Copy,
  Check
} from "lucide-react";

export default function TerminalOutput({ submissionResult, isEvaluating, problem }) {
  const [activeSubTab, setActiveSubTab] = useState("testcases");
  const [copied, setCopied] = useState(false);

  const handleCopyLogs = () => {
    if (submissionResult?.dockerTrace?.logs) {
      navigator.clipboard.writeText(submissionResult.dockerTrace.logs.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isEvaluating) {
    return (
      <div id="terminal-evaluating-state" className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300 min-h-[300px] flex flex-col items-center justify-center">
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <Box className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">
          Evaluating Submission in Docker Sandbox...
        </h3>
        <p className="text-xs text-slate-400 max-w-md text-center mb-4">
          Routing task payload through Kafka topic <code className="text-indigo-300 bg-slate-950 px-1.5 py-0.5 rounded">bytejudge-eval-tasks</code> to isolated worker container...
        </p>
        <div className="w-full max-w-sm bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center space-x-2 text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>[KAFKA] Task dispatched to Partition #4</span>
          </div>
          <div className="text-slate-500">[DOCKER] Spawning worker cgroup sandbox...</div>
          <div className="text-slate-500">[CGROUPS] Memory cap = 128MB, CPU cap = 0.5 vCPU</div>
        </div>
      </div>
    );
  }

  if (!submissionResult) {
    return (
      <div id="terminal-empty-state" className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-400 min-h-[260px] flex flex-col items-center justify-center text-center">
        <Terminal className="w-10 h-10 text-slate-600 mb-3" />
        <h3 className="text-sm font-medium text-slate-300 mb-1">No Evaluation Result Yet</h3>
        <p className="text-xs text-slate-500 max-w-md">
          Select a problem, choose your programming language (Java, Python, C++, Go, JS), and click <strong className="text-emerald-400 font-semibold">Run & Evaluate Test Cases</strong> to submit code into the sandboxed evaluation pipeline.
        </p>
      </div>
    );
  }

  const isAC = submissionResult.status === "AC";
  const isTLE = submissionResult.status === "TLE";
  const isMLE = submissionResult.status === "MLE";

  return (
    <div id="terminal-output-container" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-slate-200">
      {/* Result Status Banner */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${
        isAC 
          ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
          : isTLE || isMLE
          ? "bg-amber-950/40 border-amber-800/60 text-amber-300"
          : "bg-rose-950/40 border-rose-800/60 text-rose-300"
      }`}>
        <div className="flex items-center space-x-3">
          {isAC ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          ) : isTLE ? (
            <Clock className="w-6 h-6 text-amber-400 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
          )}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold">{submissionResult.verdict}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-current">
                {submissionResult.status}
              </span>
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              Passed {submissionResult.passCount} of {submissionResult.totalCount} automated test suites
            </p>
          </div>
        </div>

        {/* Telemetry Pills */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Execution: <strong className="text-white">{submissionResult.runtimeMs} ms</strong></span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <span>Memory Peak: <strong className="text-white">{submissionResult.memoryMB} MB</strong></span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-slate-300">
            <Box className="w-3.5 h-3.5 text-amber-400" />
            <span>Node: <strong className="text-white">{submissionResult.workerNode}</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center border-b border-slate-800 px-4 bg-slate-950/60 text-xs">
        <button
          onClick={() => setActiveSubTab("testcases")}
          className={`py-3 px-4 font-medium border-b-2 transition-colors cursor-pointer ${
            activeSubTab === "testcases"
              ? "border-indigo-500 text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Test Case Suites ({submissionResult.passCount}/{submissionResult.totalCount})
        </button>
        <button
          onClick={() => setActiveSubTab("docker-logs")}
          className={`py-3 px-4 font-medium border-b-2 transition-colors cursor-pointer ${
            activeSubTab === "docker-logs"
              ? "border-indigo-500 text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Docker Execution Logs & Kafka Trace
        </button>
        <button
          onClick={() => setActiveSubTab("cgroup-metrics")}
          className={`py-3 px-4 font-medium border-b-2 transition-colors cursor-pointer ${
            activeSubTab === "cgroup-metrics"
              ? "border-indigo-500 text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          CGroups Resource Metrics
        </button>
      </div>

      {/* Subtab Content */}
      <div className="p-4 bg-slate-950/40">
        {activeSubTab === "testcases" && (
          <div className="space-y-3">
            {problem?.testCases?.map((tc, index) => {
              const passed = index < submissionResult.passCount;
              return (
                <div 
                  key={tc.id || index}
                  className={`p-3.5 rounded-lg border text-xs ${
                    passed
                      ? "bg-emerald-950/20 border-emerald-800/40"
                      : "bg-rose-950/20 border-rose-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span className="font-semibold text-slate-200">
                        Test Suite #{index + 1} {tc.isHidden ? "(Hidden Test Case)" : ""}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
                      passed ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-rose-950 text-rose-400 border border-rose-800"
                    }`}>
                      {passed ? "PASSED" : "FAILED"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px] uppercase font-sans mb-1">Input Data</span>
                      <p className="truncate text-indigo-300">{tc.input}</p>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px] uppercase font-sans mb-1">Expected Output</span>
                      <p className="truncate text-emerald-300">{tc.expected}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeSubTab === "docker-logs" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800 text-xs text-slate-400">
              <span className="font-mono text-indigo-400">Container ID: {submissionResult?.dockerTrace?.containerId || "c_e8910a"}</span>
              <button 
                onClick={handleCopyLogs}
                className="flex items-center space-x-1 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Logs"}</span>
              </button>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 max-h-[220px] overflow-y-auto">
              {submissionResult?.dockerTrace?.logs?.map((log, i) => (
                <div key={i} className="flex space-x-2">
                  <span className="text-slate-600 select-none">{String(i + 1).padStart(2, "0")}</span>
                  <span className={log.includes("ERROR") || log.includes("OOM") || log.includes("SIGXCPU") ? "text-rose-400 font-bold" : log.includes("KAFKA") ? "text-cyan-300" : "text-slate-300"}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === "cgroup-metrics" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">CPU Quota Allocation</span>
              <div className="text-base font-bold font-mono text-cyan-400">
                {submissionResult?.cpuQuotaUsed || "0.22 vCPU"}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">CGroup limit: {submissionResult?.dockerTrace?.cpuQuota || "0.5 vCPU"}</p>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Memory Peak / Quota</span>
              <div className="text-base font-bold font-mono text-purple-400">
                {submissionResult.memoryMB} MB / {submissionResult?.dockerTrace?.cgroupMemoryMax || "128MB"}
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-purple-500 h-full transition-all"
                  style={{ width: `${Math.min(100, (submissionResult.memoryMB / 128) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Network & FS Isolation</span>
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold mt-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Isolated (--net=none, read-only)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Prevents unauthorized network calls or host writes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
