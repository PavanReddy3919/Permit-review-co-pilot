export function renderLogConsole(logs) {
  if (!logs.length) {
    return '<div class="log-empty">Awaiting review events...</div>';
  }

  return `
    <div class="log-console">
      ${logs
        .slice()
        .reverse()
        .map(
          (item) => `
          <div class="log-row ${item.category.toLowerCase().replace(/[^a-z]/g, '')}">
            <span class="time">${item.time}</span>
            <span class="tag">[${item.category}]</span>
            <span class="msg">${item.message}</span>
          </div>
        `
        )
        .join('')}
    </div>
  `;
}
