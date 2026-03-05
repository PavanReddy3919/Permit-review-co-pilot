# Smart Permit Review AI Demo

Front-end-only interactive demo for a permit document review flow.

## Run locally

No build step required.

1. Start a local static server:
   - `python3 -m http.server 5173`
2. Open:
   - `http://localhost:5173`

## Demo flow

- **Input Package** contains 10 fake permit/city files.
- Click **Import Files**:
  - each file card flies to intake,
  - the **Document Viewer** opens and runs a scanline/sparkle pass,
  - extraction fields are shown,
  - queue updates through `Scanned -> Queued`.
- Review phase runs with progress/status and queue moves `Reviewing -> Done`.
- Reviewed files appear on the right.
- Clicking reviewed output opens the same viewer in **Review Mode** with:
  - `Preview/Redline` toggle,
  - redline overlays,
  - linked review sidebar comments that pulse/focus marks.

## Project files

- Main page:
  - `/Users/pavanmreddy/Downloads/hassan/index.html`
- Main app state/timers/flow:
  - `/Users/pavanmreddy/Downloads/hassan/app.js`
- Styling/animations:
  - `/Users/pavanmreddy/Downloads/hassan/styles.css`
- Document data model:
  - `/Users/pavanmreddy/Downloads/hassan/data/documents.js`
- Real PDF page snapshots used in viewer:
  - `/Users/pavanmreddy/Downloads/hassan/assets/pdf-snaps/`
- Extracted PDF comment snippets used in findings:
  - `/Users/pavanmreddy/Downloads/hassan/data/pdf-comments.js`
- Viewer logic (scan + review modes):
  - `/Users/pavanmreddy/Downloads/hassan/components/viewer.js`

## Edit the document model and fake content

### Document list/data model

Edit `DOCUMENTS` in:
- `/Users/pavanmreddy/Downloads/hassan/data/documents.js`

Each doc includes:
- `id`, `name`, `type`, `size`
- `pages` (with `label`, `template`, `imageSrc`)
  - Use `template: "image"` and `imageSrc: "assets/pdf-snaps/page-XX.png"`
- `extractedFields`
- `reviewFindings` (with page link + overlay coordinates)

### Extracted fields per doc type

Edit `extractedFields` per document in:
- `/Users/pavanmreddy/Downloads/hassan/data/documents.js`

### Review findings coordinates/labels

Edit `reviewFindings` in:
- `/Users/pavanmreddy/Downloads/hassan/data/documents.js`

Coordinate fields are percentages on the page canvas:
- `x`, `y`, `w`, `h`
- Some finding text is sourced from extracted PDF annotations/comments via `PDF_COMMENTS` in `/Users/pavanmreddy/Downloads/hassan/data/pdf-comments.js`.

### Scan callout text

Edit `SCAN_CALLOUTS` in:
- `/Users/pavanmreddy/Downloads/hassan/data/documents.js`

### Status log steps

Edit `STATUS_STEPS` in:
- `/Users/pavanmreddy/Downloads/hassan/data/documents.js`

## Host on GitHub Pages

1. Initialize and push:
   - `git init`
   - `git add .`
   - `git commit -m "Permit review viewer + redline demo"`
   - `git branch -M main`
   - `git remote add origin <your-repo-url>`
   - `git push -u origin main`
2. In GitHub repo: `Settings -> Pages`
3. Source: `Deploy from a branch`
4. Branch: `main`, folder `/ (root)`
5. Save and wait for publish.

Site URL pattern:
- `https://<your-username>.github.io/<repo-name>/`
