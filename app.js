import { DOCUMENTS, STATUS_STEPS, SPEEDS } from './data/documents.js';
import { DocumentViewer } from './components/viewer.js';

const appState = {
  mode: 'idle',
  speed: 'normal',
  runToken: 0,
  outputs: [],
  queue: new Map(),
  latestExtractionDocId: null
};

const inputList = document.getElementById('inputList');
const outputList = document.getElementById('outputList');
const statusLog = document.getElementById('statusLog');
const queueList = document.getElementById('queueList');
const extractionList = document.getElementById('extractionList');
const importBtn = document.getElementById('importBtn');
const resetBtn = document.getElementById('resetBtn');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const aiStateText = document.getElementById('aiStateText');
const aiShell = document.getElementById('aiShell');
const intakeSlot = document.getElementById('intakeSlot');
const speedBtns = Array.from(document.querySelectorAll('.speed-btn'));

const viewer = new DocumentViewer({
  onClose: () => {
    if (appState.mode === 'running') return;
  }
});

initializeQueue();

function initializeQueue() {
  appState.queue = new Map();
  DOCUMENTS.forEach((doc) => {
    appState.queue.set(doc.id, { docId: doc.id, status: 'Scanned', visible: false });
  });
}

function renderInputList() {
  inputList.innerHTML = '';
  DOCUMENTS.forEach((doc) => {
    const card = document.createElement('article');
    card.className = 'file-card input-card';
    card.dataset.id = doc.id;
    card.innerHTML = `
      <div class="icon">${docIcon()}</div>
      <div class="meta">
        <p class="name">${doc.name}</p>
        <p class="sub">${doc.type} • ${doc.size}</p>
      </div>
    `;
    inputList.appendChild(card);
  });
}

function renderQueue() {
  const items = Array.from(appState.queue.values()).filter((row) => row.visible);
  if (!items.length) {
    queueList.innerHTML = '<li class="empty-text">Queue is empty.</li>';
    return;
  }

  queueList.innerHTML = '';
  items.forEach((item) => {
    const doc = DOCUMENTS.find((d) => d.id === item.docId);
    if (!doc) return;
    const row = document.createElement('li');
    row.className = 'queue-row';
    row.innerHTML = `
      <span class="queue-name">${doc.name}</span>
      <span class="queue-chip ${item.status.toLowerCase()}">${item.status}</span>
    `;
    queueList.appendChild(row);
  });
}

function setQueueState(docId, status, visible = true) {
  const row = appState.queue.get(docId);
  if (!row) return;
  row.status = status;
  row.visible = visible;
  appState.queue.set(docId, row);
  renderQueue();
}

function renderExtractionSummary() {
  const doc = DOCUMENTS.find((d) => d.id === appState.latestExtractionDocId);
  if (!doc) {
    extractionList.innerHTML = '<li class="empty-text">No document scanned yet.</li>';
    return;
  }

  extractionList.innerHTML = '';
  doc.extractedFields.slice(0, 6).forEach(([label, value]) => {
    const row = document.createElement('li');
    row.className = 'extract-row';
    row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    extractionList.appendChild(row);
  });
}

function renderOutputList() {
  outputList.innerHTML = '';
  if (!appState.outputs.length) {
    outputList.classList.add('empty');
    outputList.innerHTML = '<p class="empty-text">No reviewed files yet.</p>';
    return;
  }

  outputList.classList.remove('empty');
  appState.outputs.forEach((output, idx) => {
    const card = document.createElement('button');
    card.className = 'file-card output-card';
    card.type = 'button';
    card.dataset.outputId = output.id;
    card.style.animationDelay = `${idx * 70}ms`;
    card.innerHTML = `
      <div class="icon">${reviewedIcon()}</div>
      <div class="meta">
        <p class="name">Reviewed_${output.name}</p>
        <div class="badges-row">
          <span class="badge reviewed">Reviewed</span>
          <span class="badge comments">${output.commentCount} comments</span>
          <span class="badge required">${output.requiredFixes} required fixes</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => viewer.openReview(output));
    outputList.appendChild(card);
  });
}

function addLog(message) {
  const row = document.createElement('li');
  row.className = 'status-row';
  row.textContent = message;
  statusLog.prepend(row);
}

function clearLog() {
  statusLog.innerHTML = '';
}

function setProgress(value) {
  const clamped = Math.max(0, Math.min(100, value));
  progressBar.style.width = `${clamped}%`;
  progressText.textContent = `${Math.round(clamped)}%`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stableHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function outputForDoc(doc) {
  const hash = stableHash(doc.id);
  const commentCount = Math.max(6, doc.reviewFindings.length * 3 + (hash % 5));
  const requiredFixes = Math.max(1, doc.reviewFindings.filter((item) => item.severity === 'Required').length);
  return {
    ...doc,
    commentCount,
    requiredFixes
  };
}

function createFlyCard(sourceCard) {
  const rect = sourceCard.getBoundingClientRect();
  const slotRect = intakeSlot.getBoundingClientRect();
  const fly = sourceCard.cloneNode(true);
  fly.classList.add('fly-card');
  fly.style.left = `${rect.left}px`;
  fly.style.top = `${rect.top}px`;
  fly.style.width = `${rect.width}px`;
  fly.style.height = `${rect.height}px`;
  fly.style.setProperty('--dx', `${slotRect.left - rect.left + slotRect.width * 0.1}px`);
  fly.style.setProperty('--dy', `${slotRect.top - rect.top + slotRect.height * 0.2}px`);
  document.body.appendChild(fly);

  requestAnimationFrame(() => {
    fly.classList.add('move');
  });

  setTimeout(() => fly.remove(), 520);
}

async function animateIntake(token) {
  const cards = Array.from(document.querySelectorAll('.input-card'));
  const timings = SPEEDS[appState.speed];

  for (let i = 0; i < cards.length; i += 1) {
    const card = cards[i];
    const doc = DOCUMENTS[i];
    if (token !== appState.runToken) return;

    // Import sequence per document: card flight -> viewer scan -> queue update.
    createFlyCard(card);
    viewer.openScan(doc);
    setQueueState(doc.id, 'Scanned', true);
    addLog(`Scanning: ${doc.name}`);
    await delay(timings.intakeFlight);

    await viewer.runScanAnimation(timings.scanDuration, () => token === appState.runToken);
    if (token !== appState.runToken) return;

    appState.latestExtractionDocId = doc.id;
    renderExtractionSummary();

    setQueueState(doc.id, 'Queued', true);
    card.classList.add('queued');
    addLog(`Queued: ${doc.name}`);
  }
}

async function runReview(token) {
  const timings = SPEEDS[appState.speed];
  const duration = timings.reviewBase + DOCUMENTS.length * timings.reviewPerFile;
  const tickMs = 90;
  const steps = Math.ceil(duration / tickMs);
  const statusEvery = Math.max(1, Math.round(timings.statusInterval / tickMs));
  let currentReviewIndex = -1;

  aiStateText.textContent = 'Reviewing...';
  aiShell.classList.add('is-reviewing');
  addLog('Smart Permit Review AI started analysis');

  for (let i = 1; i <= steps; i += 1) {
    if (token !== appState.runToken) return;
    const pct = (i / steps) * 100;
    setProgress(pct);

    const reviewingIndex = Math.min(DOCUMENTS.length - 1, Math.floor((i / steps) * DOCUMENTS.length));
    if (reviewingIndex !== currentReviewIndex) {
      if (currentReviewIndex >= 0) {
        setQueueState(DOCUMENTS[currentReviewIndex].id, 'Done', true);
      }
      currentReviewIndex = reviewingIndex;
      setQueueState(DOCUMENTS[currentReviewIndex].id, 'Reviewing', true);
    }

    // Timed status flow: rotate through realistic permit review phases.
    if (i % statusEvery === 0) {
      const step = STATUS_STEPS[Math.min(STATUS_STEPS.length - 1, Math.floor((i / steps) * STATUS_STEPS.length))];
      addLog(step);
    }

    await delay(tickMs);
  }

  DOCUMENTS.forEach((doc) => setQueueState(doc.id, 'Done', true));
  setProgress(100);
  addLog('Review complete. Generating reviewed package...');
}

async function revealOutputs(token) {
  const { outputInterval } = SPEEDS[appState.speed];
  appState.outputs = [];
  renderOutputList();

  for (let i = 0; i < DOCUMENTS.length; i += 1) {
    if (token !== appState.runToken) return;
    appState.outputs.push(outputForDoc(DOCUMENTS[i]));
    renderOutputList();
    addLog(`Published: Reviewed_${DOCUMENTS[i].name}`);
    await delay(outputInterval);
  }
}

async function startFlow() {
  if (appState.mode !== 'idle') return;

  appState.mode = 'running';
  appState.runToken += 1;
  const token = appState.runToken;

  importBtn.disabled = true;
  aiStateText.textContent = 'Importing files...';
  clearLog();
  setProgress(0);
  outputList.classList.add('empty');
  initializeQueue();
  renderQueue();

  await animateIntake(token);
  if (token !== appState.runToken) return;
  viewer.close();

  await runReview(token);
  if (token !== appState.runToken) return;

  await revealOutputs(token);
  if (token !== appState.runToken) return;

  aiShell.classList.remove('is-reviewing');
  aiStateText.textContent = 'Completed';
  addLog('All reviewed documents are ready');

  importBtn.disabled = false;
  appState.mode = 'idle';
}

function resetFlow() {
  appState.runToken += 1;
  appState.mode = 'idle';
  appState.outputs = [];
  appState.latestExtractionDocId = null;

  importBtn.disabled = false;
  aiShell.classList.remove('is-reviewing');
  aiStateText.textContent = 'Idle';
  setProgress(0);
  clearLog();
  initializeQueue();
  renderQueue();
  renderExtractionSummary();

  Array.from(document.querySelectorAll('.input-card')).forEach((card) => {
    card.classList.remove('queued');
  });

  renderOutputList();
  viewer.close();
}

function setSpeed(mode) {
  appState.speed = mode;
  speedBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.speed === mode);
  });
}

function docIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5"/>
    </svg>
  `;
}

function reviewedIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2l2.7 5.5 6.1.9-4.4 4.2 1 6-5.4-2.9-5.4 2.9 1-6L3.2 8.4l6.1-.9L12 2z"/>
    </svg>
  `;
}

importBtn.addEventListener('click', startFlow);
resetBtn.addEventListener('click', resetFlow);

speedBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (appState.mode === 'running') return;
    setSpeed(btn.dataset.speed);
  });
});

renderInputList();
renderQueue();
renderOutputList();
renderExtractionSummary();
setProgress(0);
