import { PDF_COMMENTS } from './pdf-comments.js';

export const STATUS_STEPS = [
  'Parsing uploaded package',
  'Extracting sheet index and references',
  'Matching zoning constraints (Zoning §12.4)',
  'Checking fire egress and occupancy rules',
  'Cross-referencing Title 24 requirements',
  'Validating ADA accessibility paths',
  'Applying markup recommendations',
  'Generating correction summary package'
];

export const SPEEDS = {
  normal: {
    intakeFlight: 300,
    scanDuration: 1250,
    reviewBase: 2800,
    reviewPerFile: 180,
    statusInterval: 650,
    outputInterval: 170
  },
  fast: {
    intakeFlight: 180,
    scanDuration: 760,
    reviewBase: 1600,
    reviewPerFile: 100,
    statusInterval: 350,
    outputInterval: 100
  }
};

const img = (n) => `assets/pdf-snaps/page-${String(n).padStart(2, '0')}.png`;

const pdfCommentByPage = (pageNumber, fallback) => {
  const found = PDF_COMMENTS.find((item) => item.pageNumber === pageNumber && item.contents);
  return found?.contents || fallback;
};

export const DOCUMENTS = [
  {
    id: 'bp-main',
    name: 'Blueprint_Main_Building.pdf',
    type: 'Blueprint',
    size: '8.2 MB',
    pages: [
      { id: 'a10', label: 'A1.0', template: 'image', imageSrc: img(1), scanType: 'blueprint' },
      { id: 'a21', label: 'A2.1', template: 'image', imageSrc: img(3), scanType: 'blueprint' },
      { id: 'a40', label: 'A4.0', template: 'image', imageSrc: img(4), scanType: 'detail' }
    ],
    extractedFields: [
      ['Project Address', '640 Circlewood Dr, Paradise, CA 95969'],
      ['APN', '052-380-032'],
      ['Sheet IDs', 'A1.0, A2.1, A4.0'],
      ['Plan Set Source', '11-05-24 submittal'],
      ['Review Basis', 'CBC/CRC 2022']
    ],
    reviewFindings: [
      {
        id: 'bp-f1',
        pageId: 'a21',
        severity: 'Required',
        sheet: 'Sheet A2.1',
        rule: 'Zoning §12.4',
        label: 'Setback dimension inconsistent with zoning',
        text: 'Rear setback is shown as 8 ft, but 10 ft minimum is required.',
        x: 62,
        y: 44,
        w: 24,
        h: 18
      },
      {
        id: 'bp-f2',
        pageId: 'a40',
        severity: 'Warning',
        sheet: 'Sheet A4.0',
        rule: 'ADA 404.2.4',
        label: 'Missing ADA clearance at doorway',
        text: 'Clear floor space at doorway D-14 is not dimensioned.',
        x: 29,
        y: 60,
        w: 20,
        h: 16
      }
    ]
  },
  {
    id: 'struct',
    name: 'Structural_Set_S1-S9.pdf',
    type: 'Structural',
    size: '12.6 MB',
    pages: [
      { id: 's10', label: 'S1.0', template: 'image', imageSrc: img(15), scanType: 'structural' },
      { id: 's23', label: 'S2.3', template: 'image', imageSrc: img(16), scanType: 'structural' },
      { id: 's71', label: 'S7.1', template: 'image', imageSrc: img(17), scanType: 'detail' }
    ],
    extractedFields: [
      ['Sheet IDs', 'S1.0, S2.3, S7.1'],
      ['Structural Material', 'DF #2 framing'],
      ['Foundation Notes', 'Spread footing references'],
      ['Design Standard', 'IBC 2021 / ASCE 7-16'],
      ['Plan Set Source', '11-05-24 submittal']
    ],
    reviewFindings: [
      {
        id: 'st-f1',
        pageId: 's23',
        severity: 'Required',
        sheet: 'Sheet S2.3',
        rule: 'IBC 1604.4',
        label: 'Load path note incomplete',
        text: 'Lateral load transfer note does not reference collector detail.',
        x: 54,
        y: 37,
        w: 31,
        h: 17
      },
      {
        id: 'st-f2',
        pageId: 's71',
        severity: 'Warning',
        sheet: 'Sheet S7.1',
        rule: 'ACI 318 25.4.2',
        label: 'Rebar hook callout missing',
        text: 'Beam B4 detail lacks hook development annotation.',
        x: 18,
        y: 58,
        w: 22,
        h: 15
      }
    ]
  },
  {
    id: 'elec',
    name: 'Electrical_Set_E1-E7.pdf',
    type: 'Electrical',
    size: '6.4 MB',
    pages: [
      { id: 'e10', label: 'E1.0', template: 'image', imageSrc: img(10), scanType: 'blueprint' },
      { id: 'e12', label: 'E1.2', template: 'image', imageSrc: img(11), scanType: 'detail' },
      { id: 'e21', label: 'E2.1', template: 'image', imageSrc: img(12), scanType: 'blueprint' }
    ],
    extractedFields: [
      ['Service Voltage', '120/277V + equipment legend'],
      ['Switch Symbols', 'Single/3-way/dimmer present'],
      ['Reference Code', 'CEC 440.14 noted in comments'],
      ['Sheet IDs', 'E1.0, E1.2, E2.1']
    ],
    reviewFindings: [
      {
        id: 'el-f1',
        pageId: 'e10',
        severity: 'Required',
        sheet: 'Sheet E1.0',
        rule: 'CEC 440.14',
        label: 'Disconnect location note from plan check',
        text: pdfCommentByPage(
          10,
          'The means of disconnect at the condenser unit must be readily accessible and within sight of the unit.'
        ),
        x: 36,
        y: 11,
        w: 10,
        h: 4
      },
      {
        id: 'el-f2',
        pageId: 'e12',
        severity: 'Warning',
        sheet: 'Sheet E1.2',
        rule: 'NEC 110.26',
        label: 'Panel clearance dimension missing',
        text: 'Minimum working clearance in front of panel LP-2 is unlabeled.',
        x: 58,
        y: 63,
        w: 25,
        h: 14
      }
    ]
  },
  {
    id: 'plumb',
    name: 'Plumbing_Set_P1-P5.pdf',
    type: 'Plumbing',
    size: '5.1 MB',
    pages: [
      { id: 'p10', label: 'P1.0', template: 'image', imageSrc: img(6), scanType: 'blueprint' },
      { id: 'p31', label: 'P3.1', template: 'image', imageSrc: img(7), scanType: 'detail' }
    ],
    extractedFields: [
      ['Fixture Schedule', 'Window/plumbing schedules detected'],
      ['Insulation Notes', 'R-19, R-38 references present'],
      ['Sheet IDs', 'P1.0, P3.1'],
      ['Code Set', 'CPC 2022']
    ],
    reviewFindings: [
      {
        id: 'pl-f1',
        pageId: 'p31',
        severity: 'Required',
        sheet: 'Sheet P3.1',
        rule: 'CPC 603.4',
        label: 'Backflow protection note missing',
        text: 'Riser note does not identify protection class for branch to fixture bank.',
        x: 36,
        y: 56,
        w: 22,
        h: 18
      }
    ]
  },
  {
    id: 'site',
    name: 'Site_Plan_C1-C3.pdf',
    type: 'Site Plan',
    size: '3.8 MB',
    pages: [
      { id: 'c10', label: 'C1.0', template: 'image', imageSrc: img(5), scanType: 'site' },
      { id: 'c20', label: 'C2.0', template: 'image', imageSrc: img(15), scanType: 'site' }
    ],
    extractedFields: [
      ['Property Line Geometry', 'Detected on page 5'],
      ['Driveway Notes', 'Driveway and lot dimensions extracted'],
      ['Stormwater Notes', 'Flatwork and footing legend references'],
      ['Sheet IDs', 'C1.0, C2.0']
    ],
    reviewFindings: [
      {
        id: 'si-f1',
        pageId: 'c10',
        severity: 'Warning',
        sheet: 'Sheet C1.0',
        rule: 'Fire Code 503.2.1',
        label: 'Fire lane width callout missing',
        text: 'Access lane is drawn but clear width dimension is absent.',
        x: 21,
        y: 66,
        w: 26,
        h: 14
      }
    ]
  },
  {
    id: 'title24',
    name: 'Title24_Energy_Compliance.pdf',
    type: 'Title 24',
    size: '2.7 MB',
    pages: [
      { id: 't241', label: 'T24.1', template: 'image', imageSrc: img(8), scanType: 'checklist' },
      { id: 't242', label: 'T24.2', template: 'image', imageSrc: img(9), scanType: 'checklist' }
    ],
    extractedFields: [
      ['Ventilation Notes', 'Wildfire vent language detected'],
      ['Form Sections', 'Compliance table blocks detected'],
      ['Climate Indicators', 'Energy headings and schedule text found'],
      ['Sheet IDs', 'T24.1, T24.2']
    ],
    reviewFindings: [
      {
        id: 't24-f1',
        pageId: 't241',
        severity: 'Required',
        sheet: 'Sheet T24.1',
        rule: 'CRC R337.6.1',
        label: 'Ventilation opening note flagged from plan check',
        text: pdfCommentByPage(
          8,
          'Ventilation openings for enclosed attics and eaves must comply with ember-resistant requirements.'
        ),
        x: 72,
        y: 46,
        w: 12,
        h: 8
      }
    ]
  },
  {
    id: 'fire',
    name: 'Fire_Code_Checklist.pdf',
    type: 'Fire Code',
    size: '1.9 MB',
    pages: [
      { id: 'f10', label: 'F1.0', template: 'image', imageSrc: img(14), scanType: 'checklist' },
      { id: 'f20', label: 'F2.0', template: 'image', imageSrc: img(18), scanType: 'checklist' }
    ],
    extractedFields: [
      ['Plan Check Marks', 'Multiple plan-check revision stamps detected'],
      ['Owner Information', 'Header blocks recognized'],
      ['Fire Code Checklist', 'Cross-sheet references detected'],
      ['Sheet IDs', 'F1.0, F2.0']
    ],
    reviewFindings: [
      {
        id: 'fi-f1',
        pageId: 'f10',
        severity: 'Required',
        sheet: 'Sheet F1.0',
        rule: 'Fire Code 903.3',
        label: 'Sprinkler criteria not fully defined',
        text: 'Hydraulic design criteria field is blank in checklist section 18.',
        x: 29,
        y: 49,
        w: 42,
        h: 14
      }
    ]
  },
  {
    id: 'zoning',
    name: 'Zoning_Rules_Submittal.pdf',
    type: 'Zoning',
    size: '2.2 MB',
    pages: [
      { id: 'z10', label: 'Z1.0', template: 'image', imageSrc: img(2), scanType: 'checklist' },
      { id: 'z20', label: 'Z2.0', template: 'image', imageSrc: img(5), scanType: 'checklist' }
    ],
    extractedFields: [
      ['Building Code Requirements', 'Page 2 code requirement matrix found'],
      ['Property Dimensions', 'Boundary geometry detected from site page'],
      ['Zoning Context', 'Plan-check references in title blocks'],
      ['Sheet IDs', 'Z1.0, Z2.0']
    ],
    reviewFindings: [
      {
        id: 'zo-f1',
        pageId: 'z20',
        severity: 'Required',
        sheet: 'Sheet Z2.0',
        rule: 'Zoning §12.4',
        label: 'Setback table mismatch',
        text: 'Submitted table lists rear setback 8 ft; required is 10 ft.',
        x: 41,
        y: 36,
        w: 35,
        h: 16
      }
    ]
  },
  {
    id: 'ada',
    name: 'ADA_Accessibility_Checklist.pdf',
    type: 'ADA',
    size: '1.6 MB',
    pages: [
      { id: 'ad10', label: 'AD1.0', template: 'image', imageSrc: img(2), scanType: 'checklist' },
      { id: 'ad20', label: 'AD2.0', template: 'image', imageSrc: img(7), scanType: 'checklist' }
    ],
    extractedFields: [
      ['Accessibility Notes', 'Handrail and fixture rule text detected'],
      ['Door/Window Schedule', 'Dimensional schedule extracted'],
      ['Review Scope', 'Plan-check markups present'],
      ['Sheet IDs', 'AD1.0, AD2.0']
    ],
    reviewFindings: [
      {
        id: 'ad-f1',
        pageId: 'ad20',
        severity: 'Required',
        sheet: 'Sheet AD2.0',
        rule: 'ADA 404.2.3',
        label: 'Clear width does not meet minimum',
        text: 'Doorway at north lobby shows 30-inch clear width.',
        x: 36,
        y: 55,
        w: 28,
        h: 17
      }
    ]
  },
  {
    id: 'drain',
    name: 'Stormwater_Drainage_Report.pdf',
    type: 'Civil',
    size: '4.4 MB',
    pages: [
      { id: 'd10', label: 'D1.0', template: 'image', imageSrc: img(19), scanType: 'site' },
      { id: 'd20', label: 'D2.0', template: 'image', imageSrc: img(15), scanType: 'checklist' }
    ],
    extractedFields: [
      ['Drainage Notes', 'Concrete flatwork and vapor barrier notes found'],
      ['Plan Revision', '11-5-24 plan-check date detected'],
      ['Civil Legend', 'Footing and slab legend extracted'],
      ['Sheet IDs', 'D1.0, D2.0']
    ],
    reviewFindings: [
      {
        id: 'dr-f1',
        pageId: 'd20',
        severity: 'Warning',
        sheet: 'Sheet D2.0',
        rule: 'Stormwater Manual 4.3',
        label: 'Outfall assumption needs note',
        text: 'Tailwater condition is assumed but not documented in calc notes.',
        x: 20,
        y: 33,
        w: 34,
        h: 16
      }
    ]
  }
];

export const SCAN_CALLOUTS = {
  blueprint: ['Extracting sheet title...', 'Detecting dimensions...', 'Reading legend...'],
  structural: ['Parsing load notes...', 'Recognizing framing grid...', 'Indexing detail tags...'],
  detail: ['Matching callout bubbles...', 'Detecting elevation keys...', 'Capturing section refs...'],
  checklist: ['Reading checkbox matrix...', 'Extracting rule citations...', 'Capturing required fields...'],
  site: ['Tracing lot boundaries...', 'Detecting setback lines...', 'Scanning civil annotations...']
};
