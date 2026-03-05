export function renderRedlineOverlay(findings, activeFindingId) {
  return `
    <div class="redline-layer active">
      ${findings
        .map((item) => {
          const isActive = item.id === activeFindingId ? 'pulse active' : '';
          const classNames = `mark ${item.severity.toLowerCase()} ${isActive}`.trim();
          const shapeClass = item.shape === 'circle' ? 'shape-circle' : 'shape-rect';
          return `<button type="button" class="${classNames} ${shapeClass}" data-finding-id="${item.id}" style="left:${item.x}%;top:${item.y}%;width:${item.w}%;height:${item.h}%"><span>${item.label}</span></button>`;
        })
        .join('')}
    </div>
  `;
}
