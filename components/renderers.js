import { PDF_PAGE_LIBRARY } from '../data/pdf-derived.js';

function gridPattern(id, stroke = '#9bc3ed', opacity = '0.28') {
  return `
    <defs>
      <pattern id="${id}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${stroke}" stroke-width="0.7" opacity="${opacity}"/>
      </pattern>
    </defs>
  `;
}

export function renderPageSvg(doc, page, index) {
  const key = `${doc.id}-${page.id}-${index}`;
  if (page.template === 'pdf-derived' && page.sourcePage) {
    return pdfDerivedPage(doc, page, key);
  }
  if (page.template === 'checklist') {
    return checklistPage(doc, page, key);
  }
  if (page.template === 'structural') {
    return structuralPage(doc, page, key);
  }
  if (page.template === 'site') {
    return sitePage(doc, page, key);
  }
  if (page.template === 'detail') {
    return detailPage(doc, page, key);
  }
  return blueprintPage(doc, page, key);
}

function pdfDerivedPage(doc, page, key) {
  const source = PDF_PAGE_LIBRARY[page.sourcePage];
  if (!source) {
    return frame(`${doc.name} • ${page.label}`, '<text x="90" y="160" fill="#2c5e93">Missing source page</text>', key);
  }

  const lines = source.lines
    .map((l) => `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" stroke="#2a689f" stroke-width="1.2" opacity="0.78"/>`)
    .join('');
  const rects = source.rects
    .map((r) => `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" fill="none" stroke="#2f6fa7" stroke-width="1.1" opacity="0.72"/>`)
    .join('');
  const curves = source.curves
    .map((path) => `<path d="${path}" fill="none" stroke="#3a7db8" stroke-width="1" opacity="0.62"/>`)
    .join('');
  const words = source.words
    .slice(0, 130)
    .map(
      (w) =>
        `<text x="${w.x}" y="${Math.min(690, w.y + 6)}" font-size="${w.s}" fill="#29517c" opacity="0.72" font-family="Space Grotesk">${escapeXml(
          w.t
        )}</text>`
    )
    .join('');

  const body = `
    <rect x="34" y="34" width="932" height="604" fill="#ebf7ff" stroke="#9ec0e1" stroke-width="1.7"/>
    ${lines}
    ${rects}
    ${curves}
    ${words}
    <text x="56" y="62" font-size="18" fill="#2b5f93" font-family="Space Grotesk">${page.label}</text>
    <text x="56" y="86" font-size="12" fill="#3f6f9f" font-family="Space Grotesk">Derived from uploaded plan set • source page ${source.pageNumber}</text>
  `;
  return frame(`${doc.name} • ${page.label}`, body, key, '#eaf6ff');
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function frame(title, body, key, tint = '#e9f6ff') {
  return `
    <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${title}">
      ${gridPattern(`grid-${key}`)}
      <rect x="0" y="0" width="1000" height="700" fill="${tint}"/>
      <rect x="18" y="18" width="964" height="664" fill="url(#grid-${key})" stroke="#a6c9ea" stroke-width="2"/>
      ${body}
      <rect x="710" y="618" width="255" height="46" fill="#f8fcff" stroke="#9ec0e1"/>
      <text x="724" y="646" font-size="15" fill="#2d527f" font-family="Space Grotesk">${title}</text>
    </svg>
  `;
}

function blueprintPage(doc, page, key) {
  const body = `
    <rect x="70" y="90" width="300" height="230" fill="none" stroke="#2c6ca7" stroke-width="4"/>
    <rect x="390" y="90" width="310" height="230" fill="none" stroke="#2c6ca7" stroke-width="4"/>
    <rect x="70" y="340" width="630" height="220" fill="none" stroke="#2c6ca7" stroke-width="4"/>
    <path d="M220 90v470M390 205h310M560 90v230M70 450h630" stroke="#2c6ca7" stroke-width="3"/>
    <path d="M760 120h170M760 170h170M760 220h170M760 270h170M760 320h170" stroke="#336a9e" stroke-width="2.5"/>
    <text x="88" y="124" font-size="20" fill="#2c5e93" font-family="Space Grotesk">${page.label}</text>
    <text x="766" y="103" font-size="13" fill="#355f88" font-family="Space Grotesk">Project: ${doc.type}</text>
  `;
  return frame(`${doc.name} • ${page.label}`, body, key);
}

function structuralPage(doc, page, key) {
  const body = `
    <circle cx="220" cy="220" r="95" fill="none" stroke="#2e679c" stroke-width="4"/>
    <circle cx="220" cy="220" r="58" fill="none" stroke="#2e679c" stroke-width="3"/>
    <rect x="420" y="110" width="250" height="220" fill="none" stroke="#2e679c" stroke-width="4"/>
    <path d="M70 390h640M70 450h640M70 510h640" stroke="#2a5b90" stroke-width="3"/>
    <path d="M460 110v220M560 110v220M420 210h250" stroke="#2a5b90" stroke-width="2.5"/>
    <path d="M760 120h170M760 170h170M760 220h170M760 270h170M760 320h170M760 370h170" stroke="#336a9e" stroke-width="2.5"/>
    <text x="88" y="124" font-size="20" fill="#2c5e93" font-family="Space Grotesk">${page.label}</text>
    <text x="766" y="103" font-size="13" fill="#355f88" font-family="Space Grotesk">Structural Plan</text>
  `;
  return frame(`${doc.name} • ${page.label}`, body, key, '#e7f3ff');
}

function checklistPage(doc, page, key) {
  const rows = Array.from({ length: 9 })
    .map((_, i) => {
      const y = 130 + i * 50;
      return `
        <rect x="80" y="${y}" width="24" height="24" fill="none" stroke="#31689d" stroke-width="2"/>
        <line x1="120" y1="${y + 12}" x2="700" y2="${y + 12}" stroke="#4e79a5" stroke-width="2"/>
      `;
    })
    .join('');

  const body = `
    <rect x="70" y="90" width="660" height="520" fill="#f6fbff" stroke="#99bee3" stroke-width="2"/>
    ${rows}
    <path d="M760 120h170M760 170h170M760 220h170M760 270h170M760 320h170M760 370h170" stroke="#336a9e" stroke-width="2.5"/>
    <text x="88" y="124" font-size="20" fill="#2c5e93" font-family="Space Grotesk">${page.label}</text>
    <text x="766" y="103" font-size="13" fill="#355f88" font-family="Space Grotesk">Code Checklist</text>
  `;
  return frame(`${doc.name} • ${page.label}`, body, key, '#edf7ff');
}

function sitePage(doc, page, key) {
  const body = `
    <path d="M90 520L190 300L420 220L620 290L730 490L540 590L280 600Z" fill="none" stroke="#2d679d" stroke-width="4"/>
    <path d="M150 530L240 360L410 300L580 340L660 500L520 560L310 570Z" fill="none" stroke="#2d679d" stroke-width="3"/>
    <path d="M760 120h170M760 170h170M760 220h170M760 270h170M760 320h170M760 370h170" stroke="#336a9e" stroke-width="2.5"/>
    <path d="M80 140h620M80 180h620M80 220h620" stroke="#7caad7" stroke-width="2"/>
    <text x="88" y="124" font-size="20" fill="#2c5e93" font-family="Space Grotesk">${page.label}</text>
    <text x="766" y="103" font-size="13" fill="#355f88" font-family="Space Grotesk">Site Plan</text>
  `;
  return frame(`${doc.name} • ${page.label}`, body, key, '#e5f2ff');
}

function detailPage(doc, page, key) {
  const body = `
    <rect x="90" y="120" width="250" height="190" fill="none" stroke="#2d679d" stroke-width="4"/>
    <circle cx="540" cy="220" r="102" fill="none" stroke="#2d679d" stroke-width="4"/>
    <path d="M120 370h550M120 430h550M120 490h550M120 550h550" stroke="#2d679d" stroke-width="3"/>
    <path d="M760 120h170M760 170h170M760 220h170M760 270h170M760 320h170" stroke="#336a9e" stroke-width="2.5"/>
    <text x="88" y="124" font-size="20" fill="#2c5e93" font-family="Space Grotesk">${page.label}</text>
    <text x="766" y="103" font-size="13" fill="#355f88" font-family="Space Grotesk">Detail Sheet</text>
  `;
  return frame(`${doc.name} • ${page.label}`, body, key, '#eaf6ff');
}
