import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  History, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  Box, 
  Award, 
  Zap,
  Layers,
  ChevronRight
} from "lucide-react";

export default function Leaderboard({ submissions }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => setLeaderboardData(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div id="leaderboard-history-panel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 mb-1">
            <Trophy className="w-5 h-5" />
            <h2 className="text-base font-bold uppercase tracking-wider text-white">
              Global Competitive Leaderboard & Submission History
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Track real-time candidate scores, pass rates, average execution latency, and container evaluation audit traces across all coding challenges.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Global Rankings Table (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Top Competitive Coders</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Automated Scoring</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Solved</th>
                  <th className="py-2.5 px-3">Avg Latency</th>
                  <th className="py-2.5 px-3">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leaderboardData.map((row) => (
                  <tr key={row.rank} className="hover:bg-slate-950/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-amber-400">
                      #{row.rank}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-900 border border-indigo-700 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                        {row.avatar}
                      </div>
                      <span>{row.name}</span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold">{row.solved}</td>
                    <td className="py-3 px-3 text-slate-400">{row.avgLatencyMs} ms</td>
                    <td className="py-3 px-3 text-indigo-300 font-bold">{row.score} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-Time Submission Audit History (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center space-x-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Container Evaluation Log History</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400">
              {submissions.length} Recorded
            </span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {submissions.map((sub) => {
              const isAC = sub.status === "AC";
              const isSelected = selectedSubmission?.id === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubmission(isSelected ? null : sub)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer font-mono text-xs ${
                    isSelected
                      ? "bg-indigo-950 border-indigo-500 shadow-md"
                      : "bg-slate-950 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      {isAC ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span className="font-bold text-slate-200">{sub.problemTitle}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isAC ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-rose-950 text-rose-400 border border-rose-800"
                    }`}>
                      {sub.verdict}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Lang: <strong className="text-indigo-300">{sub.language}</strong></span>
                    <span>Runtime: <strong className="text-slate-200">{sub.runtimeMs} ms</strong></span>
                    <span>Node: <strong className="text-amber-300">{sub.workerNode}</strong></span>
                  </div>

                  {/* Expanded Trace Details */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] space-y-2 text-slate-300 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2.5 rounded border border-slate-800">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Kafka Partition</span>
                          <span className="text-cyan-400">Partition #{sub.kafkaPartition}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">CPU Quota Usage</span>
                          <span className="text-purple-400">{sub.cpuQuotaUsed || "0.22 vCPU"}</span>
                        </div>
                      </div>

                      {sub.code && (
                        <div>
                          <span className="text-slate-500 text-[10px] block mb-1">Submitted Source Code:</span>
                          <pre className="bg-slate-900 p-2.5 rounded border border-slate-800 text-emerald-300 text-[10px] max-h-[120px] overflow-y-auto">
                            {sub.code}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
