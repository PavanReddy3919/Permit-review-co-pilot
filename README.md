# Smart Permit Review AI (Multi-Stage Demo)

Front-end-only simulation of a permit-review copilot with a 5-stage state machine:
- `IMPORT`
- `SPLIT`
- `SCAN`
- `REVIEW`
- `FINDINGS`

No backend and no real PDF parsing/review logic are used.

## Run locally

```bash
cd /Users/pavanmreddy/Downloads/hassan
python3 -m http.server 5173
```

Open: `http://localhost:5173`

## Architecture

- State machine:
  - `/Users/pavanmreddy/Downloads/hassan/src/state/useFlowMachine.js`
- Main app orchestration:
  - `/Users/pavanmreddy/Downloads/hassan/src/app.js`
- Mock split logic and doc/finding data model:
  - `/Users/pavanmreddy/Downloads/hassan/src/data/mockPackage.js`
- Realistic source pages used by split docs:
  - `/Users/pavanmreddy/Downloads/hassan/assets/pdf-snaps/page-01.png` ... `page-19.png`
- Stage pages:
  - `/Users/pavanmreddy/Downloads/hassan/src/pages/ImportPage.js`
  - `/Users/pavanmreddy/Downloads/hassan/src/pages/SplittingPage.js`
  - `/Users/pavanmreddy/Downloads/hassan/src/pages/ScanningPage.js`
  - `/Users/pavanmreddy/Downloads/hassan/src/pages/ReviewingPage.js`
  - `/Users/pavanmreddy/Downloads/hassan/src/pages/FindingsPage.js`
- Components:
  - `/Users/pavanmreddy/Downloads/hassan/src/components/DocViewerTab.js`
  - `/Users/pavanmreddy/Downloads/hassan/src/components/ScanOverlay.js`
  - `/Users/pavanmreddy/Downloads/hassan/src/components/RedlineOverlay.js`
  - `/Users/pavanmreddy/Downloads/hassan/src/components/LogConsole.js`
  - `/Users/pavanmreddy/Downloads/hassan/src/components/Toast.js`
  - `/Users/pavanmreddy/Downloads/hassan/src/components/PageRenderers.js`

## Where to edit

### Split behavior

Edit:
- `/Users/pavanmreddy/Downloads/hassan/src/data/mockPackage.js`

Key functions:
- `splitUploadedFiles(fileNames)`
- `buildDoc(...)`
- `makeInitialQueue(docs)`
- Single-package deterministic split currently maps PDF pages 1-19 into section docs in `SINGLE_PACKAGE_SPLIT`.

### Doc templates and page visuals

Edit:
- `/Users/pavanmreddy/Downloads/hassan/src/components/PageRenderers.js`

This controls blueprint/checklist/structural/site/detail SVG templates.

### Findings and redline coordinates

Edit:
- `/Users/pavanmreddy/Downloads/hassan/src/data/mockPackage.js`

Key area:
- `makeFindingsForPage(...)`

Overlay coordinates are percentage-based:
- `x`, `y`, `w`, `h`

### Review logs and rule widget behavior

Edit:
- `/Users/pavanmreddy/Downloads/hassan/src/app.js`

Key area:
- `runReviewSimulation(...)`

## Notes

- Upload input accepts single or multiple PDFs for naming/UI only.
- “Import from Drive” is simulated (no OAuth).
- “Download reviewed package” is simulated (toast only).
