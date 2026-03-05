import { SCAN_CALLOUTS } from '../data/documents.js';

export class DocumentViewer {
  constructor({ onClose }) {
    this.modal = document.getElementById('viewerModal');
    this.titleEl = document.getElementById('viewerTitle');
    this.eyebrowEl = document.getElementById('viewerEyebrow');
    this.thumbList = document.getElementById('thumbList');
    this.pageCanvas = document.getElementById('pageCanvas');
    this.reviewList = document.getElementById('reviewList');
    this.sidebarTitle = document.getElementById('viewerSidebarTitle');
    this.redlineLayer = document.getElementById('redlineLayer');
    this.scanOverlay = document.getElementById('scanOverlay');
    this.scanCallout = document.getElementById('scanCallout');
    this.modeToggle = document.getElementById('viewerModeToggle');
    this.closeBtn = document.getElementById('viewerCloseBtn');
    this.viewTabs = Array.from(document.querySelectorAll('.viewer-tab'));

    this.onClose = onClose;
    this.state = {
      isOpen: false,
      mode: 'scan',
      view: 'preview',
      doc: null,
      pageId: null
    };

    this.closeBtn.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.dataset.close === 'true') {
        this.close();
      }
    });

    this.viewTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        this.setView(tab.dataset.view || 'preview');
      });
    });
  }

  openScan(doc) {
    this.state.mode = 'scan';
    this.state.view = 'preview';
    this.openWithDocument(doc, doc.pages[0]?.id || null);
    this.modeToggle.classList.add('hidden');
    this.scanOverlay.classList.remove('hidden');
    this.scanOverlay.classList.remove('run-scan');
    this.redlineLayer.classList.remove('active');
    this.eyebrowEl.textContent = 'Document Viewer • Scan Mode';
    this.sidebarTitle.textContent = 'Extraction Summary';
    this.renderExtractionSummary();
  }

  openReview(doc) {
    this.state.mode = 'review';
    this.state.view = 'redline';
    const pageWithFinding = doc.reviewFindings[0]?.pageId || doc.pages[0]?.id || null;
    this.openWithDocument(doc, pageWithFinding);
    this.modeToggle.classList.remove('hidden');
    this.scanOverlay.classList.add('hidden');
    this.eyebrowEl.textContent = 'Document Viewer • Review Mode';
    this.sidebarTitle.textContent = 'Review Comments';
    this.setView('redline');
    this.renderReviewSidebar();
  }

  openWithDocument(doc, pageId) {
    this.state.doc = doc;
    this.state.pageId = pageId;
    this.titleEl.textContent = doc.name;
    this.renderThumbs();
    this.renderPage();
    this.open();
  }

  open() {
    this.state.isOpen = true;
    this.modal.classList.add('open');
    this.modal.setAttribute('aria-hidden', 'false');
  }

  close() {
    this.state.isOpen = false;
    this.modal.classList.remove('open');
    this.modal.setAttribute('aria-hidden', 'true');
    this.scanOverlay.classList.remove('run-scan');
    if (this.onClose) this.onClose();
  }

  renderThumbs() {
    const { doc, pageId } = this.state;
    this.thumbList.innerHTML = '';
    doc.pages.forEach((page, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `thumb ${page.id === pageId ? 'active' : ''}`;
      btn.innerHTML = `<span>${page.label}</span><small>${page.template}</small>`;
      btn.addEventListener('click', () => {
        this.state.pageId = page.id;
        this.renderThumbs();
        this.renderPage();
        this.renderReviewSidebar();
      });
      this.thumbList.appendChild(btn);
    });
  }

  renderPage() {
    const page = this.currentPage();
    if (!page || !this.state.doc) {
      this.pageCanvas.innerHTML = '';
      return;
    }
    if (page.template === 'image' && page.imageSrc) {
      this.pageCanvas.innerHTML = `<img class="page-image" src="${page.imageSrc}" alt="${page.label}" loading="eager" />`;
    } else {
      this.pageCanvas.innerHTML = `<div class="page-fallback">No image configured for ${page.label}</div>`;
    }
    this.renderRedlineLayer();
  }

  currentPage() {
    return this.state.doc?.pages.find((p) => p.id === this.state.pageId) || null;
  }

  scanCalloutsForCurrentDoc() {
    const page = this.currentPage();
    const scanKey = page?.scanType || page?.template || 'blueprint';
    return SCAN_CALLOUTS[scanKey] || SCAN_CALLOUTS.blueprint;
  }

  async runScanAnimation(durationMs, tokenRef) {
    this.scanOverlay.classList.remove('hidden');
    this.scanOverlay.classList.add('run-scan');

    const callouts = this.scanCalloutsForCurrentDoc();
    const interval = Math.max(230, Math.floor(durationMs / callouts.length));
    let i = 0;

    while (i < callouts.length) {
      if (tokenRef && tokenRef() === false) return;
      if (i > 0) {
        this.flipToScanPage(i);
      }
      this.scanCallout.textContent = callouts[i];
      i += 1;
      await delay(interval);
    }

    await delay(Math.max(120, durationMs - interval * callouts.length));
    this.scanOverlay.classList.remove('run-scan');
    this.scanOverlay.classList.add('hidden');
  }

  flipToScanPage(step) {
    if (!this.state.doc || !this.state.doc.pages.length) return;
    const index = step % this.state.doc.pages.length;
    this.state.pageId = this.state.doc.pages[index].id;
    this.pageCanvas.classList.remove('flip');
    void this.pageCanvas.offsetWidth;
    this.pageCanvas.classList.add('flip');
    this.renderThumbs();
    this.renderPage();
  }

  setView(view) {
    this.state.view = view;
    this.viewTabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.view === view);
    });
    if (view === 'redline') {
      this.redlineLayer.classList.add('active');
      this.renderReviewSidebar();
    } else {
      this.redlineLayer.classList.remove('active');
      this.reviewList.innerHTML = '<p class="empty-text">Preview mode active. Switch to Redline for findings.</p>';
    }
  }

  renderRedlineLayer() {
    if (!this.state.doc) return;
    const page = this.currentPage();
    const findings = this.state.doc.reviewFindings.filter((item) => item.pageId === page?.id);

    this.redlineLayer.innerHTML = '';
    findings.forEach((finding) => {
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = `mark ${finding.severity.toLowerCase()}`;
      marker.dataset.findingId = finding.id;
      marker.style.left = `${finding.x}%`;
      marker.style.top = `${finding.y}%`;
      marker.style.width = `${finding.w}%`;
      marker.style.height = `${finding.h}%`;
      marker.innerHTML = `<span>${finding.label}</span>`;
      marker.addEventListener('click', () => this.focusFinding(finding.id));
      this.redlineLayer.appendChild(marker);
    });

    if (this.state.view === 'redline') {
      this.redlineLayer.classList.add('active');
    }
  }

  renderReviewSidebar() {
    if (!this.state.doc) return;
    if (this.state.view !== 'redline') return;

    const page = this.currentPage();
    const findings = this.state.doc.reviewFindings.filter((item) => item.pageId === page?.id);
    if (!findings.length) {
      this.reviewList.innerHTML = '<p class="empty-text">No findings on this page.</p>';
      return;
    }

    this.reviewList.innerHTML = '';
    findings.forEach((finding) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'review-item';
      item.dataset.findingId = finding.id;
      item.innerHTML = `
        <span class="chip ${finding.severity.toLowerCase()}">${finding.severity}</span>
        <strong>${finding.label}</strong>
        <div class="review-meta">
          <small>${finding.sheet}</small>
          <span class="rule-pill">${finding.rule}</span>
        </div>
      `;
      item.addEventListener('click', () => this.focusFinding(finding.id));
      this.reviewList.appendChild(item);
    });
  }

  renderExtractionSummary() {
    if (!this.state.doc) return;
    this.reviewList.innerHTML = '';
    this.state.doc.extractedFields.slice(0, 6).forEach(([label, value]) => {
      const row = document.createElement('article');
      row.className = 'scan-extract-item';
      row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
      this.reviewList.appendChild(row);
    });
  }

  focusFinding(findingId) {
    const marker = this.redlineLayer.querySelector(`[data-finding-id="${findingId}"]`);
    const listItem = this.reviewList.querySelector(`[data-finding-id="${findingId}"]`);

    if (marker) {
      marker.classList.remove('pulse');
      void marker.offsetWidth;
      marker.classList.add('pulse');
      marker.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }

    if (listItem) {
      listItem.classList.remove('active');
      void listItem.offsetWidth;
      listItem.classList.add('active');
    }
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
