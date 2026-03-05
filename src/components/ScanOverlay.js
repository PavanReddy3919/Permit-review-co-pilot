export function renderScanOverlay(callout) {
  return `
    <div class="scan-overlay run-scan" aria-hidden="true">
      <div class="scanline"></div>
      <div class="sparkles"></div>
      <div class="scan-callout">${callout || 'Scanning page...'}</div>
    </div>
  `;
}
