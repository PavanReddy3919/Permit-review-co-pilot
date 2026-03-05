import { renderLogConsole } from '../components/LogConsole.js';

export function renderReviewingPage(state) {
  const done = state.review.progress >= 100;

  return `
    <section class="stage stage-review active">
      <div class="review-head">
        <div>
          <p class="eyebrow">Stage 3 • Review</p>
          <h2>Reviewing Package</h2>
          <p class="lead">Rule matching, cross-checks, and redline generation in progress.</p>
        </div>
        <div class="status-ring ${done ? 'done' : ''}">
          <span>${Math.round(state.review.progress)}%</span>
        </div>
      </div>

      <div class="progress-wrap wide">
        <div class="progress-track"><div class="progress-fill" style="width:${state.review.progress}%"></div></div>
      </div>

      <div class="review-layout">
        <section class="card review-console">
          <p class="panel-title">Detailed Console</p>
          ${renderLogConsole(state.review.logs)}
        </section>

        <aside class="card rules-widget">
          <p class="panel-title">Rules Book</p>
          <p class="rule-current">${state.review.currentRule}</p>
          <ul class="mini-list">
            ${state.queue
              .map(
                (row) =>
                  `<li><span>${row.title}</span><span class="queue-chip ${row.state.toLowerCase()}">${row.state}</span></li>`
              )
              .join('')}
          </ul>
          ${done ? '<button class="btn btn-primary" data-action="go-findings">View Reviewed Comments</button>' : ''}
        </aside>
      </div>
    </section>
  `;
}
