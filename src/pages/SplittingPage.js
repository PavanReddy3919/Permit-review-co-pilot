export function renderSplittingPage(state) {
  const visibleCards = Math.max(0, Math.floor((state.splitProgress / 100) * state.docs.length));

  return `
    <section class="stage stage-split active">
      <div class="split-wrap">
        <p class="eyebrow">Stage 1 • Split</p>
        <h2>Splitting package into sections...</h2>
        <p class="lead">Simulation only. No real PDF processing occurs.</p>

        <div class="split-source card">
          <span class="chip">UploadedPackage.pdf</span>
          <div class="split-beam"></div>
        </div>

        <div class="split-grid">
          ${state.docs
            .map((doc, idx) => {
              const show = idx < visibleCards;
              return `
                <article class="split-card ${show ? 'show' : ''}">
                  <p>${doc.title}</p>
                  <small>${doc.pages.length} pages</small>
                </article>
              `;
            })
            .join('')}
        </div>

        <div class="progress-wrap wide">
          <div class="progress-track"><div class="progress-fill" style="width:${state.splitProgress}%"></div></div>
          <p class="progress-text">${Math.round(state.splitProgress)}%</p>
        </div>
      </div>
    </section>
  `;
}
