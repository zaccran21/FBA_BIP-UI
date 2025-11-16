"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeMetricsForHeader = computeMetricsForHeader;
exports.mergeIndirectSummaries = mergeIndirectSummaries;
const lodash_1 = __importDefault(require("lodash"));
function calculateMedian(values) {
    if (values.length === 0)
        return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}
function computeMetricsForHeader({ header, eventRows, durationRows, latencyRows, abcRows }) {
    const result = { header, metrics: {} };
    const totalEvents = lodash_1.default.sumBy(eventRows, (r) => r.payload?.total_count || (r.payload?.events?.length || 0));
    const sessionMinutes = header.session_length_minutes || 30;
    result.metrics.mean_rate_per_min = totalEvents / sessionMinutes;
    const durations = durationRows.flatMap((r) => r.payload?.episode_list?.map((e) => e.duration_seconds) || []);
    if (durations.length)
        result.metrics.mean_duration_sec = lodash_1.default.mean(durations);
    const latencies = latencyRows.flatMap((r) => r.payload?.trial_list?.filter((t) => t.behavior_occurred).map((t) => t.latency_seconds) || []);
    if (latencies.length)
        result.metrics.median_latency_sec = calculateMedian(latencies);
    const trials = latencyRows.flatMap((r) => r.payload?.trial_list || []);
    const trialsObserved = trials.length;
    const trialsWithBehavior = trials.filter((t) => t.behavior_occurred).length;
    result.metrics.conditional_probability = trialsObserved ? trialsWithBehavior / trialsObserved : null;
    result.metrics.raw = { eventRows, durationRows, latencyRows, abcRows };
    return result;
}
function mergeIndirectSummaries({ indirectPayloads, headerMetrics }) {
    const bySource = lodash_1.default.groupBy(indirectPayloads, 'source');
    const parents = (bySource.parent || []).map((p) => p.payload);
    const teachers = (bySource.teacher || []).map((p) => p.payload);
    return {
        created_at: new Date().toISOString(),
        themes: { parentContexts: parents, teacherContexts: teachers },
        headerMetrics,
        synthesisNotes: 'Auto-synthesis: review manually'
    };
}
