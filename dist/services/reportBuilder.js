import Mustache from 'mustache';
export function buildIntegratedReport(summaryJson) {
    const template = `
  <html><head><style>body{font-family:Arial;font-size:12px}</style></head><body>
  <h2>FBA Integrated Indirect + Direct Summary</h2>
  <p><strong>Student:</strong> {{case.student_name}}</p>
  <h3>Key Metrics</h3>
  <ul>
    <li>Mean rate / min: {{metrics.mean_rate_per_min}}</li>
    <li>Mean duration sec: {{metrics.mean_duration_sec}}</li>
    <li>Median latency sec: {{metrics.median_latency_sec}}</li>
  </ul>
  <h3>Indirect Themes</h3>
  <p>Parent contexts: {{themes.parentContextsString}}</p>
  <p>Teacher contexts: {{themes.teacherContextsString}}</p>
  <h3>Preliminary Hypotheses</h3>
  <p>{{synthesisNotes}}</p>
  </body></html>`;
    // Pre-process the data to join arrays into strings
    const data = {
        ...summaryJson,
        themes: {
            ...summaryJson.themes,
            parentContextsString: summaryJson.themes?.parentContexts?.join('; ') || '',
            teacherContextsString: summaryJson.themes?.teacherContexts?.join('; ') || ''
        }
    };
    return Mustache.render(template, data);
}
