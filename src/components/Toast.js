export function renderToast(toast) {
  if (!toast) return '';
  return `<div class="toast ${toast.tone}" data-toast-id="${toast.id}">${toast.message}</div>`;
}
