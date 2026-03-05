export function renderImportPage(state) {
  const selected = state.uploadedFiles.length
    ? `<div class="file-chip-wrap">${state.uploadedFiles
        .map((name) => `<span class="chip selected-file">${name}</span>`)
        .join('')}</div>`
    : '<p class="helper">Choose one package PDF or multiple PDFs.</p>';

  return `
    <section class="stage stage-import active">
      <div class="hero-pattern" aria-hidden="true"></div>
      <div class="import-card glass">
        <p class="eyebrow">Stage 0 • Import</p>
        <h1>Smart Permit Review AI</h1>
        <p class="lead">Upload permit package files to simulate split, scan, rule review, and redline findings.</p>

        <div class="import-actions">
          <button class="btn btn-primary" data-action="pick-files">Import Permit Package</button>
          <button class="btn btn-secondary" data-action="drive-import">Import from Drive</button>
          <input id="fileInput" type="file" accept=".pdf,application/pdf" multiple hidden />
        </div>

        ${selected}

        <div class="footer-actions">
          <button class="btn btn-primary" data-action="start-flow" ${state.uploadedFiles.length ? '' : 'disabled'}>Start</button>
        </div>
      </div>
    </section>
  `;
}
