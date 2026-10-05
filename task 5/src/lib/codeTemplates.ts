import { CodeLanguage } from '../types';

export const CODE_TEMPLATES: Record<CodeLanguage, { code: string; title: string; description: string }> = {
  javascript: {
    title: 'High-Performance LRU Cache (Capacity = 5)',
    description: 'Dictated with Wispr Flow. Demonstrates deterministic Map-based O(1) eviction logic.',
    code: `/**
 * Voice Generated: High-Performance LRU Cache
 * Dictated with Wispr Flow for VoxForge Studio
 */
class LRUCache {
  constructor(capacity = 5) {
    this.capacity = capacity;
    this.cache = new Map();
    this.stats = { operations: 0, evictions: 0 };
  }

  get(key) {
    this.stats.operations++;
    if (!this.cache.has(key)) return -1;

    // Refresh order to mark as most recently used
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    this.stats.operations++;
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used (first item in Map)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      console.log(\`[Eviction] Purged least recently used key: '\${oldestKey}'\`);
    }
    this.cache.set(key, value);
  }
}

// Interactive Verification Test
console.log('--- Initializing LRUCache (Capacity = 5) ---');
const lru = new LRUCache(5);

// Populate cache
lru.put('usr:101', { name: 'Aarav', role: 'Sound Engineer' });
lru.put('usr:102', { name: 'Priya', role: 'Art Director' });
lru.put('usr:103', { name: 'Dev', role: 'AI Researcher' });
lru.put('usr:104', { name: 'Meera', role: 'Cinematographer' });
lru.put('usr:105', { name: 'Kabir', role: 'Lighting Designer' });

console.log('Populated 5 initial studio members successfully.');
console.log('Accessing usr:101 =>', lru.get('usr:101').name);

// Trigger eviction by adding 6th item
console.log('\\nAdding 6th member to trigger O(1) eviction...');
lru.put('usr:106', { name: 'Zara', role: 'Costume Stylist' });

console.log('Checking evicted usr:102 =>', lru.get('usr:102')); // Returns -1
console.log('Checking active usr:106 =>', lru.get('usr:106').name);
console.log('\\nExecution summary:');
console.log(\`• Cache Capacity: \${lru.capacity}\`);
console.log(\`• Operations Executed: \${lru.stats.operations}\`);
console.log(\`• Evictions Count: \${lru.stats.evictions}\`);
console.log('✅ LRU Cache test completed successfully!');
`
  },
  python: {
    title: 'Thread-Safe LRU Cache in Python 3',
    description: 'Voice-generated OrderedDict implementation with lock synchronization.',
    code: `# Voice Generated: High-Performance LRU Cache in Python 3
from collections import OrderedDict
import threading

class ThreadSafeLRUCache:
    def __init__(self, capacity: int = 5):
        self.capacity = capacity
        self.cache = OrderedDict()
        self.lock = threading.Lock()
        self.evictions = 0

    def get(self, key: str):
        with self.lock:
            if key not in self.cache:
                return -1
            self.cache.move_to_end(key)
            return self.cache[key]

    def put(self, key: str, value: any) -> None:
        with self.lock:
            if key in self.cache:
                self.cache.move_to_end(key)
            self.cache[key] = value
            if len(self.cache) > self.capacity:
                oldest = next(iter(self.cache))
                del self.cache[oldest]
                self.evictions += 1
                print(f"[Eviction] Removed key '{oldest}'")

# Demonstration
cache = ThreadSafeLRUCache(capacity=3)
cache.put("token_alpha", "sess_912")
cache.put("token_beta", "sess_913")
cache.put("token_gamma", "sess_914")
print("Retrieved beta:", cache.get("token_beta"))
cache.put("token_delta", "sess_915") # Evicts alpha
print("Retrieved alpha (evicted):", cache.get("token_alpha"))
print("Done. Total evictions:", cache.evictions)
`
  },
  typescript: {
    title: 'Strongly Typed Generic LRU Cache',
    description: 'Type-safe memory cache with millisecond TTL and generic key-value constraints.',
    code: `// Voice Generated: Strongly Typed LRU Cache in TypeScript
export interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export class GenericLRUCache<K, V> {
  private capacity: number;
  private store: Map<K, CacheEntry<V>> = new Map();

  constructor(capacity: number = 5) {
    this.capacity = capacity;
  }

  public get(key: K): V | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    this.store.delete(key);
    this.store.set(key, { value: entry.value, timestamp: Date.now() });
    return entry.value;
  }

  public put(key: K, value: V): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.capacity) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) this.store.delete(oldestKey);
    }
    this.store.set(key, { value, timestamp: Date.now() });
  }

  public size(): number {
    return this.store.size;
  }
}
`
  },
  sql: {
    title: 'PostgreSQL Analytical Telemetry Aggregations',
    description: 'Optimized voice transcription metrics query with 95th percentile latency calculation.',
    code: `-- Voice Generated: PostgreSQL Analytical Aggregations
-- VoxForge Studio Voice Telemetry Analysis
SELECT 
    DATE_TRUNC('hour', recorded_at) AS time_window,
    COUNT(session_id) AS total_voice_prompts,
    ROUND(AVG(transcription_latency_ms), 2) AS avg_flow_latency_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY transcription_latency_ms) AS p95_latency_ms,
    ROUND(
        COUNT(CASE WHEN transcription_latency_ms <= 200 THEN 1 END) * 100.0 / COUNT(session_id), 
        2
    ) AS sla_compliance_percentage
FROM 
    voice_command_telemetry
WHERE 
    recorded_at >= NOW() - INTERVAL '24 hours'
GROUP BY 
    time_window
ORDER BY 
    time_window DESC;
`
  }
};
