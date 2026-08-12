import React, { useState } from "react";
import { 
  ShieldCheck, 
  Cpu, 
  HardDrive, 
  Lock, 
  Server, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Zap, 
  Box, 
  RefreshCw,
  Play
} from "lucide-react";

export default function SandboxVisualizer({ workers, onRunAbuseSimulation }) {
  const [selectedWorker, setSelectedWorker] = useState(workers[0] || null);
  const [abuseLog, setAbuseLog] = useState(null);
  const [simulatingAbuse, setSimulatingAbuse] = useState(false);

  const handleSimulateAttack = (attackType) => {
    setSimulatingAbuse(true);
    setAbuseLog({
      type: attackType,
      status: "running",
      message: `Dispatching untrusted code workload (${attackType}) to Docker Sandbox...`
    });

    setTimeout(() => {
      let resultMessage = "";
      let detailLog = [];

      if (attackType === "infinite-loop") {
        resultMessage = "BLOCKED: SIGXCPU Timeout Policy Triggered";
        detailLog = [
          "[CGROUP MONITOR] Process thread exceeding 2000ms execution window.",
          "[CGROUP MONITOR] Sending SIGXCPU signal to container process pid 4821.",
          "[DOCKER ENGINE] Container terminated safely within 2005ms.",
          "[RESULT] Host CPU usage preserved at 0.5 vCPU quota. Zero system impact."
        ];
      } else if (attackType === "heap-drain") {
        resultMessage = "BLOCKED: CGroup OOM Killer Triggered";
        detailLog = [
          "[CGROUP MONITOR] Memory usage reached 128.0 MB boundary.",
          "[CGROUP KERNEL] cgroup memory.max boundary enforced.",
          "[KERNEL OOM KILLER] Process memory allocation rejected. Container killed.",
          "[RESULT] Host memory protected. Zero OOM leak to parent container."
        ];
      } else if (attackType === "syscall-exploit") {
        resultMessage = "BLOCKED: Seccomp BPF Syscall Filter Rejection";
        detailLog = [
          "[SECCOMP FILTER] Intercepted unauthorized syscall: ptrace() / clone()",
          "[SECCOMP AUDIT] System call forbidden in sandbox profile 'bytejudge-strict'",
          "[PROCESS] SIGSYS signal dispatched to candidate process.",
          "[RESULT] Host kernel access denied."
        ];
      } else {
        resultMessage = "BLOCKED: Network Namespace Isolation (--net=none)";
        detailLog = [
          "[SOCKET] Attempted outbound socket connection to 192.168.1.100:8080",
          "[NETWORK NAMESPACE] Interface lo only. External socket creation failed: EACCES",
          "[RESULT] Network isolation maintained."
        ];
      }

      setAbuseLog({
        type: attackType,
        status: "blocked",
        message: resultMessage,
        details: detailLog
      });
      setSimulatingAbuse(false);
    }, 1500);
  };

  return (
    <div id="sandbox-visualizer-panel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-base font-bold uppercase tracking-wider text-white">
              Docker Container Isolation & Resource Limits
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            ByteJudge evaluates untrusted user code inside 12 isolated Docker containers. CGroups restrict CPU/memory quotas, Seccomp blocks privileged syscalls, and network namespaces prevent external communication.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
          <Box className="w-4 h-4 text-emerald-400" />
          <span>Active Worker Pool: <strong className="text-emerald-400">12 Containers</strong></span>
        </div>
      </div>

      {/* Container Security Lifecycle Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300">
          Sandboxed Execution Lifecycle
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[11px] font-mono">
          {[
            { step: "1. Submission", label: "REST Payload", desc: "Signed JSON", icon: Terminal },
            { step: "2. Kafka Broker", label: "Queue Route", desc: "Topic Partition", icon: Zap },
            { step: "3. Container Spawn", label: "Docker Worker", desc: "--net=none", icon: Box },
            { step: "4. CGroups Enforce", label: "Resource Limits", desc: "0.5 vCPU / 128MB", icon: Cpu },
            { step: "5. Seccomp Filter", label: "Syscall Rules", desc: "Block Root/Net", icon: Lock },
            { step: "6. Exec & Validate", label: "Testcase Runner", desc: "Timed Execution", icon: Play },
            { step: "7. Teardown", label: "Container Destroy", desc: "Zero Persistence", icon: RefreshCw }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <Icon className="w-4 h-4 text-indigo-400 mx-auto" />
                <div className="font-semibold text-slate-200">{item.step}</div>
                <div className="text-[10px] text-indigo-300">{item.label}</div>
                <div className="text-[9px] text-slate-500">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: 12 Docker Worker Nodes + Selected Node Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Worker Node Inspector Grid (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center space-x-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Containerized Worker Pool (12 Isolated Nodes)</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              100% CGroups Enforced
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {workers?.map((w) => {
              const isSelected = selectedWorker?.id === w.id;
              const isExecuting = w.status === "executing";
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWorker(w)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer font-mono text-xs ${
                    isSelected
                      ? "bg-indigo-950 border-indigo-500 text-white shadow-md"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-200">{w.id}</span>
                    <span className={`w-2 h-2 rounded-full ${isExecuting ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-0.5">
                    <div>CPU: <span className="text-cyan-300">{w.cpuUsage}</span></div>
                    <div>RAM: <span className="text-purple-300">{w.memoryMB} / {w.maxMemoryMB}MB</span></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Node Inspector Card */}
          {selectedWorker && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-indigo-300 text-sm">{selectedWorker.name} ({selectedWorker.id})</span>
                <span className="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded text-[10px] font-bold">
                  STATUS: {selectedWorker.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">CGroup CPU Limit</span>
                  <span className="text-slate-200 font-bold">50,000 / 100,000 us (0.5 vCPU)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">CGroup Memory Cap</span>
                  <span className="text-slate-200 font-bold">128 MB (Hard Quota)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Kafka Topic Partition</span>
                  <span className="text-indigo-300 font-bold">{selectedWorker.kafkaPartition}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Jobs Processed</span>
                  <span className="text-emerald-400 font-bold">{selectedWorker.processedJobs}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Untrusted Code Abuse Testbench (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-rose-400">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Security Abuse Testbench
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Simulate malicious attack payloads to verify ByteJudge sandbox policy enforcement and kernel isolation:
          </p>

          <div className="space-y-2">
            {[
              { id: "infinite-loop", label: "Trigger Infinite Loop (CPU Exhaustion)", icon: Cpu, color: "hover:bg-amber-950/60 hover:border-amber-800" },
              { id: "heap-drain", label: "Trigger OOM Overflow (Memory Exhaustion)", icon: HardDrive, color: "hover:bg-purple-950/60 hover:border-purple-800" },
              { id: "syscall-exploit", label: "Trigger Forbidden Syscall (Seccomp Blockage)", icon: Lock, color: "hover:bg-rose-950/60 hover:border-rose-800" },
              { id: "network-leak", label: "Trigger Outbound Network Socket", icon: Server, color: "hover:bg-cyan-950/60 hover:border-cyan-800" }
            ].map((attack) => {
              const Icon = attack.icon;
              return (
                <button
                  key={attack.id}
                  onClick={() => handleSimulateAttack(attack.id)}
                  disabled={simulatingAbuse}
                  className={`w-full text-left p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-xs font-mono flex items-center space-x-2 transition-all cursor-pointer ${attack.color} disabled:opacity-50`}
                >
                  <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{attack.label}</span>
                </button>
              );
            })}
          </div>

          {/* Attack Result Terminal Output */}
          {abuseLog && (
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold border-b border-slate-800 pb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{abuseLog.message}</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-400 max-h-[140px] overflow-y-auto">
                {abuseLog.details?.map((line, i) => (
                  <div key={i} className="text-slate-300">{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
