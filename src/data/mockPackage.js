const SECTION_LIBRARY = [
  { title: 'Architectural Plans', type: 'Architectural' },
  { title: 'Structural Set', type: 'Structural' },
  { title: 'MEP Set', type: 'MEP' },
  { title: 'Title 24 Compliance', type: 'Energy' },
  { title: 'Fire Checklist', type: 'Fire' },
  { title: 'Zoning Notes', type: 'Zoning' },
  { title: 'ADA Checklist', type: 'ADA' },
  { title: 'Site/Civil Plans', type: 'Site' }
];

const SINGLE_PACKAGE_SPLIT = [
  { title: 'Architectural Plans', type: 'Architectural', pages: [1, 2, 3] },
  { title: 'Structural Set', type: 'Structural', pages: [4, 5] },
  { title: 'MEP Set', type: 'MEP', pages: [6, 7] },
  { title: 'Title 24 Compliance', type: 'Energy', pages: [8, 9] },
  { title: 'Fire Checklist', type: 'Fire', pages: [10, 11] },
  { title: 'Zoning Notes', type: 'Zoning', pages: [12, 13] },
  { title: 'ADA Checklist', type: 'ADA', pages: [14, 15, 16] },
  { title: 'Site/Civil Plans', type: 'Site', pages: [17, 18, 19] }
];

const PDF_PAGE_POOL = Array.from({ length: 19 }, (_, idx) => idx + 1);

const TEMPLATE_BY_TYPE = {
  Architectural: ['blueprint', 'detail', 'blueprint'],
  Structural: ['structural', 'structural', 'detail'],
  MEP: ['blueprint', 'detail', 'checklist'],
  Energy: ['checklist', 'checklist', 'detail'],
  Fire: ['checklist', 'blueprint', 'checklist'],
  Zoning: ['checklist', 'site', 'checklist'],
  ADA: ['checklist', 'detail', 'checklist'],
  Site: ['site', 'site', 'detail']
};

const RULE_POOL = [
  'IBC 1005.3',
  'ADA 404.2.3',
  'CRC R337.6.1',
  'Zoning §12.4',
  'CEC 440.14',
  'Fire Code 903.3',
  'Title 24 Part 6',
  'NFPA 13 §8.6',
  'CBC 11B-404.2.4'
];

const FINDING_LABELS = [
  'Exit width does not meet code minimum',
  'Missing ADA clearance at doorway',
  'Title 24 compliance form incomplete',
  'Setback dimension inconsistent with zoning',
  'Electrical disconnect note missing',
  'Fire sprinkler criteria requires revision',
  'Occupancy load summary mismatch'
];

const EXTRACTED_FIELD_POOL = {
  Architectural: ['Project Address', 'Sheet Index', 'Occupancy Type', 'Floor Area'],
  Structural: ['Seismic Category', 'Lateral System', 'Foundation Type', 'Design Standard'],
  MEP: ['Service Size', 'Panel Count', 'Mechanical Zones', 'Fixture Schedule'],
  Energy: ['Climate Zone', 'Envelope Method', 'Lighting Method', 'Mandatory Forms'],
  Fire: ['Occupant Load', 'Sprinkler System', 'Alarm Type', 'Egress Paths'],
  Zoning: ['Zone District', 'Setback Table', 'Height Limit', 'Parking Ratio'],
  ADA: ['Accessible Entrances', 'Door Widths', 'Ramp Slopes', 'Restroom Clearances'],
  Site: ['Parcel ID', 'Lot Area', 'Drainage Path', 'Fire Access Lane']
};

export function splitUploadedFiles(fileNames) {
  const cleaned = (fileNames || []).map((f) => f.trim()).filter(Boolean);
  if (!cleaned.length) return [];

  const docs = [];
  const pageCursor = { index: 0 };

  if (cleaned.length === 1) {
    const name = cleaned[0];
    SINGLE_PACKAGE_SPLIT.forEach((section, idx) => {
      docs.push(buildDoc(section.title, section.type, `${slug(section.title)}-${idx + 1}`, name, idx, section.pages));
    });
    return docs;
  }

  cleaned.forEach((name, idx) => {
    const looksLikePackage = /package|set|combined|full/i.test(name);

    if (looksLikePackage) {
      SECTION_LIBRARY.slice(0, 3).forEach((section, jdx) => {
        const count = 2 + ((idx + jdx) % 2);
        const pages = takePagesFromPool(count, pageCursor);
        docs.push(
          buildDoc(`${baseName(name)} · ${section.title}`, section.type, `${slug(baseName(name))}-${jdx + 1}`, name, idx + jdx, pages)
        );
      });
      return;
    }

    const type = inferTypeFromName(name);
    const pages = takePagesFromPool(2 + (idx % 2), pageCursor);
    docs.push(buildDoc(baseName(name), type, `${slug(baseName(name))}-${idx + 1}`, name, idx, pages));
  });

  return docs;
}

export function makeInitialQueue(docs) {
  return docs.map((doc) => ({ docId: doc.id, title: doc.title, state: 'Pending' }));
}

export function severityWeight(level) {
  if (level === 'Required') return 3;
  if (level === 'Warning') return 2;
  return 1;
}

function buildDoc(title, type, idSeed, sourceFile, seedIndex, pageNumbers) {
  const pageTemplates = TEMPLATE_BY_TYPE[type] || TEMPLATE_BY_TYPE.Architectural;
  const pages = pageNumbers.map((pageNumber, idx) => ({
    id: `${idSeed}-p${idx + 1}`,
    label: `${sheetPrefix(type)}${String(pageNumber).padStart(2, '0')}`,
    template: pageTemplates[idx % pageTemplates.length],
    imageSrc: toPageImage(pageNumber),
    sourcePage: pageNumber
  }));

  const extractedFields = (EXTRACTED_FIELD_POOL[type] || EXTRACTED_FIELD_POOL.Architectural)
    .slice(0, 4)
    .map((field, idx) => [field, fakeValue(field, sourceFile, idx, seedIndex, pageNumbers)]);

  const reviewFindings = pages.flatMap((page, pIdx) => makeFindingsForPage(page, idSeed, pIdx));

  return {
    id: idSeed,
    title,
    sourceFile,
    type,
    pages,
    extractedFields,
    reviewFindings
  };
}

function takePagesFromPool(count, cursor) {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    rows.push(PDF_PAGE_POOL[cursor.index % PDF_PAGE_POOL.length]);
    cursor.index += 1;
  }
  return rows;
}

function toPageImage(pageNumber) {
  return `assets/pdf-snaps/page-${String(pageNumber).padStart(2, '0')}.png`;
}

function makeFindingsForPage(page, idSeed, pageIndex) {
  const h = hash(`${idSeed}-${page.id}`);
  const count = 1 + (h % 2);
  const rows = [];

  for (let i = 0; i < count; i += 1) {
    const severity = ['Info', 'Warning', 'Required'][(h + i) % 3];
    rows.push({
      id: `${page.id}-f${i + 1}`,
      pageId: page.id,
      severity,
      sheet: `Sheet ${page.label}`,
      rule: RULE_POOL[(h + i) % RULE_POOL.length],
      label: FINDING_LABELS[(h + pageIndex + i) % FINDING_LABELS.length],
      text: `Auto-reviewed note for source PDF page ${page.sourcePage}: verify compliance details and update markup block as needed.`,
      shape: i % 2 === 0 ? 'rect' : 'circle',
      x: 12 + ((h + i * 13) % 66),
      y: 16 + ((h + i * 9) % 62),
      w: 15 + ((h + i * 7) % 20),
      h: 10 + ((h + i * 11) % 18)
    });
  }

  return rows;
}

function inferTypeFromName(name) {
  const n = name.toLowerCase();
  if (n.includes('struct')) return 'Structural';
  if (n.includes('fire')) return 'Fire';
  if (n.includes('zoning')) return 'Zoning';
  if (n.includes('ada')) return 'ADA';
  if (n.includes('title')) return 'Energy';
  if (n.includes('site') || n.includes('civil')) return 'Site';
  if (n.includes('mep') || n.includes('mechanical') || n.includes('electrical') || n.includes('plumb')) return 'MEP';
  return 'Architectural';
}

function sheetPrefix(type) {
  if (type === 'Structural') return 'S';
  if (type === 'MEP') return 'M';
  if (type === 'Energy') return 'T24-';
  if (type === 'Fire') return 'F';
  if (type === 'Zoning') return 'Z';
  if (type === 'ADA') return 'AD-';
  if (type === 'Site') return 'C';
  return 'A';
}

function baseName(fileName) {
  return fileName.replace(/\.pdf$/i, '');
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function hash(text) {
  let out = 0;
  for (let i = 0; i < text.length; i += 1) {
    out = (out << 5) - out + text.charCodeAt(i);
    out |= 0;
  }
  return Math.abs(out);
}

function fakeValue(field, sourceFile, idx, seed, pageNumbers) {
  if (field === 'Project Address') return '640 Circlewood Dr, Paradise, CA';
  if (field === 'Sheet Index') return pageNumbers.map((n) => `P${String(n).padStart(2, '0')}`).join(', ');
  if (field === 'Occupancy Type') return 'R-3';
  if (field === 'Floor Area') return `${9200 + seed * 120} sq ft`;
  if (field === 'Parcel ID') return 'APN 052-380-032';
  if (field === 'Design Standard') return 'CBC 2022 / CRC 2022';
  if (field === 'Service Size') return '200A';
  if (field === 'Climate Zone') return 'CZ-12';
  return `${field} from ${baseName(sourceFile).slice(0, 20)} (pg ${pageNumbers[idx % pageNumbers.length]})`;
}
