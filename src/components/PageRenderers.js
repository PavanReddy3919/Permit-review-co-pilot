export function renderPageTemplate(doc, page) {
  if (page.imageSrc) return `<img class="page-image" src="${page.imageSrc}" alt="${page.label}" loading="eager" />`;
  if (page.template === 'checklist') return checklistSvg(doc, page);
  if (page.template === 'structural') return structuralSvg(doc, page);
  if (page.template === 'site') return siteSvg(doc, page);
  if (page.template === 'detail') return detailSvg(doc, page);
  return blueprintSvg(doc, page);
}

function frame(doc, page, body, tint = '#edf7ff') {
  const title = `${doc.title} • ${page.label}`;
  return `
    <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${title}">
      <defs>
        <pattern id="grid-${page.id}" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#8eb8e3" stroke-width="0.7" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="1000" height="700" fill="${tint}"/>
      <rect x="18" y="18" width="964" height="664" fill="url(#grid-${page.id})" stroke="#95bce2" stroke-width="2"/>
      ${body}
      <rect x="704" y="608" width="264" height="56" fill="#f8fcff" stroke="#9bc0e4"/>
      <text x="718" y="632" font-size="13" fill="#2f567f" font-family="Space Grotesk">${doc.title}</text>
      <text x="718" y="650" font-size="12" fill="#43698f" font-family="Space Grotesk">${page.label} • ${doc.type}</text>
    </svg>
  `;
}

function blueprintSvg(doc, page) {
  return frame(
    doc,
    page,
    `
      <rect x="74" y="94" width="296" height="220" fill="none" stroke="#2e679d" stroke-width="4"/>
      <rect x="390" y="94" width="302" height="220" fill="none" stroke="#2e679d" stroke-width="4"/>
      <rect x="74" y="336" width="618" height="222" fill="none" stroke="#2e679d" stroke-width="4"/>
      <path d="M222 94v464M390 206h302M552 94v220M74 448h618" stroke="#2e679d" stroke-width="2.8"/>
      <text x="86" y="124" font-size="20" fill="#2c5e93" font-family="Space Grotesk">${page.label}</text>
      <text x="760" y="90" font-size="12" fill="#355f88" font-family="Space Grotesk">Legend</text>
      <path d="M760 110h170M760 150h170M760 190h170M760 230h170M760 270h170M760 310h170" stroke="#3f75a9" stroke-width="2.1"/>
    `,
    '#e8f4ff'
  );
}

function structuralSvg(doc, page) {
  return frame(
    doc,
    page,
    `
      <circle cx="234" cy="214" r="98" fill="none" stroke="#2d679d" stroke-width="4"/>
      <circle cx="234" cy="214" r="58" fill="none" stroke="#2d679d" stroke-width="3"/>
      <rect x="428" y="114" width="252" height="218" fill="none" stroke="#2d679d" stroke-width="4"/>
      <path d="M76 392h634M76 452h634M76 512h634" stroke="#2b5e93" stroke-width="3"/>
      <path d="M470 114v218M554 114v218M428 212h252" stroke="#2b5e93" stroke-width="2.3"/>
      <text x="86" y="124" font-size="20" fill="#2c5e93" font-family="Space Grotesk">${page.label}</text>
      <text x="760" y="90" font-size="12" fill="#355f88" font-family="Space Grotesk">Schedules</text>
      <path d="M760 112h170M760 148h170M760 184h170M760 220h170M760 256h170M760 292h170M760 328h170" stroke="#3f75a9" stroke-width="2.1"/>
    `,
    '#eaf6ff'
  );
}

function checklistSvg(doc, page) {
  const rows = Array.from({ length: 10 })
    .map((_, i) => {
      const y = 124 + i * 46;
      return `<rect x="84" y="${y}" width="22" height="22" fill="none" stroke="#336a9f" stroke-width="2"/><line x1="122" y1="${y + 11}" x2="706" y2="${y + 11}" stroke="#4b79a8" stroke-width="2"/>`;
    })
    .join('');

  return frame(
    doc,
    page,
    `
      <rect x="72" y="94" width="668" height="520" fill="#f8fcff" stroke="#98bee3" stroke-width="2"/>
      ${rows}
      <text x="86" y="124" font-size="20" fill="#2c5e93" font-family="Space Grotesk">${page.label}</text>
      <text x="760" y="90" font-size="12" fill="#355f88" font-family="Space Grotesk">Checks</text>
      <path d="M760 112h170M760 148h170M760 184h170M760 220h170M760 256h170M760 292h170" stroke="#3f75a9" stroke-width="2.1"/>
    `,
    '#edf7ff'
  );
}

function siteSvg(doc, page) {
  return frame(
    doc,
    page,
    `
      <path d="M94 522L198 296L418 220L620 286L728 490L542 588L278 596Z" fill="none" stroke="#2d679d" stroke-width="4"/>
      <path d="M152 528L244 362L410 306L582 344L664 502L520 560L308 568Z" fill="none" stroke="#2d679d" stroke-width="3"/>
      <path d="M82 142h620M82 184h620M82 226h620" stroke="#7caad7" stroke-width="2"/>
      <text x="86" y="124" font-size="20" fill="#2c5e93" font-family="Space Grotesk">${page.label}</text>
      <text x="760" y="90" font-size="12" fill="#355f88" font-family="Space Grotesk">Parcel Notes</text>
      <path d="M760 112h170M760 148h170M760 184h170M760 220h170M760 256h170" stroke="#3f75a9" stroke-width="2.1"/>
    `,
    '#e6f3ff'
  );
}

function detailSvg(doc, page) {
  return frame(
    doc,
    page,
    `
      <rect x="90" y="124" width="248" height="188" fill="none" stroke="#2d679d" stroke-width="4"/>
      <circle cx="546" cy="220" r="102" fill="none" stroke="#2d679d" stroke-width="4"/>
      <path d="M120 370h550M120 430h550M120 490h550M120 550h550" stroke="#2d679d" stroke-width="3"/>
      <text x="86" y="124" font-size="20" fill="#2c5e93" font-family="Space Grotesk">${page.label}</text>
      <text x="760" y="90" font-size="12" fill="#355f88" font-family="Space Grotesk">Detail Notes</text>
      <path d="M760 112h170M760 148h170M760 184h170M760 220h170M760 256h170" stroke="#3f75a9" stroke-width="2.1"/>
    `,
    '#e9f6ff'
  );
}
