import React from "react";
import { 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Code2, 
  Trophy, 
  Cpu, 
  Layers, 
  Server,
  Zap,
  CheckCircle2
} from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, systemMetrics }) {
  const navTabs = [
    { id: "workspace", label: "Challenge Workspace", icon: Code2 },
    { id: "sandbox", label: "Docker Sandbox & CGroups", icon: ShieldCheck },
    { id: "telemetry", label: "Kafka Telemetry & JMeter", icon: Activity },
    { id: "api-console", label: "REST API Console", icon: Terminal },
    { id: "leaderboard", label: "Leaderboard & History", icon: Trophy }
  ];

  return (
    <header id="bytejudge-navbar" className="bg-slate-950 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-md">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-2.5 py-1 rounded-md font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Kafka Workers: 12/12 Online</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>P95 Latency: <strong className="text-slate-200 font-mono">{systemMetrics?.p95LatencyMs || 218}ms</strong></span>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>JMeter Capacity: <strong className="text-slate-200 font-mono">620+ subs/min</strong></span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="hidden lg:inline text-slate-400">
            Stack: <span className="text-slate-200 font-medium">Java • Spring Boot • Kafka • Redis • Docker</span>
          </span>
          <div className="flex items-center space-x-1.5 text-xs bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Success Rate: <strong className="text-emerald-400 font-mono">99.1%</strong></span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3 py-3">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                BYTEJUDGE
              </h1>
              <span className="bg-indigo-950 text-indigo-300 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-indigo-800">
                v2.4 Production
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Distributed Code Evaluation & Containerized Sandbox System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav id="bytejudge-tab-nav" className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
