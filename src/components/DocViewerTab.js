import { renderPageTemplate } from './PageRenderers.js';
import { renderScanOverlay } from './ScanOverlay.js';
import { renderRedlineOverlay } from './RedlineOverlay.js';

export function renderDocViewerTab({
  doc,
  pageIndex,
  mode,
  openState,
  callout,
  findings = [],
  activeFindingId
}) {
  if (!doc) {
    return '<div class="doc-viewer-empty">Waiting for next document...</div>';
  }

  const page = doc.pages[pageIndex] || doc.pages[0];
  const pageFindings = findings.filter((item) => item.pageId === page.id);

  return `
    <section class="doc-viewer-tab ${openState || 'open'}">
      <header class="tab-header">
        <div>
          <p class="tab-title">${doc.title}</p>
          <p class="tab-sub">${doc.type} • ${page.label}</p>
        </div>
        <span class="state-pill ${mode.toLowerCase()}">${mode}</span>
      </header>
      <div class="tab-body">
        <aside class="thumb-list">
          ${doc.pages
            .map(
              (p, idx) =>
                `<button type="button" class="thumb ${idx === pageIndex ? 'active' : ''}" data-page-index="${idx}"><span>${p.label}</span><small>${p.template}</small></button>`
            )
            .join('')}
        </aside>
        <section class="page-stage">
          <div class="page-frame">
            <div class="page-canvas">
              ${renderPageTemplate(doc, page)}
            </div>
            ${mode === 'Scanning' ? renderScanOverlay(callout) : ''}
            ${mode === 'Reviewed' ? renderRedlineOverlay(pageFindings, activeFindingId) : ''}
          </div>
        </section>
      </div>
    </section>
  `;
}
