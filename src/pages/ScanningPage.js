import { renderDocViewerTab } from '../components/DocViewerTab.js';

export function renderScanningPage(state) {
  const { docs, queue, scan } = state;
  const currentDoc = docs[scan.docIndex] || null;
  const queueRows = queue
    .map(
      (row) => `
      <li class="queue-row">
        <span class="queue-name">${row.title}</span>
        <span class="queue-chip ${row.state.toLowerCase()}">${row.state}</span>
      </li>
    `
    )
    .join('');

  return `
    <section class="stage stage-scan active">
      <div class="scan-header">
        <div>
          <p class="eyebrow">Stage 2 • Scan</p>
          <h2>Scanning Documents</h2>
          <p class="lead">Doc ${Math.max(1, scan.docIndex + 1)} of ${docs.length}</p>
        </div>
        <div class="scan-actions">
          <label class="toggle-wrap">
            <input type="checkbox" data-action="toggle-fast" ${scan.fastMode ? 'checked' : ''} />
            <span>Fast mode</span>
          </label>
          <button class="btn btn-secondary" data-action="cancel-reset">Cancel / Reset</button>
        </div>
      </div>

      <div class="progress-wrap wide">
        <div class="progress-track"><div class="progress-fill" style="width:${scan.progress}%"></div></div>
        <p class="progress-text">${Math.round(scan.progress)}%</p>
      </div>

      <div class="scan-layout">
        <aside class="queue-panel card">
          <p class="panel-title">Queue</p>
          <ul class="queue-list">${queueRows}</ul>
        </aside>

        <section class="viewer-panel card">
          ${renderDocViewerTab({
            doc: currentDoc,
            pageIndex: scan.pageIndex,
            mode: scan.openState === 'extracted' ? 'Extracted' : 'Scanning',
            openState: scan.openState,
            callout: 'Reading dimensions and legend...',
            findings: []
          })}
          ${
            scan.openState === 'extracted'
              ? `<div class="extract-summary"><p>Extraction complete</p>${scan.extractionSummary
                  .map(([k, v]) => `<span>${k}: <strong>${v}</strong></span>`)
                  .join('')}</div>`
              : ''
          }
        </section>
      </div>
    </section>
  `;
}
