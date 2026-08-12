import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Workspace from "./components/Workspace.jsx";
import SandboxVisualizer from "./components/SandboxVisualizer.jsx";
import TelemetryDashboard from "./components/TelemetryDashboard.jsx";
import ApiConsole from "./components/ApiConsole.jsx";
import Leaderboard from "./components/Leaderboard.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("workspace");
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [systemTelemetry, setSystemTelemetry] = useState({ metrics: {}, workers: [] });

  // Fetch initial data
  useEffect(() => {
    // Fetch problems
    fetch("/api/problems")
      .then((res) => res.json())
      .then((data) => {
        setProblems(data);
        if (data.length > 0) setSelectedProblem(data[0]);
      })
      .catch((err) => console.error("Error fetching problems:", err));

    // Fetch initial submissions
    fetch("/api/submissions")
      .then((res) => res.json())
      .then((data) => setSubmissions(data))
      .catch((err) => console.error("Error fetching submissions:", err));

    // Poll system metrics periodically
    const fetchTelemetry = () => {
      fetch("/api/system-metrics")
        .then((res) => res.json())
        .then((data) => setSystemTelemetry(data))
        .catch((err) => console.error("Error fetching telemetry:", err));
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle Code Submission
  const handleSubmitCode = async (payload) => {
    setIsEvaluating(true);
    setSubmissionResult(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      setSubmissionResult(result);

      // Refresh submission log history
      const subRes = await fetch("/api/submissions");
      const subData = await subRes.json();
      setSubmissions(subData);
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-950 selection:text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemMetrics={systemTelemetry.metrics}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === "workspace" && (
          <Workspace
            problems={problems}
            selectedProblem={selectedProblem}
            setSelectedProblem={setSelectedProblem}
            onSubmitCode={handleSubmitCode}
            isEvaluating={isEvaluating}
            submissionResult={submissionResult}
          />
        )}

        {activeTab === "sandbox" && (
          <SandboxVisualizer
            workers={systemTelemetry.workers}
          />
        )}

        {activeTab === "telemetry" && (
          <TelemetryDashboard
            systemMetrics={systemTelemetry.metrics}
            onRunLoadTest={() => {
              // Refresh telemetry after load test
              fetch("/api/system-metrics")
                .then((res) => res.json())
                .then((data) => setSystemTelemetry(data));
            }}
          />
        )}

        {activeTab === "api-console" && (
          <ApiConsole problems={problems} />
        )}

        {activeTab === "leaderboard" && (
          <Leaderboard submissions={submissions} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">BYTEJUDGE</span>
            <span>— Distributed Online Code Evaluation System</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Author: Sankeerthana Verneni</span>
            <span>•</span>
            <span>Docker Sandbox Runtime</span>
            <span>•</span>
            <span>Kafka Partition Pipeline</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
