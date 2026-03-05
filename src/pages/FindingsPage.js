import { renderDocViewerTab } from '../components/DocViewerTab.js';
import { severityWeight } from '../data/mockPackage.js';

export function renderFindingsPage(state) {
  const docs = state.docs;
  const selectedDoc = docs.find((doc) => doc.id === state.findings.selectedDocId) || docs[0];
  const sortMode = state.findings.sortBy;

  const findings = sortFindings(selectedDoc?.reviewFindings || [], sortMode);
  const selectedFinding = findings.find((item) => item.id === state.findings.selectedFindingId) || findings[0] || null;
  const pageIndex = selectedDoc ? selectedDoc.pages.findIndex((page) => page.id === selectedFinding?.pageId) : 0;

  return `
    <section class="stage stage-findings active">
      <div class="findings-head">
        <div>
          <p class="eyebrow">Stage 4 • Findings</p>
          <h2>Reviewed Comments & Findings</h2>
        </div>
        <div class="head-actions">
          <button class="btn btn-secondary" data-action="download-fake">Download reviewed package</button>
          <button class="btn btn-primary" data-action="start-over">Start over</button>
        </div>
      </div>

      <div class="findings-layout">
        <aside class="card docs-panel">
          <p class="panel-title">Reviewed Docs</p>
          <ul class="doc-list">
            ${docs
              .map((doc) => {
                const counts = countBySeverity(doc.reviewFindings);
                const selected = doc.id === selectedDoc?.id ? 'selected' : '';
                return `
                  <li>
                    <button class="doc-item ${selected}" data-action="select-doc" data-doc-id="${doc.id}">
                      <strong>${doc.title}</strong>
                      <span class="badge-row">
                        <span class="badge required">${counts.Required} required</span>
                        <span class="badge warning">${counts.Warning} warnings</span>
                        <span class="badge info">${counts.Info} info</span>
                      </span>
                    </button>
                  </li>
                `;
              })
              .join('')}
          </ul>
        </aside>

        <section class="card findings-panel">
          <div class="panel-head-inline">
            <p class="panel-title">Findings</p>
            <select data-action="sort-findings" class="sort-select">
              <option value="severity-desc" ${sortMode === 'severity-desc' ? 'selected' : ''}>Severity (High to Low)</option>
              <option value="severity-asc" ${sortMode === 'severity-asc' ? 'selected' : ''}>Severity (Low to High)</option>
            </select>
          </div>

          <ul class="finding-list">
            ${findings
              .map(
                (finding) => `
                <li>
                  <button class="finding-item ${finding.id === selectedFinding?.id ? 'active' : ''}" data-action="select-finding" data-finding-id="${finding.id}">
                    <span class="chip ${finding.severity.toLowerCase()}">${finding.severity}</span>
                    <strong>${finding.label}</strong>
                    <p>${finding.text}</p>
                    <div class="review-meta"><small>${finding.sheet}</small><span class="rule-pill">${finding.rule}</span></div>
                  </button>
                </li>
              `
              )
              .join('')}
          </ul>
        </section>

        <section class="card preview-panel">
          <div class="panel-head-inline">
            <p class="panel-title">Preview</p>
            <div class="nav-inline">
              <button class="btn tiny" data-action="prev-finding">Prev</button>
              <button class="btn tiny" data-action="next-finding">Next</button>
            </div>
          </div>
          ${
            selectedDoc
              ? renderDocViewerTab({
                  doc: selectedDoc,
                  pageIndex: Math.max(0, pageIndex),
                  mode: 'Reviewed',
                  openState: 'open',
                  findings,
                  activeFindingId: selectedFinding?.id
                })
              : '<p class="helper">No document selected.</p>'
          }
        </section>
      </div>
    </section>
  `;
}

function sortFindings(findings, sortMode) {
  const rows = findings.slice();
  if (sortMode === 'severity-asc') {
    rows.sort((a, b) => severityWeight(a.severity) - severityWeight(b.severity));
    return rows;
  }
  rows.sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity));
  return rows;
}

function countBySeverity(rows) {
  return rows.reduce(
    (acc, row) => {
      acc[row.severity] += 1;
      return acc;
    },
    { Required: 0, Warning: 0, Info: 0 }
  );
}
