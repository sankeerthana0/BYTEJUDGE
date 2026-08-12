export const PROBLEMS = [
  {
    id: "two-sum",
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    cpuLimit: "0.5 vCPU",
    memoryLimit: "128 MB",
    timeLimitMs: 1000,
    tags: ["Array", "Hash Table", "LeetCode #1"],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "nums[1] + nums[2] == 6."
      }
    ],
    starterCode: {
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // ByteJudge Sandbox - Java 17 Runtime
        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # ByteJudge Sandbox - Python 3.11 Runtime
        prevMap = {} # val : index
        for i, n in enumerate(nums):
            diff = target - n
            if diff in prevMap:
                return [prevMap[diff], i]
            prevMap[n] = i
        return []`,
      cpp: `#include <vector>
#include <unordered_map>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        // ByteJudge Sandbox - GCC 12.2 C++20
        std::unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
      go: `package main

func twoSum(nums []int, target int) []int {
    // ByteJudge Sandbox - Go 1.21 Runtime
    seen := make(map[int]int)
    for i, num := range nums {
        complement := target - num
        if idx, found := seen[complement]; found {
            return []int{idx, i}
        }
        seen[num] = i
    }
    return nil
}`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // ByteJudge Sandbox - Node.js 20 Runtime
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`
    },
    testCases: [
      { id: 1, input: "[2, 7, 11, 15], 9", expected: "[0, 1]", isHidden: false },
      { id: 2, input: "[3, 2, 4], 6", expected: "[1, 2]", isHidden: false },
      { id: 3, input: "[3, 3], 6", expected: "[0, 1]", isHidden: false },
      { id: 4, input: "[10, 20, 30, 40, 50], 90", expected: "[3, 4]", isHidden: true },
      { id: 5, input: "[-1, -2, -3, -4, -5], -8", expected: "[2, 4]", isHidden: true }
    ]
  },
  {
    id: "lru-cache",
    title: "LRU Cache Architecture",
    slug: "lru-cache",
    difficulty: "Hard",
    category: "System Design & Data Structures",
    cpuLimit: "1.0 vCPU",
    memoryLimit: "256 MB",
    timeLimitMs: 1500,
    tags: ["Hash Table", "Doubly-Linked List", "System Design"],
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) Cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\` Update the value of the \`key\` if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, **evict** the least recently used key.

The functions \`get\` and \`put\` must each run in **O(1)** average time complexity.`,
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
        explanation: 'LRU Eviction sequence triggers when capacity=2 is exceeded.'
      }
    ],
    starterCode: {
      java: `class LRUCache {
    private final int capacity;
    private final java.util.Map<Integer, Node> map;
    private final Node head, tail;

    class Node {
        int key, value;
        Node prev, next;
        Node(int k, int v) { key = k; value = v; }
    }

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new java.util.HashMap<>();
        this.head = new Node(0, 0);
        this.tail = new Node(0, 0);
        head.next = tail;
        tail.prev = head;
    }
    
    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node);
        insert(node);
        return node.value;
    }
    
    public void put(int key, int value) {
        if (map.containsKey(key)) {
            remove(map.get(key));
        }
        if (map.size() == capacity) {
            map.remove(tail.prev.key);
            remove(tail.prev);
        }
        Node node = new Node(key, value);
        insert(node);
        map.put(key, node);
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void insert(Node node) {
        node.next = head.next;
        node.next.prev = node;
        head.next = node;
        node.prev = head;
    }
}`,
      python: `class Node:
    def __init__(self, key, val):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {} # map key to node
        self.left, self.right = Node(0, 0), Node(0, 0)
        self.left.next, self.right.prev = self.right, self.left

    def remove(self, node):
        prev, nxt = node.prev, node.next
        prev.next, nxt.prev = nxt, prev

    def insert(self, node):
        prev, nxt = self.right.prev, self.right
        prev.next = nxt.prev = node
        node.prev, node.next = prev, nxt

    def get(self, key: int) -> int:
        if key in self.cache:
            self.remove(self.cache[key])
            self.insert(self.cache[key])
            return self.cache[key].val
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.remove(self.cache[key])
        self.cache[key] = Node(key, value)
        self.insert(self.cache[key])
        if len(self.cache) > self.cap:
            lru = self.left.next
            self.remove(lru)
            del self.cache[lru.key]`,
      javascript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const lruKey = this.cache.keys().next().value;
      this.cache.delete(lruKey);
    }
    this.cache.set(key, value);
  }
}`
    },
    testCases: [
      { id: 1, input: 'LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2)', expected: '[null, null, null, 1, null, -1]', isHidden: false },
      { id: 2, input: 'LRUCache(1), put(2,1), get(2), put(3,2), get(2), get(3)', expected: '[null, null, 1, null, -1, 2]', isHidden: false },
      { id: 3, input: 'Concurrent eviction stress test (1000 ops)', expected: 'PASSED (O(1) verified)', isHidden: true }
    ]
  },
  {
    id: "kafka-rate-limiter",
    title: "Kafka Distributed Token Bucket Rate Limiter",
    slug: "kafka-rate-limiter",
    difficulty: "Medium",
    category: "Distributed Systems & Telemetry",
    cpuLimit: "0.5 vCPU",
    memoryLimit: "128 MB",
    timeLimitMs: 2000,
    tags: ["Distributed Systems", "Kafka", "Rate Limiting", "Token Bucket"],
    description: `Implement a **Distributed Rate Limiter** that enforces strict token bucket constraints across worker partitions in Kafka.

Given \`capacity\` (max tokens) and \`refillRate\` (tokens per second), process incoming request events timestamped in milliseconds.
Return \`true\` if request is allowed, or \`false\` if rate limited.

The system must handle high concurrency and sync state atomically in Redis.`,
    examples: [
      {
        input: 'capacity = 3, refillRate = 1/sec\nRequests at [100ms, 200ms, 300ms, 400ms, 1500ms]',
        output: '[true, true, true, false, true]',
        explanation: 'At 400ms bucket is empty (3 tokens consumed). At 1500ms, 1 token refilled.'
      }
    ],
    starterCode: {
      java: `public class RateLimiter {
    private final double capacity;
    private final double refillRatePerMs;
    private double tokens;
    private long lastRefillTimestampMs;

    public RateLimiter(int capacity, double refillRatePerSec) {
        this.capacity = capacity;
        this.refillRatePerMs = refillRatePerSec / 1000.0;
        this.tokens = capacity;
        this.lastRefillTimestampMs = System.currentTimeMillis();
    }

    public synchronized boolean allowRequest(long nowMs) {
        long elapsed = nowMs - lastRefillTimestampMs;
        tokens = Math.min(capacity, tokens + (elapsed * refillRatePerMs));
        lastRefillTimestampMs = nowMs;

        if (tokens >= 1.0) {
            tokens -= 1.0;
            return true;
        }
        return false;
    }
}`,
      python: `class TokenBucketRateLimiter:
    def __init__(self, capacity: int, refill_rate_per_sec: float):
        self.capacity = capacity
        self.refill_rate = refill_rate_per_sec / 1000.0
        self.tokens = float(capacity)
        self.last_timestamp = 0

    def allow_request(self, now_ms: int) -> bool:
        elapsed = now_ms - self.last_timestamp
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_timestamp = now_ms
        if self.tokens >= 1.0:
            self.tokens -= 1.0
            return True
        return False`,
      javascript: `class TokenBucketRateLimiter {
  constructor(capacity, refillRatePerSec) {
    this.capacity = capacity;
    this.refillRatePerMs = refillRatePerSec / 1000;
    this.tokens = capacity;
    this.lastTimestamp = 0;
  }

  allowRequest(nowMs) {
    const elapsed = nowMs - this.lastTimestamp;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRatePerMs);
    this.lastTimestamp = nowMs;

    if (this.tokens >= 1.0) {
      this.tokens -= 1.0;
      return true;
    }
    return false;
  }
}`
    },
    testCases: [
      { id: 1, input: "cap=3, rate=1, times=[100,200,300,400,1500]", expected: "[true, true, true, false, true]", isHidden: false },
      { id: 2, input: "cap=5, rate=10, times=[0,10,20,30,40,50]", expected: "[true, true, true, true, true, false]", isHidden: false },
      { id: 3, input: "Burst load 10,000 reqs/sec partition sync", expected: "PASSED (0 data races detected)", isHidden: true }
    ]
  }
];

export const MOCK_CONTAINER_WORKERS = Array.from({ length: 12 }, (_, i) => ({
  id: `worker-${String(i + 1).padStart(2, "0")}`,
  name: `docker-eval-node-${i + 1}`,
  status: i % 5 === 0 ? "executing" : "idle",
  cpuUsage: (12 + (i * 7) % 45).toFixed(1) + "%",
  memoryMB: Math.floor(48 + (i * 11) % 65),
  maxMemoryMB: 128,
  kafkaPartition: `partition-${i}`,
  cgroupStatus: "enforced",
  uptime: `${Math.floor(12 + i * 3)}h ${i * 4}m`,
  processedJobs: 1420 + i * 312
}));

export const MOCK_METRICS = {
  jmeterSubmissionsPerMin: 624,
  jmeterConcurrent: 78,
  successRate: 99.1,
  p95LatencyMs: 218,
  totalSubmissions: 142890,
  activeWorkers: 12,
  kafkaLag: 3,
  redisCacheHitRatio: 94.2
};
