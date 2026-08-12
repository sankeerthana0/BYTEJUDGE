import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { PROBLEMS, MOCK_CONTAINER_WORKERS, MOCK_METRICS } from "./src/data/problemsData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let submissionsStore = [
  {
    id: "sub-9841",
    problemId: "two-sum",
    problemTitle: "Two Sum",
    user: "Sankeerthana V.",
    language: "java",
    verdict: "Accepted",
    status: "AC",
    runtimeMs: 18,
    memoryMB: 41.2,
    cpuQuotaUsed: "0.18 vCPU",
    workerNode: "worker-04",
    kafkaPartition: 3,
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    passCount: 5,
    totalCount: 5
  },
  {
    id: "sub-9840",
    problemId: "lru-cache",
    problemTitle: "LRU Cache Architecture",
    user: "Alex Chen",
    language: "python",
    verdict: "Accepted",
    status: "AC",
    runtimeMs: 142,
    memoryMB: 88.4,
    cpuQuotaUsed: "0.42 vCPU",
    workerNode: "worker-01",
    kafkaPartition: 0,
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    passCount: 3,
    totalCount: 3
  },
  {
    id: "sub-9839",
    problemId: "kafka-rate-limiter",
    problemTitle: "Kafka Distributed Token Bucket Rate Limiter",
    user: "DevCandidate_91",
    language: "javascript",
    verdict: "Time Limit Exceeded",
    status: "TLE",
    runtimeMs: 2005,
    memoryMB: 54.1,
    cpuQuotaUsed: "0.50 vCPU (Max CGroup Cap)",
    workerNode: "worker-09",
    kafkaPartition: 8,
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    passCount: 2,
    totalCount: 3
  }
];

let liveWorkers = JSON.parse(JSON.stringify(MOCK_CONTAINER_WORKERS));
let systemMetrics = { ...MOCK_METRICS };

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get all problems
  app.get("/api/problems", (req, res) => {
    res.json(PROBLEMS);
  });

  // Get single problem
  app.get("/api/problems/:id", (req, res) => {
    const problem = PROBLEMS.find(p => p.id === req.params.id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json(problem);
  });

  // Submit code for evaluation
  app.post("/api/submit", (req, res) => {
    const { problemId, language, code, customCpuLimit, customMemoryLimit, customTimeoutMs } = req.body;
    const problem = PROBLEMS.find(p => p.id === problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const workerIndex = Math.floor(Math.random() * 12);
    const worker = liveWorkers[workerIndex];
    worker.status = "executing";

    // Simulate evaluation rules
    let verdict = "Accepted";
    let status = "AC";
    let runtimeMs = Math.floor(12 + Math.random() * 45);
    let memoryMB = +(32 + Math.random() * 30).toFixed(1);
    let logs = [];

    // Test for deliberate OOM or TLE triggers in code if present
    if (code.includes("while(true)") || code.includes("while (true)") || code.includes("for(;;)")) {
      verdict = "Time Limit Exceeded";
      status = "TLE";
      runtimeMs = customTimeoutMs || problem.timeLimitMs || 2000;
      logs.push("[DOCKER CGroup Monitor] SIGXCPU signal dispatched! Time limit exceeded boundary.");
    } else if (code.includes("byte[] heapDrain") || code.includes("new Array(999999999)")) {
      verdict = "Memory Limit Exceeded";
      status = "MLE";
      memoryMB = customMemoryLimit || 256;
      logs.push("[DOCKER CGroup Monitor] OOM Killer triggered! Memory exceeded quota.");
    } else if (code.includes("System.exit") || code.includes("process.exit") || code.includes("syntax error")) {
      verdict = "Compilation / Runtime Error";
      status = "RE";
      logs.push("[COMPILER ERROR] Invalid syntax or illegal exit call.");
    }

    const passCount = verdict === "Accepted" ? problem.testCases.length : Math.max(0, problem.testCases.length - 1);
    const totalCount = problem.testCases.length;

    const newSub = {
      id: `sub-${Math.floor(1000 + Math.random() * 9000)}`,
      problemId: problem.id,
      problemTitle: problem.title,
      user: "Current Candidate",
      language: language || "java",
      verdict,
      status,
      runtimeMs,
      memoryMB,
      cpuQuotaUsed: `${(0.1 + Math.random() * 0.3).toFixed(2)} vCPU`,
      workerNode: worker.id,
      kafkaPartition: workerIndex,
      timestamp: new Date().toISOString(),
      passCount,
      totalCount,
      code,
      dockerTrace: {
        containerId: `c_${Math.random().toString(36).substring(2, 10)}`,
        image: `bytejudge/sandbox-${language}:v2`,
        cpuQuota: customCpuLimit || problem.cpuLimit,
        memoryQuota: `${customMemoryLimit || problem.memoryLimit}MB`,
        cgroupMemoryMax: `${customMemoryLimit || 128}MB`,
        networkIsolated: true,
        readOnlyRootFs: true,
        kafkaBrokerTopic: "bytejudge-eval-tasks",
        kafkaOffset: Math.floor(1820000 + Math.random() * 50000),
        redisCacheHit: Math.random() > 0.3,
        logs: [
          `[KAFKA PRODUCER] Route task -> topic: bytejudge-eval-tasks partition: ${workerIndex}`,
          `[WORKER ${worker.id}] Spawn container c_${Math.random().toString(36).substring(2, 8)}`,
          `[CGROUPS] Enforce memory.max=${customMemoryLimit || 128}M, cpu.max=50000 100000`,
          `[SECCOMP] Seccomp filter active: blocking syscalls (clone, ptracing, socket)`,
          `[RUNNER] Compiling ${language} source file...`,
          `[RUNNER] Executing ${totalCount} test suites against isolated stdin/stdout...`,
          ...logs,
          `[CLEANUP] Destroy container and free cgroup allocated resources.`
        ]
      }
    };

    submissionsStore.unshift(newSub);
    if (submissionsStore.length > 50) submissionsStore.pop();

    systemMetrics.totalSubmissions += 1;

    setTimeout(() => {
      worker.status = "idle";
    }, 1200);

    res.json(newSub);
  });

  // Get submissions
  app.get("/api/submissions", (req, res) => {
    res.json(submissionsStore);
  });

  // Get specific submission
  app.get("/api/submissions/:id", (req, res) => {
    const sub = submissionsStore.find(s => s.id === req.params.id);
    if (!sub) return res.status(404).json({ error: "Submission not found" });
    res.json(sub);
  });

  // Get system metrics & worker containers
  app.get("/api/system-metrics", (req, res) => {
    // jitter metrics slightly for realistic live telemetry
    systemMetrics.jmeterSubmissionsPerMin = 620 + Math.floor(Math.random() * 15 - 7);
    systemMetrics.jmeterConcurrent = 75 + Math.floor(Math.random() * 8 - 4);
    systemMetrics.p95LatencyMs = 218 + Math.floor(Math.random() * 10 - 5);
    res.json({
      metrics: systemMetrics,
      workers: liveWorkers
    });
  });

  // Trigger JMeter Load Test simulation
  app.post("/api/load-test", (req, res) => {
    const burstCount = req.body.burst || 50;
    systemMetrics.totalSubmissions += burstCount;
    systemMetrics.jmeterSubmissionsPerMin += 80;
    systemMetrics.jmeterConcurrent += 25;

    // Simulate busy workers
    liveWorkers.forEach((w, idx) => {
      if (idx % 2 === 0) w.status = "executing";
    });

    setTimeout(() => {
      liveWorkers.forEach(w => (w.status = "idle"));
      systemMetrics.jmeterSubmissionsPerMin = 624;
      systemMetrics.jmeterConcurrent = 78;
    }, 4000);

    res.json({
      message: `Simulated JMeter load test burst of ${burstCount} concurrent submissions dispatched through Kafka!`,
      p95LatencyMs: 218,
      processingSuccessRate: "99.1%",
      activeWorkers: 12
    });
  });

  // Leaderboard
  app.get("/api/leaderboard", (req, res) => {
    res.json([
      { rank: 1, name: "Sankeerthana Verneni", score: 2850, solved: 142, avgLatencyMs: 18, country: "US", avatar: "SV" },
      { rank: 2, name: "Alexander Wright", score: 2710, solved: 136, avgLatencyMs: 22, country: "CA", avatar: "AW" },
      { rank: 3, name: "Priya Sharma", score: 2680, solved: 131, avgLatencyMs: 19, country: "IN", avatar: "PS" },
      { rank: 4, name: "Marcus Vance", score: 2540, solved: 124, avgLatencyMs: 31, country: "DE", avatar: "MV" },
      { rank: 5, name: "Li Wei", score: 2490, solved: 119, avgLatencyMs: 25, country: "SG", avatar: "LW" },
      { rank: 6, name: "Elena Rostova", score: 2410, solved: 115, avgLatencyMs: 28, country: "FI", avatar: "ER" }
    ]);
  });

  // Vite middleware or production static
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BYTEJUDGE SERVER] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
