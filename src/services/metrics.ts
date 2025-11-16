import _ from 'lodash';

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
}

export function computeMetricsForHeader({ header, eventRows, durationRows, latencyRows, abcRows }: any) {
  const result: any = { header, metrics: {} };
  const totalEvents = _.sumBy(eventRows, (r: any) => r.payload?.total_count || (r.payload?.events?.length || 0));
  const sessionMinutes = header.session_length_minutes || 30;
  result.metrics.mean_rate_per_min = totalEvents / sessionMinutes;
  const durations = durationRows.flatMap((r: any) => r.payload?.episode_list?.map((e: any) => e.duration_seconds) || []);
  if (durations.length) result.metrics.mean_duration_sec = _.mean(durations);
  const latencies = latencyRows.flatMap((r: any) => r.payload?.trial_list?.filter((t: any) => t.behavior_occurred).map((t: any) => t.latency_seconds) || []);
  if (latencies.length) result.metrics.median_latency_sec = calculateMedian(latencies);
  const trials = latencyRows.flatMap((r: any) => r.payload?.trial_list || []);
  const trialsObserved = trials.length;
  const trialsWithBehavior = trials.filter((t: any) => t.behavior_occurred).length;
  result.metrics.conditional_probability = trialsObserved ? trialsWithBehavior / trialsObserved : null;
  result.metrics.raw = { eventRows, durationRows, latencyRows, abcRows };
  return result;
}

export function mergeIndirectSummaries({ indirectPayloads, headerMetrics }: any) {
  const bySource = _.groupBy(indirectPayloads, 'source');
  const parents = (bySource.parent || []).map((p: any) => p.payload);
  const teachers = (bySource.teacher || []).map((p: any) => p.payload);
  return { 
    created_at: new Date().toISOString(), 
    themes: { parentContexts: parents, teacherContexts: teachers }, 
    headerMetrics, 
    synthesisNotes: 'Auto-synthesis: review manually' 
  };
}