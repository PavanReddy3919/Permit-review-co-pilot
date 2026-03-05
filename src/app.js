import { createFlowMachine, STAGES } from './state/useFlowMachine.js';
import { splitUploadedFiles, makeInitialQueue } from './data/mockPackage.js';
import { renderImportPage } from './pages/ImportPage.js';
import { renderSplittingPage } from './pages/SplittingPage.js';
import { renderScanningPage } from './pages/ScanningPage.js';
import { renderReviewingPage } from './pages/ReviewingPage.js';
import { renderFindingsPage } from './pages/FindingsPage.js';
import { renderToast } from './components/Toast.js';

const appEl = document.getElementById('app');
const flow = createFlowMachine();

flow.subscribe((state) => {
  appEl.innerHTML = renderApp(state);
  wireUi(state);
  autoClearToast(state);
});

flow.patch(flow.getState());

function renderApp(state) {
  return `
    <div class="shell stage-${state.stage.toLowerCase()}">
      <header class="top-nav glass">
        <div class="brand">
          <span class="logo-dot"></span>
          <strong>Smart Permit Review AI</strong>
        </div>
        <div class="stage-indicator">${renderStageStepper(state.stage)}</div>
      </header>

      <main class="stage-host">
        ${renderStage(state)}
      </main>

      ${renderToast(state.toast)}
    </div>
  `;
}

function renderStage(state) {
  if (state.stage === STAGES.IMPORT) return renderImportPage(state);
  if (state.stage === STAGES.SPLIT) return renderSplittingPage(state);
  if (state.stage === STAGES.SCAN) return renderScanningPage(state);
  if (state.stage === STAGES.REVIEW) return renderReviewingPage(state);
  return renderFindingsPage(state);
}

function renderStageStepper(active) {
  const order = [STAGES.IMPORT, STAGES.SPLIT, STAGES.SCAN, STAGES.REVIEW, STAGES.FINDINGS];
  return order
    .map((stage, idx) => `<span class="step ${stage === active ? 'active' : ''}">${idx}. ${stage}</span>`)
    .join('');
}

function wireUi(state) {
  appEl.querySelectorAll('[data-action]').forEach((el) => {
    const action = el.dataset.action;
    if (action === 'pick-files') el.addEventListener('click', pickFiles);
    if (action === 'drive-import') el.addEventListener('click', driveImport);
    if (action === 'start-flow') el.addEventListener('click', startFlow);
    if (action === 'toggle-fast') el.addEventListener('change', toggleFastMode);
    if (action === 'cancel-reset') el.addEventListener('click', resetToImport);
    if (action === 'go-findings') el.addEventListener('click', goFindings);
    if (action === 'download-fake') el.addEventListener('click', fakeDownload);
    if (action === 'start-over') el.addEventListener('click', resetToImport);
    if (action === 'select-doc') el.addEventListener('click', selectDoc);
    if (action === 'select-finding') el.addEventListener('click', selectFinding);
    if (action === 'sort-findings') el.addEventListener('change', sortFindings);
    if (action === 'prev-finding') el.addEventListener('click', prevFinding);
    if (action === 'next-finding') el.addEventListener('click', nextFinding);
  });

  const input = document.getElementById('fileInput');
  if (input) {
    input.addEventListener('change', (event) => {
      const files = Array.from(event.target.files || []).filter((file) => /\.pdf$/i.test(file.name));
      flow.patch({ uploadedFiles: files.map((file) => file.name) });
    });
  }

  if (state.stage === STAGES.FINDINGS) {
    appEl.querySelectorAll('.mark[data-finding-id]').forEach((el) => {
      el.addEventListener('click', () => {
        const findingId = el.dataset.findingId;
        patchFindings({ selectedFindingId: findingId });
      });
    });
  }
}

function pickFiles() {
  const input = document.getElementById('fileInput');
  if (input) input.click();
}

function driveImport() {
  flow.notify('Drive connected. Select local files to simulate import.', 'success');
  pickFiles();
}

async function startFlow() {
  const state = flow.getState();
  if (!state.uploadedFiles.length) return;

  const docs = splitUploadedFiles(state.uploadedFiles);
  const queue = makeInitialQueue(docs);
  const token = flow.bumpRunToken();

  flow.transition(STAGES.SPLIT);
  flow.patch({ docs, queue, splitProgress: 0, findings: { ...state.findings, selectedDocId: null, selectedFindingId: null } });
  await runSplitSimulation(token);

  if (token !== flow.getState().runToken) return;
  flow.transition(STAGES.SCAN);
  await runScanSimulation(token);

  if (token !== flow.getState().runToken) return;
  flow.transition(STAGES.REVIEW);
  await runReviewSimulation(token);
}

async function runSplitSimulation(token) {
  for (let i = 0; i <= 100; i += 6) {
    if (token !== flow.getState().runToken) return;
    flow.patch({ splitProgress: i });
    await delay(90);
  }
  flow.patch({ splitProgress: 100 });
  await delay(220);
}

async function runScanSimulation(token) {
  const docs = flow.getState().docs;

  for (let d = 0; d < docs.length; d += 1) {
    if (token !== flow.getState().runToken) return;
    const doc = docs[d];
    patchQueue(doc.id, 'Opening');
    flow.update((s) => ({
      ...s,
      scan: { ...s.scan, docIndex: d, pageIndex: 0, openState: 'opening', extractionSummary: [] }
    }));
    await delay(scanMs(340));

    patchQueue(doc.id, 'Scanning');
    for (let p = 0; p < doc.pages.length; p += 1) {
      if (token !== flow.getState().runToken) return;
      const pct = ((d + p / doc.pages.length) / docs.length) * 100;
      flow.update((s) => ({
        ...s,
        scan: { ...s.scan, docIndex: d, pageIndex: p, openState: 'scanning', progress: pct }
      }));
      await delay(scanMs(560));
    }

    patchQueue(doc.id, 'Extracted');
    flow.update((s) => ({
      ...s,
      scan: {
        ...s.scan,
        docIndex: d,
        pageIndex: Math.max(0, doc.pages.length - 1),
        openState: 'extracted',
        extractionSummary: doc.extractedFields.slice(0, 4),
        progress: ((d + 0.88) / docs.length) * 100
      }
    }));
    await delay(scanMs(820));

    patchQueue(doc.id, 'Closed');
    flow.update((s) => ({ ...s, scan: { ...s.scan, openState: 'closing', progress: ((d + 1) / docs.length) * 100 } }));
    await delay(scanMs(320));
  }

  flow.update((s) => ({ ...s, scan: { ...s.scan, progress: 100 } }));
}

async function runReviewSimulation(token) {
  const docs = flow.getState().docs;
  const steps = [
    { category: 'Parse', message: 'Tokenizing extracted sheets', rule: 'Section parser' },
    { category: 'Rules', message: 'Checking egress widths', rule: 'IBC 1005.3' },
    { category: 'Cross-check', message: 'Comparing zoning limits with plans', rule: 'Zoning §12.4' },
    { category: 'Redline', message: 'Placing required correction markups', rule: 'ADA 404.2.3' },
    { category: 'Summary', message: 'Compiling package report', rule: 'Review summary spec' }
  ];

  flow.patch({ review: { progress: 0, currentRule: 'Initializing review engine...', logs: [] } });

  for (let i = 0; i < docs.length; i += 1) {
    if (token !== flow.getState().runToken) return;
    const doc = docs[i];
    patchQueue(doc.id, 'Reviewing');

    for (let s = 0; s < steps.length; s += 1) {
      if (token !== flow.getState().runToken) return;
      const row = steps[s];
      const pct = ((i + (s + 1) / steps.length) / docs.length) * 100;
      flow.update((st) => ({
        ...st,
        review: {
          progress: pct,
          currentRule: row.rule,
          logs: [...st.review.logs, { ...row, time: timeStamp(), message: `${doc.title}: ${row.message}` }]
        }
      }));
      await delay(180);
    }

    patchQueue(doc.id, 'Done');
  }

  flow.update((st) => ({ ...st, review: { ...st.review, progress: 100, currentRule: 'Completed' } }));
  flow.notify('Review complete. Findings ready to inspect.', 'success');
}

function goFindings() {
  const state = flow.getState();
  if (!flow.transition(STAGES.FINDINGS)) return;
  const firstDoc = state.docs[0] || null;
  const firstFinding = firstDoc?.reviewFindings[0] || null;
  flow.patch({
    findings: {
      selectedDocId: firstDoc?.id || null,
      selectedFindingId: firstFinding?.id || null,
      sortBy: 'severity-desc'
    }
  });
}

function fakeDownload() {
  flow.notify('Download started (demo). No actual file generated.', 'info');
}

function resetToImport() {
  flow.bumpRunToken();
  const current = flow.getState();
  if (current.stage !== STAGES.IMPORT) flow.transition(STAGES.IMPORT);
  flow.patch({
    uploadedFiles: [],
    docs: [],
    queue: [],
    splitProgress: 0,
    scan: { docIndex: -1, pageIndex: 0, progress: 0, fastMode: false, openState: 'closed', extractionSummary: [] },
    review: { progress: 0, currentRule: 'Idle', logs: [] },
    findings: { selectedDocId: null, selectedFindingId: null, sortBy: 'severity-desc' }
  });
}

function toggleFastMode(event) {
  const checked = Boolean(event.target.checked);
  flow.update((state) => ({ ...state, scan: { ...state.scan, fastMode: checked } }));
}

function selectDoc(event) {
  const docId = event.currentTarget.dataset.docId;
  const doc = flow.getState().docs.find((row) => row.id === docId);
  if (!doc) return;
  patchFindings({ selectedDocId: docId, selectedFindingId: doc.reviewFindings[0]?.id || null });
}

function selectFinding(event) {
  const findingId = event.currentTarget.dataset.findingId;
  patchFindings({ selectedFindingId: findingId });
}

function sortFindings(event) {
  patchFindings({ sortBy: event.currentTarget.value });
}

function prevFinding() {
  jumpFinding(-1);
}

function nextFinding() {
  jumpFinding(1);
}

function jumpFinding(direction) {
  const state = flow.getState();
  const doc = state.docs.find((item) => item.id === state.findings.selectedDocId);
  if (!doc || !doc.reviewFindings.length) return;
  const list = doc.reviewFindings.slice();
  const index = Math.max(0, list.findIndex((row) => row.id === state.findings.selectedFindingId));
  const next = (index + direction + list.length) % list.length;
  patchFindings({ selectedFindingId: list[next].id });
}

function patchFindings(patch) {
  flow.update((state) => ({ ...state, findings: { ...state.findings, ...patch } }));
}

function patchQueue(docId, nextState) {
  flow.update((state) => ({
    ...state,
    queue: state.queue.map((row) => (row.docId === docId ? { ...row, state: nextState } : row))
  }));
}

function timeStamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function scanMs(normalValue) {
  return flow.getState().scan.fastMode ? Math.max(80, Math.round(normalValue * 0.45)) : normalValue;
}

function autoClearToast(state) {
  if (!state.toast) return;
  const toastId = state.toast.id;
  setTimeout(() => flow.clearToast(toastId), 2200);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
