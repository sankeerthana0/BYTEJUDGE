import React, { useState } from "react";
import { 
  Terminal, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  Globe, 
  Code2, 
  Zap,
  Server
} from "lucide-react";

export default function ApiConsole({ problems }) {
  const [selectedEndpoint, setSelectedEndpoint] = useState("GET /api/problems");
  const [responseJson, setResponseJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoints = [
    {
      id: "get-problems",
      method: "GET",
      path: "/api/problems",
      description: "Fetches challenge directory metadata and problem statements."
    },
    {
      id: "get-problem-by-id",
      method: "GET",
      path: "/api/problems/two-sum",
      description: "Retrieves single problem constraints, starter code, and testcases."
    },
    {
      id: "post-submit",
      method: "POST",
      path: "/api/submit",
      description: "Dispatches payload through Kafka to container sandbox and evaluates testcases.",
      sampleBody: {
        problemId: "two-sum",
        language: "java",
        code: "class Solution { public int[] twoSum(int[] nums, int target) { return new int[]{0,1}; } }",
        customCpuLimit: "0.5 vCPU",
        customMemoryLimit: 128
      }
    },
    {
      id: "get-submissions",
      method: "GET",
      path: "/api/submissions",
      description: "Retrieves submission evaluation history and container execution traces."
    },
    {
      id: "get-system-metrics",
      method: "GET",
      path: "/api/system-metrics",
      description: "Provides active worker container telemetry, P95 latency, and JMeter metrics."
    },
    {
      id: "get-leaderboard",
      method: "GET",
      path: "/api/leaderboard",
      description: "Tracks global competitive coding rankings and average execution latency."
    }
  ];

  const currentEndpointObj = endpoints.find(e => `${e.method} ${e.path}` === selectedEndpoint) || endpoints[0];

  const handleExecuteApi = async () => {
    setLoading(true);
    setResponseJson(null);

    try {
      let res;
      if (currentEndpointObj.method === "GET") {
        res = await fetch(currentEndpointObj.path);
      } else {
        res = await fetch(currentEndpointObj.path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentEndpointObj.sampleBody || {})
        });
      }
      const data = await res.json();
      setResponseJson(data);
    } catch (err) {
      setResponseJson({ error: "Failed to query API", details: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (responseJson) {
      navigator.clipboard.writeText(JSON.stringify(responseJson, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id="rest-api-console-panel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <Terminal className="w-5 h-5" />
            <h2 className="text-base font-bold uppercase tracking-wider text-white">
              REST API Evaluation Layer & Endpoints
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            ByteJudge exposes a production REST API layer for challenge management, sandbox execution orchestration, real-time worker telemetry, and submission analytics.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Base Path: <code className="text-emerald-400">/api/v1</code></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoint Selector (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center space-x-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <span>Available Endpoints</span>
          </h3>

          <div className="space-y-2">
            {endpoints.map((ep) => {
              const fullKey = `${ep.method} ${ep.path}`;
              const isSelected = selectedEndpoint === fullKey;
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    setSelectedEndpoint(fullKey);
                    setResponseJson(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer font-mono text-xs ${
                    isSelected
                      ? "bg-indigo-950 border-indigo-500 text-white shadow-sm"
                      : "bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      ep.method === "GET" 
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800" 
                        : "bg-amber-950 text-amber-400 border border-amber-800"
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-semibold text-slate-200 truncate">{ep.path}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">{ep.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Request & Response Playground (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className={`px-2 py-0.5 rounded font-bold ${
                  currentEndpointObj.method === "GET" 
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800" 
                    : "bg-amber-950 text-amber-400 border border-amber-800"
                }`}>
                  {currentEndpointObj.method}
                </span>
                <span className="font-bold text-white text-sm">{currentEndpointObj.path}</span>
              </div>

              <button
                onClick={handleExecuteApi}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send Request</span>
              </button>
            </div>

            {/* Request Body preview for POST requests */}
            {currentEndpointObj.method === "POST" && (
              <div className="space-y-1 font-mono text-xs">
                <span className="text-slate-400 text-[11px] block">Request Payload (JSON):</span>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-cyan-300 text-[11px] overflow-x-auto">
                  {JSON.stringify(currentEndpointObj.sampleBody, null, 2)}
                </pre>
              </div>
            )}

            {/* Response Output Box */}
            <div className="space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">API Response Body:</span>
                {responseJson && (
                  <button
                    onClick={handleCopyResponse}
                    className="flex items-center space-x-1 text-slate-400 hover:text-white text-[11px] cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy JSON"}</span>
                  </button>
                )}
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-emerald-400 font-mono text-xs min-h-[260px] max-h-[380px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    <span>Executing HTTP call...</span>
                  </div>
                ) : responseJson ? (
                  <pre className="whitespace-pre-wrap text-[11px] leading-relaxed">
                    {JSON.stringify(responseJson, null, 2)}
                  </pre>
                ) : (
                  <span className="text-slate-600 italic">
                    Click "Send Request" to test endpoint response.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
